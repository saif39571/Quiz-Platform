import React, { useState, useEffect, useCallback } from 'react';
import { AppScreen, Quiz, QuizResult, Question } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import QuizCreator from './components/QuizCreator';
import QuizTaker from './components/QuizTaker';
import QuizResults from './components/QuizResults';
import Leaderboard from './components/Leaderboard';
import { IconBrain, IconBolt, IconUser, IconUserShield } from './components/icons';

const TEACHER_PASS = 'teacher123'; // Simple hardcoded password

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.RoleSelection);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<QuizResult[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedQuizzes = localStorage.getItem('quizzes');
      if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
      const storedLeaderboard = localStorage.getItem('leaderboard');
      if (storedLeaderboard) setLeaderboard(JSON.parse(storedLeaderboard));
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);
  
  const handleTeacherLogin = (password: string) => {
    if (password === TEACHER_PASS) {
      setIsTeacherAuthenticated(true);
      setScreen(AppScreen.TeacherDashboard);
      setAuthError(null);
    } else {
      setAuthError('Incorrect password.');
    }
  };

  const handleSaveQuiz = (quiz: Quiz) => {
    const isEditing = quizzes.some(q => q.id === quiz.id);
    const updatedQuizzes = isEditing 
      ? quizzes.map(q => q.id === quiz.id ? quiz : q)
      : [...quizzes, quiz];
    
    setQuizzes(updatedQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    setQuizToEdit(null);
    setScreen(AppScreen.TeacherDashboard);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setQuizToEdit(quiz);
    setScreen(AppScreen.QuizEditor);
  };
  
  const handleNewQuiz = () => {
    setQuizToEdit(null);
    setScreen(AppScreen.QuizEditor);
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
      setQuizzes(updatedQuizzes);
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setScreen(AppScreen.TakeQuiz);
  };

  const handleQuizComplete = (result: QuizResult) => {
    const updatedLeaderboard = [...leaderboard, result].sort((a, b) => b.score - a.score);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
    setLastResult(result);
    setScreen(AppScreen.Results);
  };

  const goHome = () => {
    setIsTeacherAuthenticated(false);
    setScreen(AppScreen.RoleSelection);
  };
  
  const TeacherLoginScreen = () => (
    <div className="text-center">
        <button onClick={goHome} className="flex items-center gap-2 mb-6 text-primary hover:text-primary-focus transition-colors">
            <IconUser className="w-5 h-5" /> Switch Role
        </button>
        <h2 className="text-3xl font-bold mb-4">Teacher Login</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleTeacherLogin(e.currentTarget.password.value); }} className="max-w-sm mx-auto">
            <input name="password" type="password" placeholder="Enter password" className="w-full bg-base-300 border border-base-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-primary focus:border-primary" required />
            {authError && <p className="text-error mb-4">{authError}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-glow-primary transition-all">Login</button>
        </form>
    </div>
  );

  const RoleSelectionScreen = () => (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">Choose Your Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setScreen(AppScreen.TeacherLogin)} className="bg-base-300/50 border border-base-300 hover:border-primary p-8 rounded-xl flex flex-col items-center justify-center gap-4 transform hover:-translate-y-1 transition-all duration-300">
                <IconUserShield className="w-16 h-16 text-primary"/>
                <span className="text-2xl font-semibold">Teacher</span>
            </button>
            <button onClick={() => setScreen(AppScreen.StudentDashboard)} className="bg-base-300/50 border border-base-300 hover:border-accent p-8 rounded-xl flex flex-col items-center justify-center gap-4 transform hover:-translate-y-1 transition-all duration-300">
                <IconUser className="w-16 h-16 text-accent"/>
                <span className="text-2xl font-semibold">Student</span>
            </button>
        </div>
      </div>
  );

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.RoleSelection: return <RoleSelectionScreen />;
      case AppScreen.TeacherLogin: return <TeacherLoginScreen />;
      case AppScreen.TeacherDashboard: return <WelcomeScreen mode="teacher" quizzes={quizzes} onNewQuiz={handleNewQuiz} onEditQuiz={handleEditQuiz} onDeleteQuiz={handleDeleteQuiz} onShowLeaderboard={() => setScreen(AppScreen.Leaderboard)} onBack={goHome} />;
      case AppScreen.StudentDashboard: return <WelcomeScreen mode="student" quizzes={quizzes} onStartQuiz={handleStartQuiz} onShowLeaderboard={() => setScreen(AppScreen.Leaderboard)} onBack={goHome} />;
      case AppScreen.QuizEditor: return <QuizCreator onSave={handleSaveQuiz} existingQuiz={quizToEdit} onBack={() => setScreen(AppScreen.TeacherDashboard)} />;
      case AppScreen.TakeQuiz: return selectedQuiz && <QuizTaker quiz={selectedQuiz} onQuizComplete={handleQuizComplete} />;
      case AppScreen.Results: return lastResult && <QuizResults result={lastResult} quiz={quizzes.find(q => q.id === lastResult.quizId)!} onScreenChange={setScreen} />;
      case AppScreen.Leaderboard: return <Leaderboard results={leaderboard} onBack={() => isTeacherAuthenticated ? setScreen(AppScreen.TeacherDashboard) : setScreen(AppScreen.StudentDashboard)} />;
      default: return <RoleSelectionScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-4">
            <IconBrain className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-extrabold text-gray-100">Quiz Master</h1>
            <IconBolt className="w-12 h-12 text-accent" />
          </div>
        </header>
        <main className="bg-base-200/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-base-300 w-full animate-slide-in">
            {renderScreen()}
        </main>
      </div>
    </div>
  );
};

export default App;