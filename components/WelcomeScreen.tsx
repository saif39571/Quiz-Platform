import React from 'react';
import { AppScreen, Quiz } from '../types';
import { IconChartBar, IconPlus, IconChevronRight, IconPencil, IconTrash, IconArrowLeft } from './icons';

interface WelcomeScreenProps {
  mode: 'student' | 'teacher';
  quizzes: Quiz[];
  onStartQuiz?: (quiz: Quiz) => void;
  onNewQuiz?: () => void;
  onEditQuiz?: (quiz: Quiz) => void;
  onDeleteQuiz?: (quizId: string) => void;
  onShowLeaderboard: () => void;
  onBack: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ mode, quizzes, onStartQuiz, onNewQuiz, onEditQuiz, onDeleteQuiz, onShowLeaderboard, onBack }) => {
  return (
    <div className="space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 mb-2 text-primary hover:text-primary-focus transition-colors">
        <IconArrowLeft className="w-5 h-5" />
        Back to Role Selection
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mode === 'teacher' && onNewQuiz && (
            <button
            onClick={onNewQuiz}
            className="bg-primary hover:bg-primary-focus text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-glow-primary transition-all duration-300 flex items-center justify-center space-x-3 text-lg"
            >
            <IconPlus className="w-6 h-6" />
            <span>Create New Quiz</span>
            </button>
        )}
        <button
          onClick={onShowLeaderboard}
          className={`bg-secondary hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 text-lg ${mode === 'student' ? 'md:col-span-2' : ''}`}
        >
          <IconChartBar className="w-6 h-6" />
          <span>View Leaderboard</span>
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-300">{mode === 'teacher' ? 'Manage Quizzes' : 'Available Quizzes'}</h2>
        <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-2">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => {
              const totalMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
              return (
              <div
                key={quiz.id}
                onClick={() => mode === 'student' && onStartQuiz?.(quiz)}
                className={`bg-base-300/70 p-4 rounded-lg flex justify-between items-center border border-transparent transition-all duration-200 ${mode === 'student' ? 'cursor-pointer hover:border-primary hover:bg-base-300' : ''}`}
              >
                <div>
                  <h3 className="font-semibold text-lg text-gray-100">{quiz.title}</h3>
                  <p className="text-sm text-gray-400">
                    {quiz.questions.length} Qs &bull; {totalMarks} Marks &bull; {quiz.timeLimit} min &bull; Neg: {quiz.negativeMarking}
                  </p>
                </div>
                {mode === 'student' && <IconChevronRight className="w-6 h-6 text-gray-400" />}
                {mode === 'teacher' && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEditQuiz?.(quiz)} className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-base-200"><IconPencil className="w-5 h-5"/></button>
                        <button onClick={() => onDeleteQuiz?.(quiz.id)} className="p-2 text-error hover:text-rose-500 rounded-full hover:bg-base-200"><IconTrash className="w-5 h-5"/></button>
                    </div>
                )}
              </div>
            )})
          ) : (
            <div className="text-center text-gray-500 py-8 border-2 border-dashed border-base-300 rounded-lg">
                <p>{mode === 'teacher' ? 'No quizzes found. Create one to get started!' : 'No quizzes available right now.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;