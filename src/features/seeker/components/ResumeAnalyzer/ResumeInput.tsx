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
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b-4 border-black bg-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setMode(tab.id as InputMode); }}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-6 text-sm font-black uppercase tracking-widest transition-all relative border-r-4 last:border-r-0 border-black ${mode === tab.id
                                ? 'bg-yellow-400 text-black'
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={20} strokeWidth={3} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-10">
                    {mode === 'upload' && (
                        <div className="space-y-4">
                            <div className="group relative">
                                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
                                <div className="relative flex flex-col items-center justify-center border-4 border-black border-dashed p-16 bg-white hover:bg-emerald-50 transition-colors cursor-pointer group">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        aria-label="Upload resume file"
                                    />
                                    <div className="p-6 bg-black mb-6 group-hover:bg-emerald-400 transition-colors">
                                        <Upload className="text-white" size={40} strokeWidth={3} />
                                    </div>
                                    <p className="text-2xl font-black uppercase tracking-tighter mb-2">
                                        {selectedFile ? selectedFile.name : 'Deploy Resume'}
                                    </p>
                                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-400">
                                        PDF, DOCX // MAX 5MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'paste' && (
                        <div className="space-y-4">
                            <label htmlFor="resume-text" className="inline-block bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                Input Material
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
                                <textarea
                                    id="resume-text"
                                    value={rawText}
                                    onChange={(e) => { setRawText(e.target.value); }}
                                    placeholder="Paste experience, education, and skills..."
                                    className="relative w-full h-80 p-6 border-4 border-black bg-white focus:bg-yellow-50 transition-all outline-none resize-none font-mono text-sm font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {mode === 'linkedin' && (
                        <div className="space-y-8">
                            <div className="bg-indigo-600 text-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 rotate-45"></div>
                                <h3 className="flex items-center gap-3 font-black uppercase tracking-tighter text-xl mb-6 relative z-10">
                                    <Info size={24} strokeWidth={3} />
                                    Protocol: LinkedIn Export
                                </h3>
                                <ul className="space-y-4 relative z-10">
                                    {[
                                        'Navigate to LinkedIn Profile',
                                        'Click "More" in intro section',
                                        'Select "Save to PDF"',
                                        'Upload the payload below'
                                    ].map((step, i) => (
                                        <li key={i} className="flex gap-4 items-center">
                                            <span className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-black italic border-2 border-white">
                                                {i + 1}
                                            </span>
                                            <span className="font-bold uppercase text-xs tracking-widest">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
                                <div className="relative flex flex-col items-center justify-center border-4 border-black border-dashed p-10 bg-white hover:bg-emerald-50 transition-colors cursor-pointer group">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        aria-label="Upload LinkedIn PDF"
                                    />
                                    <Linkedin className="text-gray-300 mb-4 group-hover:text-black transition-colors" size={32} strokeWidth={3} />
                                    <p className="font-black uppercase tracking-tight">
                                        {selectedFile ? selectedFile.name : 'Upload PDF Payload'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={(isLoading ?? false) || (mode === 'upload' && !selectedFile) || (mode === 'paste' && !rawText.trim()) || (mode === 'linkedin' && !selectedFile)}
                            className={`group relative overflow-hidden flex items-center gap-4 px-12 py-5 border-4 border-black font-black uppercase tracking-tighter text-lg leading-none transition-all ${(isLoading ?? false) || (mode === 'upload' && !selectedFile) || (mode === 'paste' && !rawText.trim()) || (mode === 'linkedin' && !selectedFile)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
                                    : 'bg-emerald-400 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-emerald-500'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={24} strokeWidth={3} />
                                    Initiate Analysis
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
