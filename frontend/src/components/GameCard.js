import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Clock, Target } from 'lucide-react';

const GameCard = ({ game }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(game.path);
  };

  const getScoreData = () => {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    return scores[game.id] || { highScore: 0, gamesPlayed: 0, bestTime: 0 };
  };

  const scoreData = getScoreData();

  return (
    <Card 
      className="group cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-2 hover:border-purple-300 overflow-hidden"
      onClick={handleClick}
    >
      <CardHeader className="relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
        <div className="flex items-center justify-between">
          <div className="text-3xl">{game.icon}</div>
          <Badge variant="secondary" className="group-hover:bg-purple-100">
            {game.category}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
          {game.title}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {game.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Trophy className="w-4 h-4" />
            <span>{scoreData.highScore}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>{scoreData.gamesPlayed} played</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 group-hover:bg-purple-200 transition-colors">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((scoreData.gamesPlayed / 10) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Progress: {scoreData.gamesPlayed}/10 games</p>
      </CardContent>
    </Card>
  );
};

export default GameCard;