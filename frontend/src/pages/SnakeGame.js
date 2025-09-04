import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Play, Pause, RotateCcw, Trophy, Timer } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const BOARD_SIZE = 20;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const gameLoopRef = useRef();
  const timerRef = useRef();
  const { toast } = useToast();

  const speeds = {
    easy: 200,
    medium: 150,
    hard: 100,
    insane: 70
  };

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
      attempts++;
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y) && attempts < 100);
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection({ x: 0, y: -1 });
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setTimeElapsed(0);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const updateScore = (newScore) => {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (!scores.snake) {
      scores.snake = { highScore: 0, gamesPlayed: 0, bestTime: 0 };
    }
    
    scores.snake.gamesPlayed += 1;
    if (newScore > scores.snake.highScore) {
      scores.snake.highScore = newScore;
      setHighScore(newScore);
      toast({
        title: "New High Score! 🎉",
        description: `Amazing! You scored ${newScore} points!`,
        duration: 3000
      });
    }
    
    localStorage.setItem('gameScores', JSON.stringify(scores));
  };

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return;

    setSnake(currentSnake => {
      // Don't move if direction is not set (initial state)
      if (direction.x === 0 && direction.y === 0) return currentSnake;
      
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setGameStarted(false);
        updateScore(score);
        return currentSnake;
      }

      // Check self collision (only with body, not head)
      if (newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setGameStarted(false);
        updateScore(score);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, gameStarted, gameOver, food, score, generateFood, updateScore]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Prevent default behavior for arrow keys to stop page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (!gameStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speeds[difficulty]);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, moveSnake, difficulty]);

  // Separate timer effect
  useEffect(() => {
    if (gameStarted && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (scores.snake?.highScore) {
      setHighScore(scores.snake.highScore);
    }
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  const pauseGame = () => {
    setGameStarted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🐍 Snake Game</h1>
          <p className="text-gray-600">Use arrow keys to control the snake. Eat food to grow and score points!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div 
                  className="relative bg-gradient-to-br from-green-100 to-green-200 rounded-lg mx-auto game-board"
                  style={{ 
                    width: `${BOARD_SIZE * 20}px`, 
                    height: `${BOARD_SIZE * 20}px`,
                    maxWidth: '100%',
                    aspectRatio: '1/1'
                  }}
                >
                  {/* Snake */}
                  {snake.map((segment, index) => (
                    <div
                      key={index}
                      className={`absolute transition-all duration-100 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 border-2 border-green-800' 
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                      } rounded-md`}
                      style={{
                        left: `${segment.x * 20}px`,
                        top: `${segment.y * 20}px`,
                        width: '18px',
                        height: '18px',
                        zIndex: 10
                      }}
                    />
                  ))}
                  
                  {/* Food */}
                  <div
                    className="absolute bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse-glow border-2 border-red-700"
                    style={{
                      left: `${food.x * 20 + 1}px`,
                      top: `${food.y * 20 + 1}px`,
                      width: '16px',
                      height: '16px',
                      zIndex: 5
                    }}
                  />

                  {gameOver && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="text-center bg-white p-6 rounded-lg shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h3>
                        <p className="text-gray-600 mb-4">Final Score: {score}</p>
                        <Button onClick={resetGame} className="hover:scale-105 transition-transform">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Play Again
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Score:</span>
                  <Badge variant="secondary" className="text-lg px-3">{score}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">High Score:</span>
                  <Badge variant="outline" className="text-lg px-3">{highScore}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Timer className="w-3 h-3" />
                    <span>{formatTime(timeElapsed)}</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Length:</span>
                  <Badge variant="secondary">{snake.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Difficulty:</label>
                  <Select value={difficulty} onValueChange={setDifficulty} disabled={gameStarted}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (Slow)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard (Fast)</SelectItem>
                      <SelectItem value="insane">Insane (Lightning)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {!gameStarted ? (
                    <Button onClick={startGame} className="w-full hover:scale-105 transition-transform" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  ) : (
                    <Button onClick={pauseGame} variant="outline" className="w-full hover:scale-105 transition-transform" size="lg">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button onClick={resetGame} variant="outline" className="w-full hover:scale-105 transition-transform">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use arrow keys to move</li>
                  <li>• Eat red food to grow</li>
                  <li>• Avoid walls and yourself</li>
                  <li>• Higher difficulty = faster speed</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;