import React, { useState } from 'react';
import { generateQuestions, evaluateAnswer, type InterviewQuestion, type EvaluationResult } from '../../services/interviewService';
import { Loader2, Send, CheckCircle, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
    // State
    const [step, setStep] = useState<'setup' | 'practice' | 'summary'>('setup');
    const [role, setRole] = useState('');
    const [resumeContext, setResumeContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
    const [evaluating, setEvaluating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const generatedQuestions = await generateQuestions(role, resumeContext);
            setQuestions(generatedQuestions);
            setStep('practice');
            setCurrentQuestionIndex(0);
            setAnswer('');
            setEvaluation(null);
        } catch (err) {
            setError('Failed to generate questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;

        setEvaluating(true);
        setError(null);
        try {
            const currentQuestion = questions[currentQuestionIndex];
            const result = await evaluateAnswer(currentQuestion.question, answer, role);
            setEvaluation(result);
        } catch (err) {
            setError('Failed to evaluate answer. Please try again.');
            console.error(err);
        } finally {
            setEvaluating(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAnswer('');
            setEvaluation(null);
        } else {
            setStep('summary');
        }
    };

    const resetSession = () => {
        setStep('setup');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setEvaluation(null);
        setError(null);
    };

    if (step === 'setup') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Interview Practice</h2>

                <form onSubmit={handleStart} className="space-y-6">
                    <div>
                        <label htmlFor="target-role" className="block text-sm font-medium text-gray-700 mb-2">
                            Target Role
                        </label>
                        <input
                            id="target-role"
                            type="text"
                            value={role}
                            onChange={(e) => { setRole(e.target.value); }}
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="resume-context" className="block text-sm font-medium text-gray-700 mb-2">
                            Resume Context (Optional)
                        </label>
                        <textarea
                            id="resume-context"
                            value={resumeContext}
                            onChange={(e) => { setResumeContext(e.target.value); }}
                            placeholder="Paste your resume summary or key experiences here to get personalized questions..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !role.trim()}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Questions...
                            </>
                        ) : (
                            'Start Practice Session'
                        )}
                    </button>
                </form>
            </div>
        );
    }

    if (step === 'summary') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
                <p className="text-gray-600 mb-8">
                    You've completed 5 practice questions for the {role} role.
                </p>
                <button
                    onClick={resetSession}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                    <RefreshCw className="w-5 h-5" />
                    Start New Session
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{role} Interview</h2>
                    <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
                </div>
                <button
                    onClick={resetSession}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Exit Session
                </button>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'}`}>
                        {currentQuestion.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{currentQuestion.type}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentQuestion.question}
                </h3>
            </div>

            {/* Answer Section */}
            <div className="space-y-4">
                {!evaluation ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <label htmlFor="answer-input" className="block text-sm font-medium text-gray-700 mb-2">
                            Your Answer
                        </label>
                        <textarea
                            id="answer-input"
                            value={answer}
                            onChange={(e) => { setAnswer(e.target.value); }}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-48 resize-none mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={evaluating || !answer.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {evaluating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        Submit Answer
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Your Answer (Read-only) */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Your Answer</h4>
                            <p className="text-gray-900 whitespace-pre-wrap">{answer}</p>
                        </div>

                        {/* AI Feedback */}
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                                <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                        AI
                                    </div>
                                    Feedback
                                </h4>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold
                                    ${evaluation.score >= 80 ? 'bg-green-100 text-green-700' :
                                        evaluation.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'}`}>
                                    Score: {evaluation.score}/100
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Strengths & Weaknesses */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Strengths
                                        </h5>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            {evaluation.strengths.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Improvements
                                        </h5>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            {evaluation.weaknesses.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Suggestion */}
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                    <h5 className="text-sm font-medium text-yellow-800 mb-1">Key Suggestion</h5>
                                    <p className="text-sm text-yellow-700">{evaluation.suggestion}</p>
                                </div>

                                {/* Better Answer */}
                                <div>
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">Example Improvement</h5>
                                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 italic border border-gray-200">
                                        "{evaluation.betterAnswer}"
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleNextQuestion}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
