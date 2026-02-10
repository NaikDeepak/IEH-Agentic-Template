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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setMode(tab.id as InputMode); }}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                            mode === tab.id
                                ? 'text-blue-600 bg-white border-b-2 border-blue-600 -mb-px'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {mode === 'upload' && (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-10 bg-slate-50 hover:bg-slate-100/50 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="Upload resume file"
                                />
                                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="text-blue-600" size={32} />
                                </div>
                                <p className="text-slate-700 font-medium text-lg">
                                    {selectedFile ? selectedFile.name : 'Drop your resume here'}
                                </p>
                                <p className="text-slate-500 text-sm mt-1">
                                    Supports PDF, DOCX (Max 5MB)
                                </p>
                            </div>
                        </div>
                    )}

                    {mode === 'paste' && (
                        <div className="space-y-4">
                            <label htmlFor="resume-text" className="block text-sm font-medium text-slate-700">
                                Paste your resume text below
                            </label>
                            <textarea
                                id="resume-text"
                                value={rawText}
                                onChange={(e) => { setRawText(e.target.value); }}
                                placeholder="Experience, Education, Skills..."
                                className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none bg-slate-50/30"
                            />
                        </div>
                    )}

                    {mode === 'linkedin' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                <h3 className="flex items-center gap-2 font-semibold text-blue-900 mb-4">
                                    <Info size={20} />
                                    How to export from LinkedIn
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        'Go to your LinkedIn Profile',
                                        'Click the "More" button in your introduction section',
                                        'Select "Save to PDF" from the dropdown',
                                        'Upload the downloaded PDF below'
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-blue-800">
                                            <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100/50 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="Upload LinkedIn PDF"
                                />
                                <Linkedin className="text-slate-400 mb-2 group-hover:text-blue-600 transition-colors" size={24} />
                                <p className="text-slate-600 font-medium">
                                    {selectedFile ? selectedFile.name : 'Click to upload LinkedIn PDF'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={(isLoading ?? false) || (mode === 'upload' && !selectedFile) || (mode === 'paste' && !rawText.trim()) || (mode === 'linkedin' && !selectedFile)}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                                (isLoading ?? false) || (mode === 'upload' && !selectedFile) || (mode === 'paste' && !rawText.trim()) || (mode === 'linkedin' && !selectedFile)
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Analyze Resume
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
