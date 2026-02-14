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
            if (!currentQuestion) throw new Error('No question selected');
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
            <div className="max-w-2xl mx-auto p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">
                    AI Interview Prep
                </h2>

                <form onSubmit={handleStart} className="space-y-8">
                    <div className="space-y-2">
                        <label htmlFor="target-role" className="block text-sm font-bold uppercase tracking-widest text-black">
                            Target Role
                        </label>
                        <input
                            id="target-role"
                            type="text"
                            value={role}
                            onChange={(e) => { setRole(e.target.value); }}
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full px-4 py-3 bg-white border-2 border-black font-mono focus:bg-yellow-50 outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="resume-context" className="block text-sm font-bold uppercase tracking-widest text-black">
                            Resume Context (Optional)
                        </label>
                        <textarea
                            id="resume-context"
                            value={resumeContext}
                            onChange={(e) => { setResumeContext(e.target.value); }}
                            placeholder="Paste your resume summary or key experiences here to get personalized questions..."
                            className="w-full px-4 py-3 bg-white border-2 border-black font-mono focus:bg-yellow-50 outline-none transition-colors h-40 resize-none"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-2 border-red-600 text-red-700 font-bold flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !role.trim()}
                        className="group relative w-full py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                    >
                        <span className="flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Calibrating System...
                                </>
                            ) : (
                                <>
                                    Initialize Practice
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                </form>
            </div>
        );
    }

    if (step === 'summary') {
        return (
            <div className="max-w-2xl mx-auto p-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] text-center animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-green-100 border-4 border-green-600 rounded-none flex items-center justify-center mx-auto mb-8 rotate-3 shadow-[4px_4px_0px_0px_rgba(22,101,52,1)]">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-5xl font-black text-black uppercase tracking-tighter mb-4">
                    Session Terminated
                </h2>
                <p className="text-xl font-medium text-gray-500 mb-10 uppercase tracking-tight">
                    You've completed <span className="text-black font-black underline decoration-4 decoration-green-500">5 modules</span> for the {role} role.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={resetSession}
                        className="px-10 py-5 bg-black text-white font-black uppercase tracking-widest hover:bg-black/90 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Re-Initialize
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-4 border-black pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-black text-white px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest">
                            Active Session
                        </span>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                            Protocol 03-A
                        </span>
                    </div>
                    <h2 className="text-5xl font-black text-black uppercase tracking-tighter leading-none">
                        {role}
                    </h2>
                    <p className="mt-4 font-mono text-sm font-bold uppercase tracking-widest text-gray-500">
                        Module <span className="text-black">{currentQuestionIndex + 1}</span> / {questions.length}
                    </p>
                </div>
                <button
                    onClick={resetSession}
                    className="font-mono text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black hover:underline transition-all"
                >
                    [ Abort Session ]
                </button>
            </div>

            {/* Question Card */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />
                <div className="flex items-center justify-between mb-6">
                    <div className={`px-4 py-1 border-2 border-black font-mono text-xs font-black uppercase tracking-widest
                        ${currentQuestion.difficulty === 'easy' ? 'bg-green-400 text-black' :
                            currentQuestion.difficulty === 'medium' ? 'bg-yellow-400 text-black' :
                                'bg-red-500 text-white'}`}>
                        {currentQuestion.difficulty}
                    </div>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-gray-400">{currentQuestion.type}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-black leading-tight">
                    {currentQuestion.question}
                </h3>
            </div>

            {/* Answer Section */}
            <div className="space-y-8">
                {!evaluation ? (
                    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
                        <label htmlFor="answer-input" className="block font-mono text-xs font-black uppercase tracking-widest text-black mb-4">
                            Input Buffer
                        </label>
                        <textarea
                            id="answer-input"
                            value={answer}
                            onChange={(e) => { setAnswer(e.target.value); }}
                            placeholder="Construct your response protocol..."
                            className="w-full p-6 bg-gray-50 border-2 border-black font-mono text-lg focus:bg-white outline-none transition-colors h-64 resize-none mb-8 placeholder:text-gray-300"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={evaluating || !answer.trim()}
                                className="group px-10 py-5 bg-blue-600 text-white border-4 border-black font-black uppercase tracking-widest hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 active:translate-x-0 active:translate-y-0 active:shadow-none"
                            >
                                {evaluating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Execute Transmission
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Your Answer */}
                        <div className="bg-gray-100 border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h4 className="font-mono text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Initial Transmission</h4>
                            <p className="text-xl font-medium text-black whitespace-pre-wrap leading-relaxed italic border-l-4 border-gray-300 pl-6">{answer}</p>
                        </div>

                        {/* AI Feedback */}
                        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(147,51,234,1)] overflow-hidden">
                            <div className="bg-purple-600 px-8 py-5 border-b-4 border-black flex items-center justify-between">
                                <h4 className="font-black text-2xl text-white uppercase tracking-tighter flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border-2 border-black text-black flex items-center justify-center font-black">
                                        AI
                                    </div>
                                    Analysis Phase
                                </h4>
                                <div className={`flex items-center gap-3 px-6 py-2 border-4 border-black font-mono font-black text-xl
                                    ${evaluation.score >= 80 ? 'bg-green-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                                        evaluation.score >= 60 ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' :
                                            'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                                    {evaluation.score}%
                                </div>
                            </div>

                            <div className="p-8 space-y-10">
                                {/* Strengths & Weaknesses */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-green-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
                                        <h5 className="text-lg font-black text-green-800 uppercase tracking-widest mb-4 flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6" /> Optimized
                                        </h5>
                                        <ul className="space-y-3">
                                            {evaluation.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-3 group">
                                                    <span className="w-1.5 h-6 bg-green-500 border-2 border-black flex-shrink-0 group-hover:scale-y-125 transition-transform" />
                                                    <span className="text-base font-bold text-gray-700 leading-tight">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                                        <h5 className="text-lg font-black text-red-800 uppercase tracking-widest mb-4 flex items-center gap-3">
                                            <AlertCircle className="w-6 h-6" /> Anomalies
                                        </h5>
                                        <ul className="space-y-3">
                                            {evaluation.weaknesses.map((w, i) => (
                                                <li key={i} className="flex items-start gap-3 group">
                                                    <span className="w-1.5 h-6 bg-red-500 border-2 border-black flex-shrink-0 group-hover:scale-y-125 transition-transform" />
                                                    <span className="text-base font-bold text-gray-700 leading-tight">{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Suggestion */}
                                <div className="bg-yellow-100 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-yellow-400 border-b-2 border-l-2 border-black px-4 py-1 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
                                        Key Directive
                                    </div>
                                    <p className="text-lg font-bold text-yellow-900 leading-relaxed mt-2">{evaluation.suggestion}</p>
                                </div>

                                {/* Better Answer */}
                                <div>
                                    <h5 className="font-mono text-xs font-black uppercase tracking-widest text-black mb-4">Golden Protocol / Reference Answer</h5>
                                    <div className="bg-black text-white border-4 border-black p-8 font-mono text-base leading-relaxed relative italic overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                                        <div className="absolute top-2 left-2 text-white/10 text-6xl font-black">"</div>
                                        <span className="relative z-10">{evaluation.betterAnswer}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50 border-t-4 border-black flex justify-end">
                                <button
                                    onClick={handleNextQuestion}
                                    className="group px-10 py-5 bg-black text-white font-black uppercase tracking-widest hover:bg-black/90 flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Proceed to Next Module' : 'End Session'}
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
