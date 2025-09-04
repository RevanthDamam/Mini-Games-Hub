import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { RotateCcw, Trophy, Users, Bot } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameResult, setGameResult] = useState('');
  const [matchResult, setMatchResult] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const { toast } = useToast();

  const choices = [
    { name: 'rock', emoji: '🪨', label: 'Rock' },
    { name: 'paper', emoji: '📄', label: 'Paper' },
    { name: 'scissors', emoji: '✂️', label: 'Scissors' }
  ];

  const getRandomChoice = () => {
    return choices[Math.floor(Math.random() * choices.length)].name;
  };

  const determineWinner = (player, computer) => {
    if (player === computer) return 'tie';
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'player';
    }
    
    return 'computer';
  };

  const playRound = (choice) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setPlayerChoice(choice);
    
    // Add suspense with delayed computer choice
    setTimeout(() => {
      const compChoice = getRandomChoice();
      setComputerChoice(compChoice);
      
      const winner = determineWinner(choice, compChoice);
      
      let resultText = '';
      if (winner === 'tie') {
        resultText = "It's a Tie!";
      } else if (winner === 'player') {
        resultText = 'You Win!';
        setPlayerScore(prev => prev + 1);
      } else {
        resultText = 'Computer Wins!';
        setComputerScore(prev => prev + 1);
      }
      
      setGameResult(resultText);
      
      const newGameEntry = {
        round: round,
        player: choice,
        computer: compChoice,
        result: winner
      };
      
      setGameHistory(prev => [...prev, newGameEntry]);
      setRound(prev => prev + 1);
      
      // Check if match is complete (best of 5)
      const newPlayerScore = winner === 'player' ? playerScore + 1 : playerScore;
      const newComputerScore = winner === 'computer' ? computerScore + 1 : computerScore;
      
      if (newPlayerScore === 3 || newComputerScore === 3) {
        const finalResult = newPlayerScore === 3 ? 'player' : 'computer';
        setMatchResult(finalResult);
        updateGameStats(finalResult);
        
        toast({
          title: finalResult === 'player' ? "🎉 You Won the Match!" : "🤖 Computer Won the Match!",
          description: `Final Score: You ${newPlayerScore} - ${newComputerScore} Computer`,
          duration: 4000
        });
      }
      
      setIsPlaying(false);
    }, 1000);
  };

  const updateGameStats = (winner) => {
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    if (!gameScores.rps) {
      gameScores.rps = { highScore: 0, gamesPlayed: 0, wins: 0 };
    }
    
    gameScores.rps.gamesPlayed += 1;
    if (winner === 'player') {
      gameScores.rps.wins += 1;
      gameScores.rps.highScore = gameScores.rps.wins;
    }
    
    localStorage.setItem('gameScores', JSON.stringify(gameScores));
  };

  const resetGame = () => {
    setPlayerChoice('');
    setComputerChoice('');
    setPlayerScore(0);
    setComputerScore(0);
    setGameHistory([]);
    setGameResult('');
    setMatchResult('');
    setRound(1);
    setIsPlaying(false);
  };

  const getChoiceEmoji = (choice) => {
    const found = choices.find(c => c.name === choice);
    return found ? found.emoji : '❓';
  };

  const getChoiceLabel = (choice) => {
    const found = choices.find(c => c.name === choice);
    return found ? found.label : 'Unknown';
  };

  const isMatchComplete = playerScore === 3 || computerScore === 3;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">✂️ Rock Paper Scissors</h1>
          <p className="text-gray-600">Best of 5 rounds! First to win 3 rounds takes the match!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Arena */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      Round {Math.min(round, 5)}/5
                    </Badge>
                    <Badge className="text-lg px-4 py-2">
                      You {playerScore} - {computerScore} Computer
                    </Badge>
                  </div>

                  {matchResult && (
                    <div className="mb-6 animate-bounce-in">
                      <Badge 
                        className={`text-xl px-6 py-3 ${
                          matchResult === 'player' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {matchResult === 'player' ? '🎉 You Won the Match!' : '🤖 Computer Won the Match!'}
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
                    {/* Player Side */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-600">You</h3>
                      </div>
                      <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-2 transition-transform duration-300 hover:scale-110">
                        {playerChoice ? getChoiceEmoji(playerChoice) : '❓'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {playerChoice ? getChoiceLabel(playerChoice) : 'Choose your move'}
                      </p>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400 mb-4">VS</div>
                      {gameResult && (
                        <Badge 
                          variant="outline" 
                          className={`text-lg px-4 py-2 animate-bounce-in ${
                            gameResult.includes('You Win') ? 'border-green-500 text-green-700' :
                            gameResult.includes('Computer') ? 'border-red-500 text-red-700' :
                            'border-gray-500 text-gray-700'
                          }`}
                        >
                          {gameResult}
                        </Badge>
                      )}
                    </div>

                    {/* Computer Side */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Bot className="w-5 h-5 mr-2 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-600">Computer</h3>
                      </div>
                      <div className={`w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center text-4xl mb-2 transition-transform duration-300 ${
                        isPlaying ? 'animate-spin' : 'hover:scale-110'
                      }`}>
                        {isPlaying ? '🤔' : computerChoice ? getChoiceEmoji(computerChoice) : '❓'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {isPlaying ? 'Thinking...' : computerChoice ? getChoiceLabel(computerChoice) : 'Waiting...'}
                      </p>
                    </div>
                  </div>

                  {/* Choice Buttons */}
                  {!isMatchComplete && (
                    <div className="flex justify-center space-x-4">
                      {choices.map((choice) => (
                        <Button
                          key={choice.name}
                          onClick={() => playRound(choice.name)}
                          disabled={isPlaying}
                          className="flex flex-col items-center p-6 h-auto hover:scale-110 transition-transform duration-200"
                          variant="outline"
                        >
                          <span className="text-3xl mb-2">{choice.emoji}</span>
                          <span className="text-sm">{choice.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}

                  {isMatchComplete && (
                    <Button 
                      onClick={resetGame} 
                      className="hover:scale-105 transition-transform mt-4"
                      size="lg"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      New Match
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info & History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Match Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Your Wins:</span>
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < playerScore ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Computer Wins:</span>
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < computerScore ? 'bg-red-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 mt-4">
                    First to 3 wins takes the match!
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Round History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {gameHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No rounds played yet</p>
                  ) : (
                    gameHistory.slice(-5).reverse().map((game, index) => (
                      <div 
                        key={game.round} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span className="font-medium">R{game.round}</span>
                        <div className="flex items-center space-x-2">
                          <span>{getChoiceEmoji(game.player)}</span>
                          <span className="text-gray-400">vs</span>
                          <span>{getChoiceEmoji(game.computer)}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            game.result === 'player' ? 'text-green-700 border-green-300' :
                            game.result === 'computer' ? 'text-red-700 border-red-300' :
                            'text-gray-700 border-gray-300'
                          }`}
                        >
                          {game.result === 'player' ? 'W' : game.result === 'computer' ? 'L' : 'T'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Game Rules:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rock crushes Scissors</li>
                  <li>• Paper covers Rock</li>
                  <li>• Scissors cuts Paper</li>
                  <li>• Best of 5 rounds wins!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;