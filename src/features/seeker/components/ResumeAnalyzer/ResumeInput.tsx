import React, { useState } from 'react';
import { Upload, FileText, Linkedin, CheckCircle, Info } from 'lucide-react';

interface ResumeInputProps {
    onSubmit: (data: { type: 'file' | 'text' | 'linkedin'; content: File | string }) => void;
    isLoading?: boolean;
}

type InputMode = 'upload' | 'paste' | 'linkedin';

export const ResumeInput: React.FC<ResumeInputProps> = ({ onSubmit, isLoading }) => {
    const [mode, setMode] = useState<InputMode>('upload');
    const [rawText, setRawText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'upload' && selectedFile) {
            onSubmit({ type: 'file', content: selectedFile });
        } else if (mode === 'paste' && rawText.trim()) {
            onSubmit({ type: 'text', content: rawText });
        } else if (mode === 'linkedin' && selectedFile) {
            onSubmit({ type: 'linkedin', content: selectedFile });
        }
    };

    const tabs = [
        { id: 'upload', label: 'Upload File', icon: Upload },
        { id: 'paste', label: 'Paste Text', icon: FileText },
        { id: 'linkedin', label: 'LinkedIn Import', icon: Linkedin },
    ];

    const isDisabled = (isLoading ?? false) || (mode === 'upload' && !selectedFile) || (mode === 'paste' && !rawText.trim()) || (mode === 'linkedin' && !selectedFile);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setMode(tab.id as InputMode); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all border-b-2 ${mode === tab.id
                                ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === 'upload' && (
                        <div className="relative group">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-12 hover:border-sky-400 hover:bg-sky-50/50 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="Upload resume file"
                                />
                                <div className="w-12 h-12 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-center mb-4">
                                    <Upload className="text-sky-600" size={22} />
                                </div>
                                <p className="text-sm font-semibold text-slate-700 mb-1">
                                    {selectedFile ? selectedFile.name : 'Click or drag your resume here'}
                                </p>
                                <p className="text-xs text-slate-400">PDF, DOC, DOCX — max 5MB</p>
                            </div>
                        </div>
                    )}

                    {mode === 'paste' && (
                        <div className="space-y-2">
                            <label htmlFor="resume-text" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">
                                Resume Text
                            </label>
                            <textarea
                                id="resume-text"
                                value={rawText}
                                onChange={(e) => { setRawText(e.target.value); }}
                                placeholder="Paste your experience, education, and skills..."
                                className="w-full h-72 px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                            />
                        </div>
                    )}

                    {mode === 'linkedin' && (
                        <div className="space-y-5">
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                                    <Info size={16} className="text-sky-600" />
                                    How to export your LinkedIn profile
                                </h3>
                                <ol className="space-y-3">
                                    {[
                                        'Go to your LinkedIn profile',
                                        'Click "More" in your intro section',
                                        'Select "Save to PDF"',
                                        'Upload the downloaded PDF below'
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <span className="flex-shrink-0 w-5 h-5 bg-sky-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-slate-600">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="relative">
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-10 hover:border-sky-400 hover:bg-sky-50/50 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        aria-label="Upload LinkedIn PDF"
                                    />
                                    <Linkedin className="text-slate-300 mb-3" size={28} />
                                    <p className="text-sm font-semibold text-slate-600">
                                        {selectedFile ? selectedFile.name : 'Upload LinkedIn PDF'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analysing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    Analyse Resume
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
