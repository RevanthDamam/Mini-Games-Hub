import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { RotateCcw, Trophy, Brain, User } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState('medium');
  const [scores, setScores] = useState({ player: 0, ai: 0, ties: 0 });
  const [gameActive, setGameActive] = useState(true);
  const { toast } = useToast();

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (squares) => {
    for (let line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    if (squares.every(square => square !== null)) {
      return { winner: 'tie', line: null };
    }
    return null;
  };

  const updateGameStats = (result) => {
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (!gameScores.tictactoe) {
      gameScores.tictactoe = { highScore: 0, gamesPlayed: 0, wins: 0 };
    }
    
    gameScores.tictactoe.gamesPlayed += 1;
    if (result === 'X') {
      gameScores.tictactoe.wins += 1;
      gameScores.tictactoe.highScore = gameScores.tictactoe.wins;
    }
    
    localStorage.setItem('gameScores', JSON.stringify(gameScores));
  };

  const getAIMove = (squares, difficulty) => {
    const available = squares.map((square, index) => square === null ? index : null).filter(val => val !== null);
    
    if (difficulty === 'easy') {
      return available[Math.floor(Math.random() * available.length)];
    }
    
    if (difficulty === 'medium' || difficulty === 'hard') {
      // Check for winning move
      for (let move of available) {
        const testBoard = [...squares];
        testBoard[move] = 'O';
        if (checkWinner(testBoard)?.winner === 'O') {
          return move;
        }
      }
      
      // Check for blocking move
      for (let move of available) {
        const testBoard = [...squares];
        testBoard[move] = 'X';
        if (checkWinner(testBoard)?.winner === 'X') {
          return move;
        }
      }
      
      if (difficulty === 'hard') {
        // Prefer center, then corners, then edges
        const center = 4;
        const corners = [0, 2, 6, 8];
        const edges = [1, 3, 5, 7];
        
        if (available.includes(center)) return center;
        for (let corner of corners) {
          if (available.includes(corner)) return corner;
        }
        for (let edge of edges) {
          if (available.includes(edge)) return edge;
        }
      }
      
      return available[Math.floor(Math.random() * available.length)];
    }
    
    return available[Math.floor(Math.random() * available.length)];
  };

  const handleClick = (index) => {
    if (board[index] || winner || !isXNext || !gameActive) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      setGameActive(false);
      
      if (gameResult.winner === 'X') {
        setScores(prev => ({ ...prev, player: prev.player + 1 }));
        updateGameStats('X');
        toast({
          title: "You Win! 🎉",
          description: "Great strategy!",
          duration: 2000
        });
      } else if (gameResult.winner === 'tie') {
        setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
        updateGameStats('tie');
        toast({
          title: "It's a Tie! 🤝",
          description: "Well played by both!",
          duration: 2000
        });
      }
      return;
    }

    // AI move
    setTimeout(() => {
      const aiMove = getAIMove(newBoard, gameMode);
      if (aiMove !== undefined) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);
        setIsXNext(true);

        const aiGameResult = checkWinner(aiBoard);
        if (aiGameResult) {
          setWinner(aiGameResult);
          setGameActive(false);
          
          if (aiGameResult.winner === 'O') {
            setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
            updateGameStats('O');
            toast({
              title: "AI Wins! 🤖",
              description: "Try again!",
              duration: 2000
            });
          } else if (aiGameResult.winner === 'tie') {
            setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
            updateGameStats('tie');
            toast({
              title: "It's a Tie! 🤝",
              description: "Well played by both!",
              duration: 2000
            });
          }
        }
      }
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameActive(true);
  };

  const resetScores = () => {
    setScores({ player: 0, ai: 0, ties: 0 });
  };

  useEffect(() => {
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (gameScores.tictactoe) {
      setScores(prev => ({ ...prev, player: gameScores.tictactoe.wins || 0 }));
    }
  }, []);

  const renderSquare = (index) => {
    const isWinningSquare = winner?.line?.includes(index);
    
    return (
      <button
        key={index}
        className={`game-cell w-20 h-20 border-2 border-gray-300 text-3xl font-bold 
          ${board[index] === 'X' ? 'text-blue-600' : 'text-red-600'}
          ${isWinningSquare ? 'bg-green-100 border-green-400' : 'bg-white hover:bg-gray-50'}
          ${!board[index] && gameActive && isXNext ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed'}
          transition-all duration-200 flex items-center justify-center`}
        onClick={() => handleClick(index)}
      >
        {board[index]}
      </button>
    );
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">⭕ Tic Tac Toe</h1>
          <p className="text-gray-600">Challenge the AI in this classic strategy game!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center">
                    {winner ? (
                      <div className="animate-bounce-in">
                        {winner.winner === 'X' && (
                          <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                            🎉 You Win!
                          </Badge>
                        )}
                        {winner.winner === 'O' && (
                          <Badge className="text-lg px-4 py-2 bg-red-100 text-red-800">
                            🤖 AI Wins!
                          </Badge>
                        )}
                        {winner.winner === 'tie' && (
                          <Badge className="text-lg px-4 py-2 bg-gray-100 text-gray-800">
                            🤝 It's a Tie!
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        {isXNext ? '🟦 Your Turn (X)' : '🤖 AI Thinking... (O)'}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 game-board">
                    {Array(9).fill(null).map((_, index) => renderSquare(index))}
                  </div>

                  <Button 
                    onClick={resetGame} 
                    className="hover:scale-105 transition-transform"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Game
                  </Button>
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
                  <span>Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">You:</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-3">{scores.player}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600">AI:</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800 text-lg px-3">{scores.ai}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ties:</span>
                  <Badge variant="outline" className="text-lg px-3">{scores.ties}</Badge>
                </div>
                <Button 
                  onClick={resetScores} 
                  variant="outline" 
                  size="sm" 
                  className="w-full hover:scale-105 transition-transform"
                >
                  Reset Scores
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={gameMode} onValueChange={setGameMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (Random moves)</SelectItem>
                    <SelectItem value="medium">Medium (Basic strategy)</SelectItem>
                    <SelectItem value="hard">Hard (Smart AI)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-2">
                  {gameMode === 'easy' && 'AI makes random moves'}
                  {gameMode === 'medium' && 'AI tries to win and block'}
                  {gameMode === 'hard' && 'AI uses advanced strategy'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You are X, AI is O</li>
                  <li>• Get 3 in a row to win</li>
                  <li>• Choose AI difficulty</li>
                  <li>• Try to beat the AI!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;