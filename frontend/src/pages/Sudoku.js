import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { RotateCcw, Trophy, Timer, Lightbulb, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { generatePuzzle, isValidMove, checkSudokuComplete, getHint } from '../utils/sudokuGenerator';

const Sudoku = () => {
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedCell, setSelectedCell] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const timerRef = React.useRef();
  const { toast } = useToast();

  useEffect(() => {
    generateNewPuzzle();
  }, []);

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

  const generateNewPuzzle = () => {
    const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle(difficulty);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setCurrentGrid(newPuzzle.map(row => [...row]));
    setSelectedCell(null);
    setTimeElapsed(0);
    setGameActive(true);
    setMistakes(0);
    setHintsUsed(0);
    setGameComplete(false);
  };

  const handleCellClick = (row, col) => {
    if (puzzle && puzzle[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (number) => {
    if (!selectedCell || !currentGrid || gameComplete) return;

    const { row, col } = selectedCell;
    if (puzzle[row][col] !== 0) return; // Can't modify original puzzle numbers

    const newGrid = currentGrid.map(r => [...r]);
    
    if (newGrid[row][col] === number) {
      // Remove number if clicking the same number
      newGrid[row][col] = 0;
    } else {
      // Check if the move is valid
      if (isValidMove(newGrid, row, col, number)) {
        newGrid[row][col] = number;
        
        // Check if puzzle is complete
        if (checkSudokuComplete(newGrid)) {
          setGameComplete(true);
          setGameActive(false);
          updateGameStats();
          toast({
            title: "Congratulations! 🎉",
            description: `Puzzle solved in ${formatTime(timeElapsed)} with ${mistakes} mistakes!`,
            duration: 5000
          });
        }
      } else {
        setMistakes(prev => prev + 1);
        toast({
          title: "Invalid Move",
          description: "This number conflicts with Sudoku rules",
          duration: 2000
        });
        return;
      }
    }
    
    setCurrentGrid(newGrid);
  };

  const handleHint = () => {
    if (!puzzle || !solution || hintsUsed >= 3) return;
    
    const hint = getHint(currentGrid, solution);
    if (hint) {
      const newGrid = currentGrid.map(row => [...row]);
      newGrid[hint.row][hint.col] = hint.value;
      setCurrentGrid(newGrid);
      setHintsUsed(prev => prev + 1);
      setSelectedCell({ row: hint.row, col: hint.col });
      
      toast({
        title: "Hint Used",
        description: `Added ${hint.value} to row ${hint.row + 1}, col ${hint.col + 1}`,
        duration: 2000
      });

      // Check if puzzle is complete after hint
      if (checkSudokuComplete(newGrid)) {
        setGameComplete(true);
        setGameActive(false);
        updateGameStats();
      }
    }
  };

  const updateGameStats = () => {
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (!gameScores.sudoku) {
      gameScores.sudoku = { highScore: 0, gamesPlayed: 0, bestTime: 9999 };
    }
    
    gameScores.sudoku.gamesPlayed += 1;
    
    // Score based on time, mistakes, and hints
    const timeBonus = Math.max(0, 1000 - timeElapsed);
    const mistakePenalty = mistakes * 50;
    const hintPenalty = hintsUsed * 100;
    const finalScore = Math.max(0, timeBonus - mistakePenalty - hintPenalty);
    
    if (finalScore > gameScores.sudoku.highScore) {
      gameScores.sudoku.highScore = finalScore;
    }
    
    if (timeElapsed < gameScores.sudoku.bestTime) {
      gameScores.sudoku.bestTime = timeElapsed;
    }
    
    localStorage.setItem('gameScores', JSON.stringify(gameScores));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellClassName = (row, col, value) => {
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col;
    const isOriginal = puzzle && puzzle[row][col] !== 0;
    const isHighlighted = selectedCell && 
      (selectedCell.row === row || selectedCell.col === col || 
       (Math.floor(selectedCell.row / 3) === Math.floor(row / 3) && 
        Math.floor(selectedCell.col / 3) === Math.floor(col / 3)));
    
    let className = `w-10 h-10 border border-gray-300 flex items-center justify-center text-lg font-semibold cursor-pointer transition-all duration-200 `;
    
    if (isSelected) {
      className += 'bg-blue-200 border-blue-500 ';
    } else if (isHighlighted) {
      className += 'bg-blue-50 ';
    } else {
      className += 'bg-white hover:bg-gray-50 ';
    }
    
    if (isOriginal) {
      className += 'text-gray-800 font-bold cursor-not-allowed ';
    } else {
      className += 'text-blue-600 ';
    }
    
    // Thicker borders for 3x3 box separation
    if (row % 3 === 0) className += 'border-t-2 border-t-gray-800 ';
    if (col % 3 === 0) className += 'border-l-2 border-l-gray-800 ';
    if (row === 8) className += 'border-b-2 border-b-gray-800 ';
    if (col === 8) className += 'border-r-2 border-r-gray-800 ';
    
    return className;
  };

  if (!currentGrid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating Sudoku puzzle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🔢 Sudoku</h1>
          <p className="text-gray-600">Fill the 9×9 grid so that each column, row, and 3×3 box contains digits 1-9</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 bg-white rounded-lg overflow-hidden">
                    {currentGrid.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={getCellClassName(rowIndex, colIndex, cell)}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cell !== 0 ? cell : ''}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Number Input Buttons */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-9 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                      <Button
                        key={number}
                        variant="outline"
                        size="sm"
                        className="w-10 h-10 p-0 hover:scale-110 transition-transform"
                        onClick={() => handleNumberInput(number)}
                        disabled={!selectedCell || gameComplete}
                      >
                        {number}
                      </Button>
                    ))}
                  </div>
                </div>

                {gameComplete && (
                  <div className="text-center mt-6 animate-bounce-in">
                    <Badge className="text-lg px-6 py-2 bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Puzzle Solved!
                    </Badge>
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
                  <span>Game Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Timer className="w-3 h-3" />
                    <span>{formatTime(timeElapsed)}</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mistakes:</span>
                  <Badge variant={mistakes > 5 ? "destructive" : "secondary"}>{mistakes}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hints Used:</span>
                  <Badge variant="outline">{hintsUsed}/3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Difficulty:</span>
                  <Badge className="capitalize">{difficulty}</Badge>
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
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (35 clues)</SelectItem>
                      <SelectItem value="medium">Medium (45 clues)</SelectItem>
                      <SelectItem value="hard">Hard (55 clues)</SelectItem>
                      <SelectItem value="expert">Expert (65 clues)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={generateNewPuzzle} 
                    className="w-full hover:scale-105 transition-transform" 
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Puzzle
                  </Button>
                  
                  <Button 
                    onClick={handleHint}
                    variant="outline" 
                    className="w-full hover:scale-105 transition-transform"
                    disabled={hintsUsed >= 3 || gameComplete}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint ({3 - hintsUsed} left)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click a cell to select it</li>
                  <li>• Click number buttons to fill</li>
                  <li>• Each row, column, and 3×3 box must contain 1-9</li>
                  <li>• Use hints if you're stuck (max 3)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sudoku;