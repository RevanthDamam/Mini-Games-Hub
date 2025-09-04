import React, { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Gamepad2, Trophy, Clock, Star } from 'lucide-react';

const Home = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  
  const games = [
    {
      id: 'snake',
      title: 'Snake Game',
      description: 'Classic snake game with custom difficulty levels',
      icon: '🐍',
      category: 'Arcade',
      path: '/snake'
    },
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe',
      description: 'Strategic 3x3 grid game against smart AI',
      icon: '⭕',
      category: 'Strategy',
      path: '/tictactoe'
    },
    {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'Number puzzle with multiple difficulty levels',
      icon: '🔢',
      category: 'Puzzle',
      path: '/sudoku'
    },
    {
      id: 'rps',
      title: 'Rock Paper Scissors',
      description: 'Best-of-5 classic hand game',
      icon: '✂️',
      category: 'Classic',
      path: '/rps'
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Card matching game with customizable grid sizes',
      icon: '🎴',
      category: 'Memory',
      path: '/memory'
    }
  ];

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    let total = 0;
    let games = 0;
    
    Object.values(scores).forEach(score => {
      total += score.highScore || 0;
      games += score.gamesPlayed || 0;
    });
    
    setTotalScore(total);
    setTotalGames(games);
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 animate-bounce">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Mini Games Hub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Challenge yourself with our collection of classic games. Customize difficulty, track scores, and compete against smart AI opponents!
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Score</CardTitle>
              <Trophy className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalScore.toLocaleString()}</div>
              <p className="text-xs text-blue-600">Across all games</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Games Played</CardTitle>
              <Gamepad2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{totalGames}</div>
              <p className="text-xs text-green-600">Total matches</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Achievement</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">
                {totalGames >= 50 ? 'Master' : totalGames >= 20 ? 'Expert' : totalGames >= 10 ? 'Advanced' : 'Beginner'}
              </div>
              <p className="text-xs text-orange-600">Player level</p>
            </CardContent>
          </Card>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <div 
              key={game.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Ready to challenge yourself?</p>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            Pick a game and start playing!
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Home;