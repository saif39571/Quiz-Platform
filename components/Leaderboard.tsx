import React from 'react';
import { QuizResult } from '../types';
import { IconArrowLeft, IconTrophy } from './icons';

interface LeaderboardProps {
  results: QuizResult[];
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ results, onBack }) => {
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-slate-300';
      case 2: return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-primary hover:text-primary-focus transition-colors">
        <IconArrowLeft className="w-5 h-5" />
        Back
      </button>
      <h2 className="text-3xl font-bold text-center mb-6">Leaderboard</h2>
      
      <div className="bg-base-300/50 rounded-xl shadow-lg border border-base-300">
        <div className="grid grid-cols-12 gap-4 font-bold p-4 border-b border-base-300 text-gray-400 text-sm">
          <div className="col-span-1">Rank</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Quiz</div>
          <div className="col-span-1 text-center">Correct</div>
          <div className="col-span-1 text-center">Wrong</div>
          <div className="col-span-1 text-center">Attempted</div>
          <div className="col-span-2 text-right">Score</div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {sortedResults.length > 0 ? (
            sortedResults.map((result, index) => (
              <div
                key={`${result.username}-${index}`}
                className="grid grid-cols-12 gap-4 p-4 border-b border-base-300 last:border-b-0 hover:bg-base-300/50 transition-colors items-center"
              >
                <div className={`col-span-1 font-bold text-xl ${getRankColor(index)} flex items-center gap-2`}>
                  {index < 3 && <IconTrophy className="w-6 h-6"/>}
                  <span>{index + 1}</span>
                </div>
                <div className="col-span-3 truncate font-semibold">{result.username}</div>
                <div className="col-span-3 truncate text-sm text-gray-400">{result.quizTitle}</div>
                <div className="col-span-1 text-center font-medium text-success">{result.correctAnswers}</div>
                <div className="col-span-1 text-center font-medium text-error">{result.wrongAnswers}</div>
                <div className="col-span-1 text-center font-medium">{result.correctAnswers + result.wrongAnswers}</div>
                <div className="col-span-2 text-right font-semibold text-xl">{result.score}</div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-12">No results yet. Take a quiz to appear on the leaderboard!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
