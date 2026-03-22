import React, { useState } from 'react';
import { Loader2, Sparkles, User, Target, Code, Briefcase, GraduationCap, FileText, Copy, CheckCircle } from 'lucide-react';
import { callAIProxy } from '../../../../lib/ai/proxy';

interface CVSection {
    summary: string;
    skills: string[];
    experience: {
        company: string;
        role: string;
        duration: string;
        highlights: string[];
    }[];
    education: {
        institution: string;
        degree: string;
        year: string;
    }[];
}

interface CVBuilderProps {
    prefillName?: string;
    prefillRole?: string;
    prefillSkills?: string[];
}

export const CVBuilder: React.FC<CVBuilderProps> = ({ prefillName = '', prefillRole = '', prefillSkills = [] }) => {
    const [form, setForm] = useState({
        name: prefillName,
        targetRole: prefillRole,
        skills: prefillSkills.join(', '),
        experienceBullets: '',
        educationBullets: '',
        extraContext: '',
    });
    const [isBuilding, setIsBuilding] = useState(false);
    const [result, setResult] = useState<CVSection | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBuild = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsBuilding(true);
        setError(null);
        setResult(null);
        try {
            const cv = await callAIProxy<CVSection>('/api/ai/build-cv', {
                name: form.name,
                targetRole: form.targetRole,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                experienceBullets: form.experienceBullets,
                educationBullets: form.educationBullets,
                extraContext: form.extraContext,
            });
            setResult(cv);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to build CV. Please try again.');
        } finally {
            setIsBuilding(false);
        }
    };

    const handleCopyAll = async () => {
        if (!result) return;
        const text = [
            `PROFESSIONAL SUMMARY\n${result.summary}`,
            `\nSKILLS\n${result.skills.join(' · ')}`,
            `\nEXPERIENCE\n${result.experience.map(exp =>
                `${exp.role} — ${exp.company} (${exp.duration})\n${exp.highlights.map(h => `• ${h}`).join('\n')}`
            ).join('\n\n')}`,
            `\nEDUCATION\n${result.education.map(edu =>
                `${edu.degree} — ${edu.institution} (${edu.year})`
            ).join('\n')}`,
        ].join('\n');
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2000);
    };

    const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all text-sm text-slate-900 placeholder:text-slate-400";
    const labelClasses = "block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5";

    if (result) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">AI Generated</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-0.5">Your Structured CV</h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            {copied ? <CheckCircle size={15} className="text-emerald-600" /> : <Copy size={15} />}
                            {copied ? 'Copied!' : 'Copy All'}
                        </button>
                        <button
                            onClick={() => { setResult(null); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-xl hover:bg-sky-100 transition-colors"
                        >
                            <Sparkles size={15} />
                            Rebuild
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <span className="w-6 h-6 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center">
                            <FileText size={13} className="text-sky-600" />
                        </span>
                        Professional Summary
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <span className="w-6 h-6 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center">
                            <Code size={13} className="text-violet-600" />
                        </span>
                        Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-full text-slate-700">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Experience */}
                {result.experience.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                            <span className="w-6 h-6 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
                                <Briefcase size={13} className="text-amber-600" />
                            </span>
                            Experience
                        </h4>
                        <div className="space-y-5">
                            {result.experience.map((exp, i) => (
                                <div key={i} className={i > 0 ? 'pt-5 border-t border-slate-100' : ''}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{exp.role}</p>
                                            <p className="text-xs text-slate-500">{exp.company}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full shrink-0">{exp.duration}</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {exp.highlights.map((h, j) => (
                                            <li key={j} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {result.education.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                            <span className="w-6 h-6 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center">
                                <GraduationCap size={13} className="text-emerald-600" />
                            </span>
                            Education
                        </h4>
                        <div className="space-y-3">
                            {result.education.map((edu, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{edu.degree}</p>
                                        <p className="text-xs text-slate-500">{edu.institution}</p>
                                    </div>
                                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full shrink-0">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleBuild} className="space-y-5">
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
                Tell us about yourself in plain text — the AI will structure and polish it into a professional CV.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cv-name" className={labelClasses}>
                        <User size={11} className="inline mr-1" /> Full Name
                    </label>
                    <input
                        id="cv-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Priya Sharma"
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label htmlFor="cv-role" className={labelClasses}>
                        <Target size={11} className="inline mr-1" /> Target Role *
                    </label>
                    <input
                        id="cv-role"
                        type="text"
                        name="targetRole"
                        value={form.targetRole}
                        onChange={handleChange}
                        placeholder="Senior Frontend Engineer"
                        required
                        className={inputClasses}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="cv-skills" className={labelClasses}>
                    <Code size={11} className="inline mr-1" /> Skills (comma-separated)
                </label>
                <input
                    id="cv-skills"
                    type="text"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="React, TypeScript, Node.js, AWS, Docker"
                    className={inputClasses}
                />
            </div>

            <div>
                <label htmlFor="cv-experience" className={labelClasses}>
                    <Briefcase size={11} className="inline mr-1" /> Work History (plain text)
                </label>
                <textarea
                    id="cv-experience"
                    name="experienceBullets"
                    value={form.experienceBullets}
                    onChange={handleChange}
                    placeholder={`Example:\nSenior Developer at TCS, 2021-2024 — built React dashboards, led team of 4\nJunior Dev at Infosys, 2019-2021 — backend APIs in Node.js`}
                    rows={5}
                    className={`${inputClasses} resize-none`}
                />
            </div>

            <div>
                <label htmlFor="cv-education" className={labelClasses}>
                    <GraduationCap size={11} className="inline mr-1" /> Education (plain text)
                </label>
                <textarea
                    id="cv-education"
                    name="educationBullets"
                    value={form.educationBullets}
                    onChange={handleChange}
                    placeholder={`Example:\nB.Tech Computer Science, IIT Delhi, 2019`}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                />
            </div>

            <div>
                <label htmlFor="cv-extra" className={labelClasses}>
                    Extra Context (certifications, projects, achievements)
                </label>
                <textarea
                    id="cv-extra"
                    name="extraContext"
                    value={form.extraContext}
                    onChange={handleChange}
                    placeholder="AWS Certified Developer, built open-source library with 1k+ GitHub stars..."
                    rows={2}
                    className={`${inputClasses} resize-none`}
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                    {error}
                </div>
            )}

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isBuilding || !form.targetRole.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isBuilding ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Building your CV...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Build with AI
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
