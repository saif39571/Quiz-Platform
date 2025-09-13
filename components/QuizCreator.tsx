import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { generateQuizQuestions } from '../services/geminiService';
import { IconArrowLeft, IconBolt, IconPlus, IconTrash, IconUpload } from './icons';
import RichTextEditor from './RichTextEditor';

interface QuizEditorProps {
  onSave: (quiz: Quiz) => void;
  existingQuiz: Quiz | null;
  onBack: () => void;
}

const emptyQuestion = (): Question => ({
  id: `q-${Date.now()}-${Math.random()}`,
  questionText: '',
  options: ['', ''], // Start with 2 options by default
  correctAnswer: '',
  explanation: '',
  marks: 1,
});

const QuizEditor: React.FC<QuizEditorProps> = ({ onSave, existingQuiz, onBack }) => {
  const [quiz, setQuiz] = useState<Omit<Quiz, 'id'>>({
    title: '',
    questions: [emptyQuestion()],
    timeLimit: 10,
    negativeMarking: 0, // Default to 0
  });
  const [quizId, setQuizId] = useState<string>(`quiz-${Date.now()}`);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNegativeMarkingEnabled, setIsNegativeMarkingEnabled] = useState(false);
  const [numOptionsForAI, setNumOptionsForAI] = useState(4);

  useEffect(() => {
    if (existingQuiz) {
      setQuiz(existingQuiz);
      setQuizId(existingQuiz.id);
      setIsNegativeMarkingEnabled(existingQuiz.negativeMarking > 0);
    }
  }, [existingQuiz]);

  const handleQuizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuiz({ ...quiz, [e.target.name]: e.target.value });
  };
  
  const handleNumericQuizChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuiz({ ...quiz, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleToggleNegativeMarking = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setIsNegativeMarkingEnabled(isEnabled);
    if (isEnabled) {
      setQuiz({ ...quiz, negativeMarking: quiz.negativeMarking > 0 ? quiz.negativeMarking : 0.25 });
    } else {
      setQuiz({ ...quiz, negativeMarking: 0 });
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...quiz.questions];
    (newQuestions[index] as any)[field] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };
  
  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    setQuiz({ ...quiz, questions: [...quiz.questions, emptyQuestion()] });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };
  
  const addOption = (qIndex: number) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options.push('');
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...quiz.questions];
    const question = newQuestions[qIndex];
    if (question.options.length <= 2) return; // Must have at least 2 options

    const removedOption = question.options[oIndex];
    question.options.splice(oIndex, 1);

    // If removed option was the correct answer, clear it
    if (question.correctAnswer === removedOption) {
      question.correctAnswer = '';
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleGenerateWithAI = async () => {
      if (!quiz.title) {
          setError("Please provide a quiz topic (title) first.");
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const numToGen = 5; // Generate 5 questions at a time
          const newQuestions = await generateQuizQuestions(quiz.title, numToGen, numOptionsForAI);
          setQuiz(prev => ({ ...prev, questions: [...prev.questions.filter(q => q.questionText), ...newQuestions]}));
      } catch (err) {
          setError("Failed to generate questions with AI.");
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const parsedQuestions: Question[] = lines.map(line => {
                const parts = line.split(',').map(part => part.trim().replace(/^"|"$/g, ''));
                if (parts.length < 4) throw new Error("Each CSV line must have at least a question, two options, and a correct answer.");
                const questionText = parts[0];
                const correctAnswer = parts[parts.length - (parts[parts.length-1].includes(' ') ? 2 : 1)]; // Explanation might be last
                const explanation = parts[parts.length-1].includes(' ') ? parts[parts.length-1] : '';
                const options = parts.slice(1, parts.length - (explanation ? 2:1) + (explanation ? 0:1) );

                if (!options.includes(correctAnswer)) throw new Error(`Correct answer "${correctAnswer}" not found in options for question "${questionText}".`);
                return {
                    id: `q-${Date.now()}-${Math.random()}`,
                    questionText, options, correctAnswer, explanation, marks: 1,
                };
            });
            setQuiz(prev => ({...prev, questions: [...prev.questions.filter(q => q.questionText), ...parsedQuestions]}));
        } catch (err: any) {
            setError(`CSV parsing error: ${err.message}`);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...quiz, id: quizId });
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-primary hover:text-primary-focus transition-colors">
        <IconArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>
      <h2 className="text-3xl font-bold text-center mb-6">{existingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
      {error && <p className="text-center text-error bg-error/20 p-3 rounded-lg mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-base-300/50 p-6 rounded-xl space-y-4 border border-base-300">
            <h3 className="font-bold text-lg">Quiz Details</h3>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">Quiz Title / Topic</label>
                <input type="text" id="title" name="title" value={quiz.title} onChange={handleQuizChange} placeholder="e.g., World History" className="w-full bg-base-200 border border-base-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary" required/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-400 mb-2">Time Limit (minutes)</label>
                    <input type="number" id="timeLimit" name="timeLimit" value={quiz.timeLimit} onChange={handleNumericQuizChange} className="w-full bg-base-200 border border-base-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary" min="1" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                    <input type="checkbox" checked={isNegativeMarkingEnabled} onChange={handleToggleNegativeMarking} className="form-checkbox h-5 w-5 rounded bg-base-200 border-base-300 text-primary focus:ring-primary"/>
                    Enable Negative Marking
                  </label>
                  <input type="number" id="negativeMarking" name="negativeMarking" value={quiz.negativeMarking} onChange={handleNumericQuizChange} className="w-full bg-base-200 border border-base-300 rounded-lg p-3 disabled:opacity-50 disabled:bg-base-300" min="0" step="0.01" disabled={!isNegativeMarkingEnabled}/>
                </div>
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
                 <h3 className="font-bold text-lg">Questions</h3>
                 <div className="flex items-center gap-2 flex-wrap">
                     <label className="flex items-center gap-2 cursor-pointer bg-secondary hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                         <IconUpload className="w-5 h-5"/>
                         Import CSV
                         <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden"/>
                     </label>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={handleGenerateWithAI} disabled={isLoading} className="flex items-center gap-2 bg-accent hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-500">
                            <IconBolt className="w-5 h-5"/>
                            {isLoading ? 'Generating...' : 'Ask AI'}
                        </button>
                        <div>
                            <label htmlFor="numOptionsForAI" className="sr-only">Number of Options for AI</label>
                            <input type="number" id="numOptionsForAI" title="Number of options for AI" value={numOptionsForAI} onChange={(e) => setNumOptionsForAI(Math.max(2, Math.min(6, parseInt(e.target.value, 10) || 2)))} className="w-16 bg-base-200 border border-base-300 rounded-lg p-2 text-center focus:ring-2 focus:ring-accent focus:border-accent" min="2" max="6" />
                        </div>
                    </div>
                 </div>
            </div>
            {quiz.questions.map((q, qIndex) => (
                <fieldset key={q.id} className="bg-base-300/50 p-4 rounded-xl border border-base-300 space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                        <legend className="font-semibold text-gray-300">Question {qIndex + 1}</legend>
                        <div className="flex items-center gap-2">
                            <label htmlFor={`marks-${q.id}`} className="text-sm font-medium">Marks:</label>
                            <input
                                type="number"
                                id={`marks-${q.id}`}
                                value={q.marks}
                                onChange={(e) => handleQuestionChange(qIndex, 'marks', parseFloat(e.target.value) || 1)}
                                className="w-20 bg-base-200 border border-base-300 rounded-lg p-1 text-center"
                                min="0.5"
                                step="0.5"
                            />
                            <button type="button" onClick={() => removeQuestion(qIndex)} className="p-1 text-error hover:text-rose-500 rounded-full hover:bg-base-200"><IconTrash className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <RichTextEditor value={q.questionText} onChange={(val) => handleQuestionChange(qIndex, 'questionText', val)} placeholder="Question Text" />
                    <div className="space-y-2">
                        {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                                <input type="radio" name={`correctAnswer-${q.id}`} checked={q.correctAnswer === opt} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)} className="form-radio h-5 w-5 text-primary bg-base-200 border-base-300 focus:ring-primary flex-shrink-0" required/>
                                <div className="w-full">
                                   <RichTextEditor value={opt} onChange={(val) => handleOptionChange(qIndex, oIndex, val)} placeholder={`Option ${oIndex + 1}`} singleLine={true} />
                                </div>
                                <button type="button" onClick={() => removeOption(qIndex, oIndex)} disabled={q.options.length <= 2} className="p-1 text-error hover:text-rose-500 rounded-full hover:bg-base-200 disabled:text-gray-600 disabled:cursor-not-allowed">
                                    <IconTrash className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => addOption(qIndex)} className="text-sm mt-2 flex items-center gap-1 text-primary hover:text-primary-focus transition-colors">
                        <IconPlus className="w-4 h-4"/> Add Option
                    </button>
                    <RichTextEditor value={q.explanation || ''} onChange={(val) => handleQuestionChange(qIndex, 'explanation', val)} placeholder="Explanation (optional, shown after quiz)" />
                </fieldset>
            ))}
            <button type="button" onClick={addQuestion} className="flex items-center gap-2 w-full justify-center bg-secondary hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                <IconPlus className="w-5 h-5"/> Add Question
            </button>
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-primary-focus text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-glow-primary text-lg transition-all">Save Quiz</button>
      </form>
    </div>
  );
};

export default QuizEditor;
