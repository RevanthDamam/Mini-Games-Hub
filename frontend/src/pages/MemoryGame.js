import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { RotateCcw, Trophy, Timer, Eye, Target } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gridSize, setGridSize] = useState('4x4');
  const [highScore, setHighScore] = useState({ moves: 999, time: 999 });
  const timerRef = React.useRef();
  const { toast } = useToast();

  const cardEmojis = {
    '4x4': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    '6x6': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐧', '🦄', '🐺', '🦝', '🦔'],
    '8x8': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐧', '🦄', '🐺', '🦝', '🦔', '🐻‍❄️', '🐅', '🦒', '🦓', '🐃', '🐄', '🐷', '🐽', '🐗', '🐪', '🐫', '🦙', '🦘', '🐘']
  };

  const getGridDimensions = (size) => {
    switch (size) {
      case '4x4': return { rows: 4, cols: 4, pairs: 8 };
      case '6x6': return { rows: 6, cols: 6, pairs: 18 };
      case '8x8': return { rows: 8, cols: 8, pairs: 32 };
      default: return { rows: 4, cols: 4, pairs: 8 };
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const initializeGame = useCallback(() => {
    const { pairs } = getGridDimensions(gridSize);
    const selectedEmojis = cardEmojis[gridSize].slice(0, pairs);
    const gameCards = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(shuffleArray(gameCards));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTimeElapsed(0);
    setGameActive(false);
    setGameComplete(false);
  }, [gridSize]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameActive && !gameComplete) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameActive, gameComplete]);

  useEffect(() => {
    // Load high scores
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (gameScores.memory) {
      setHighScore({
        moves: gameScores.memory.bestMoves || 999,
        time: gameScores.memory.bestTime || 999
      });
    }
  }, []);

  const handleCardClick = (cardId) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
      return;
    }

    if (!gameActive && flippedCards.length === 0) {
      setGameActive(true);
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        const newMatchedCards = [...matchedCards, firstId, secondId];
        setMatchedCards(newMatchedCards);
        setFlippedCards([]);

        // Check if game is complete
        if (newMatchedCards.length === cards.length) {
          setGameComplete(true);
          setGameActive(false);
          updateGameStats();
          
          toast({
            title: "Congratulations! 🎉",
            description: `Completed in ${moves + 1} moves and ${formatTime(timeElapsed)}!`,
            duration: 4000
          });
        }
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const updateGameStats = () => {
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (!gameScores.memory) {
      gameScores.memory = { highScore: 0, gamesPlayed: 0, bestMoves: 999, bestTime: 999 };
    }
    
    gameScores.memory.gamesPlayed += 1;
    
    // Calculate score based on moves and time
    const score = Math.max(0, 1000 - (moves * 10) - timeElapsed);
    if (score > gameScores.memory.highScore) {
      gameScores.memory.highScore = score;
    }
    
    if (moves < gameScores.memory.bestMoves) {
      gameScores.memory.bestMoves = moves;
      setHighScore(prev => ({ ...prev, moves }));
      toast({
        title: "New Best Moves! 🏆",
        description: `Completed in only ${moves} moves!`,
        duration: 3000
      });
    }
    
    if (timeElapsed < gameScores.memory.bestTime) {
      gameScores.memory.bestTime = timeElapsed;
      setHighScore(prev => ({ ...prev, time: timeElapsed }));
      toast({
        title: "New Best Time! ⏱️",
        description: `Completed in ${formatTime(timeElapsed)}!`,
        duration: 3000
      });
    }
    
    localStorage.setItem('gameScores', JSON.stringify(gameScores));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetGame = () => {
    initializeGame();
  };

  const isCardVisible = (cardId) => {
    return flippedCards.includes(cardId) || matchedCards.includes(cardId);
  };

  const { rows, cols } = getGridDimensions(gridSize);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎴 Memory Match</h1>
          <p className="text-gray-600">Flip cards to find matching pairs. Complete the board in minimum moves!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <div 
                    className="game-board grid gap-2"
                    style={{ 
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      maxWidth: '600px',
                      width: '100%'
                    }}
                  >
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        className={`card-flip relative cursor-pointer ${
                          isCardVisible(card.id) ? 'flipped' : ''
                        }`}
                        onClick={() => handleCardClick(card.id)}
                        style={{ aspectRatio: '1/1' }}
                      >
                        {/* Card Back */}
                        <div className="card-front absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-white text-xl font-bold border-2 border-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-200">
                          ?
                        </div>
                        
                        {/* Card Front */}
                        <div className={`card-back absolute inset-0 bg-white rounded-lg flex items-center justify-center text-2xl border-2 transition-all duration-200 ${
                          matchedCards.includes(card.id) 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-blue-400 bg-blue-50'
                        }`}>
                          {card.emoji}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {gameComplete && (
                  <div className="text-center mt-6 animate-bounce-in">
                    <Badge className="text-lg px-6 py-2 bg-green-100 text-green-800 mb-4">
                      🎉 Puzzle Complete!
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Completed in {moves} moves and {formatTime(timeElapsed)}
                    </div>
                  </div>
                )}
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
                  <span className="text-gray-600">Moves:</span>
                  <Badge className="text-lg px-3">{moves}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Timer className="w-3 h-3" />
                    <span>{formatTime(timeElapsed)}</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pairs Found:</span>
                  <Badge variant="secondary">{matchedCards.length / 2}/{cards.length / 2}</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(matchedCards.length / cards.length) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Best</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Best Moves:</span>
                  </div>
                  <Badge variant="outline">{highScore.moves === 999 ? '-' : highScore.moves}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Best Time:</span>
                  </div>
                  <Badge variant="outline">
                    {highScore.time === 999 ? '-' : formatTime(highScore.time)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Grid Size:</label>
                  <Select value={gridSize} onValueChange={setGridSize} disabled={gameActive}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4x4">4×4 (8 pairs)</SelectItem>
                      <SelectItem value="6x6">6×6 (18 pairs)</SelectItem>
                      <SelectItem value="8x8">8×8 (32 pairs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={resetGame} 
                  className="w-full hover:scale-105 transition-transform" 
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Game
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click cards to flip them</li>
                  <li>• Find matching pairs</li>
                  <li>• Complete in minimum moves</li>
                  <li>• Challenge different grid sizes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;