import React, { useState, useEffect } from 'react';
import { Quiz, Answer, QuizResult } from '../types';
import { useTimer } from '../hooks/useTimer';
import { IconClock, IconCheck } from './icons';

interface QuizTakerProps {
  quiz: Quiz;
  onQuizComplete: (result: QuizResult) => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onQuizComplete }) => {
  const [username, setUsername] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  const totalTime = quiz.timeLimit * 60;

  const handleSubmit = () => {
    if (!isStarted) return;

    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    
    quiz.questions.forEach((q) => {
      const userAnswer = answers.find(a => a.questionId === q.id);
      if (userAnswer && userAnswer.selectedOption) {
        if (userAnswer.selectedOption === q.correctAnswer) {
          score += q.marks || 1;
          correctAnswers++;
        } else {
          score -= quiz.negativeMarking;
          wrongAnswers++;
        }
      }
    });

    const result: QuizResult = {
      username: username || 'Anonymous',
      quizTitle: quiz.title,
      quizId: quiz.id,
      score,
      correctAnswers,
      wrongAnswers,
      unattempted: quiz.questions.length - (correctAnswers + wrongAnswers),
      timeTaken: totalTime - timeLeft,
      answers,
    };
    onQuizComplete(result);
  };
  
  const { timeLeft, formattedTime } = useTimer(totalTime, handleSubmit);

  useEffect(() => {
    if (isStarted) {
      setAnswers(quiz.questions.map(q => ({ questionId: q.id, selectedOption: null })));
    }
  }, [quiz.questions, isStarted]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(a =>
        a.questionId === questionId ? { ...a, selectedOption: option } : a
      )
    );
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsStarted(true);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center animate-fade-in">
        <h2 className="text-3xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-gray-400 mb-6">Enter your name to begin.</p>
        <form onSubmit={handleStart} className="w-full max-w-sm">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your Name"
            className="w-full bg-base-300 border border-base-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
          <button type="submit" className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-glow-primary transition-all">
            Start Quiz
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-base-300 sticky top-0 bg-base-200/80 backdrop-blur-sm py-4 z-10">
        <h2 className="text-2xl font-bold">{quiz.title}</h2>
        <div className="flex items-center gap-2 text-lg font-mono px-4 py-2 bg-error/20 text-error rounded-lg">
          <IconClock className="w-6 h-6" />
          <span>{formattedTime}</span>
        </div>
      </div>
      
      <div className="space-y-8">
        {quiz.questions.map((question, index) => {
            const currentAnswer = answers.find(a => a.questionId === question.id)?.selectedOption;
            return (
                <div key={question.id} className="bg-base-300/50 border border-base-300 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-400 font-medium">Question {index + 1}</p>
                        <p className="text-sm font-semibold bg-secondary px-2 py-1 rounded-md">{question.marks || 1} {question.marks > 1 ? 'Marks' : 'Mark'}</p>
                    </div>
                    <div className="text-xl font-semibold mb-4 prose" dangerouslySetInnerHTML={{ __html: question.questionText }}></div>
                    <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                        <div
                            key={oIndex}
                            onClick={() => handleOptionSelect(question.id, option)}
                            className={`prose block w-full text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                            currentAnswer === option
                                ? 'bg-primary/20 border-primary'
                                : 'bg-base-200 border-base-300 hover:bg-base-300 hover:border-gray-600'
                            }`}
                             dangerouslySetInnerHTML={{ __html: option }}
                        >
                        </div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-base-300">
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-glow-accent transition-all text-lg"
        >
          <IconCheck className="w-6 h-6" />
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizTaker;
