import React from 'react';
import { AppScreen, QuizResult, Quiz, Answer } from '../types';
import { IconChartBar, IconHome, IconCheckCircle, IconXCircle, IconQuestionMarkCircle, IconInfoCircle } from './icons';

interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz;
  onScreenChange: (screen: AppScreen) => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ result, quiz, onScreenChange }) => {
  const { username, score, correctAnswers, wrongAnswers, unattempted, timeTaken, quizTitle } = result;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };
  
  const getUserAnswerForQuestion = (questionId: string) => {
    return result.answers.find(a => a.questionId === questionId)?.selectedOption || null;
  }

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
      <p className="text-gray-400 mb-6">Here are your results for the {quizTitle}, {username}.</p>
      
      <div className="mb-8 p-6 bg-base-300/50 rounded-2xl shadow-xl border border-base-300">
        <p className="text-lg text-gray-400">Your Final Score</p>
        <p className="text-6xl font-extrabold my-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{score}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-left">
        <div className="bg-base-300/50 p-4 rounded-lg flex items-center gap-4"><IconCheckCircle className="w-8 h-8 text-success flex-shrink-0"/><div><p className="text-gray-400 text-sm">Correct</p><p className="text-2xl font-bold">{correctAnswers}</p></div></div>
        <div className="bg-base-300/50 p-4 rounded-lg flex items-center gap-4"><IconXCircle className="w-8 h-8 text-error flex-shrink-0"/><div><p className="text-gray-400 text-sm">Wrong</p><p className="text-2xl font-bold">{wrongAnswers}</p></div></div>
        <div className="bg-base-300/50 p-4 rounded-lg flex items-center gap-4"><IconQuestionMarkCircle className="w-8 h-8 text-gray-500 flex-shrink-0"/><div><p className="text-gray-400 text-sm">Unattempted</p><p className="text-2xl font-bold">{unattempted}</p></div></div>
        <div className="bg-base-300/50 p-4 rounded-lg flex items-center gap-4"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div><p className="text-gray-400 text-sm">Time Taken</p><p className="text-2xl font-bold">{formatTime(timeTaken)}</p></div></div>
      </div>
      
      <div className="space-y-4 text-left my-12">
        <h3 className="text-2xl font-bold text-center mb-6">Review Your Answers</h3>
        {quiz.questions.map((question, index) => {
            const userAnswer = getUserAnswerForQuestion(question.id);
            const isCorrect = userAnswer === question.correctAnswer;
            const isUnattempted = userAnswer === null;
            
            return (
                <div key={question.id} className="bg-base-300/50 p-4 rounded-lg border border-base-300">
                    <div className="font-semibold text-lg prose" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${question.questionText}` }} />
                    <div className="my-3 space-y-2">
                        {question.options.map((option, oIndex) => {
                            let optionClass = "border-base-300 bg-base-200/50";
                            if (option === question.correctAnswer) {
                                optionClass = "bg-success/20 border-success";
                            } else if (option === userAnswer) {
                                optionClass = "bg-error/20 border-error";
                            }
                            return <div key={oIndex} className={`p-3 rounded-md border prose ${optionClass}`} dangerouslySetInnerHTML={{ __html: option }} />;
                        })}
                    </div>
                    {isUnattempted ? (
                        <p className="text-warning text-sm">You did not attempt this question. The correct answer was: <span dangerouslySetInnerHTML={{__html: question.correctAnswer}} /></p>
                    ) : !isCorrect && (
                        <p className="text-error text-sm">Your answer was incorrect. The correct answer was: <span dangerouslySetInnerHTML={{__html: question.correctAnswer}} /></p>
                    )}
                    {question.explanation && (
                         <div className="mt-3 p-3 bg-base-200 rounded-md flex items-start gap-3 text-sm text-gray-300">
                             <IconInfoCircle className="w-5 h-5 text-info flex-shrink-0 mt-1"/>
                             <div className="prose" dangerouslySetInnerHTML={{ __html: `<span class="font-bold">Explanation:</span> ${question.explanation}`}} />
                         </div>
                    )}
                </div>
            );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={() => onScreenChange(AppScreen.StudentDashboard)} className="flex items-center gap-2 bg-secondary hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"><IconHome className="w-5 h-5"/> Home</button>
        <button onClick={() => onScreenChange(AppScreen.Leaderboard)} className="flex items-center gap-2 bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-lg transition-colors"><IconChartBar className="w-5 h-5" /> Leaderboard</button>
      </div>
    </div>
  );
};

export default QuizResults;
