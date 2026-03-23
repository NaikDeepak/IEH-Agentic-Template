import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { ProfileService } from '../../services/profileService';
import { getLatestResume } from '../../services/resumeService';
import type { SeekerProfile } from '../../types';
import {
    Save,
    X,
    Plus,
    Loader2,
    AlertCircle,
    User,
    Tag,
    Target,
    MapPin,
    Sparkles,
    Monitor
} from 'lucide-react';

const WORK_MODE_OPTIONS = ['Remote', 'Hybrid', 'Office'] as const;

const ROLE_SUGGESTIONS = [
    'Software Engineer', 'Senior Software Engineer', 'Full Stack Developer', 'Frontend Developer',
    'Backend Developer', 'React Developer', 'Node.js Developer', 'Python Developer',
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect', 'Solutions Architect',
    'Product Manager', 'Product Designer', 'UI/UX Designer', 'UX Researcher',
    'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer',
    'QA Engineer', 'Test Engineer', 'Security Engineer', 'Cybersecurity Analyst',
    'Business Analyst', 'System Analyst', 'Technical Lead', 'Engineering Manager',
];

const SKILL_SUGGESTIONS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Kotlin', 'Go', 'Rust',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
    'Git', 'Linux', 'Bash', 'Machine Learning', 'TensorFlow', 'PyTorch',
    'Figma', 'Tailwind CSS', 'SQL', 'Data Analysis', 'Power BI', 'Tableau',
    'Agile', 'Scrum', 'System Design', 'Microservices',
];

export const ProfileEditor: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Partial<SeekerProfile>>({
        headline: '',
        bio: '',
        skills: [],
        currentLocation: '',
        work_preferences: [],
        preferences: { roles: [], locations: [], remote: false }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [newSkill, setNewSkill] = useState('');
    const [skillSuggestionsOpen, setSkillSuggestionsOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [roleSuggestionsOpen, setRoleSuggestionsOpen] = useState(false);
    const skillInputRef = useRef<HTMLDivElement>(null);
    const roleInputRef = useRef<HTMLDivElement>(null);

    // Parsed keywords from latest resume — used for skills suggestions
    const [resumeKeywords, setResumeKeywords] = useState<string[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                setLoading(true);
                // Fetch profile and resume in parallel — single resume read
                const [data, latestResume] = await Promise.all([
                    ProfileService.getProfile(user.uid),
                    getLatestResume(user.uid),
                ]);

                if (data) {
                    setProfile(data);
                } else if (latestResume) {
                    setStatus({ type: 'success', message: 'Pre-populated from your latest resume!' });
                    setProfile({
                        parsed_data: latestResume.parsed_data,
                        skills: latestResume.keywords.found,
                        headline: latestResume.parsed_data.experience?.[0]?.role ?? '',
                        work_preferences: [],
                        preferences: {
                            roles: latestResume.parsed_data.experience?.[0]?.role
                                ? [latestResume.parsed_data.experience[0].role]
                                : [],
                            locations: [],
                            remote: false,
                        }
                    });
                }

                if (latestResume) setResumeKeywords(latestResume.keywords.found);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setStatus({ type: 'error', message: 'Failed to load profile' });
            } finally {
                setLoading(false);
            }
        };
        void fetchProfile();
    }, [user]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (skillInputRef.current && !skillInputRef.current.contains(e.target as Node)) {
                setSkillSuggestionsOpen(false);
            }
            if (roleInputRef.current && !roleInputRef.current.contains(e.target as Node)) {
                setRoleSuggestionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => { document.removeEventListener('mousedown', handleClick); };
    }, []);

    const handleSave = async () => {
        if (!user) return;
        try {
            setSaving(true);
            setStatus(null);
            await ProfileService.upsertProfile(user.uid, profile);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => navigate('/seeker/dashboard'), 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setStatus({ type: 'error', message: 'Failed to save profile' });
        } finally {
            setSaving(false);
        }
    };

    const addSkill = (skill?: string) => {
        const val = (skill ?? newSkill).trim();
        if (!val) return;
        const current = profile.skills ?? [];
        if (!current.map(s => s.toLowerCase()).includes(val.toLowerCase())) {
            setProfile({ ...profile, skills: [...current, val] });
        }
        setNewSkill('');
        setSkillSuggestionsOpen(false);
    };

    const removeSkill = (skillToRemove: string) => {
        setProfile({ ...profile, skills: (profile.skills ?? []).filter(s => s !== skillToRemove) });
    };

    const addRole = (role?: string) => {
        const val = (role ?? newRole).trim();
        if (!val) return;
        const current = profile.preferences?.roles ?? [];
        if (!current.includes(val)) {
            setProfile({
                ...profile,
                preferences: {
                    ...(profile.preferences ?? { locations: [], remote: false, roles: [] }),
                    roles: [...current, val]
                }
            });
        }
        setNewRole('');
        setRoleSuggestionsOpen(false);
    };

    const removeRole = (roleToRemove: string) => {
        setProfile({
            ...profile,
            preferences: {
                ...(profile.preferences ?? { locations: [], remote: false, roles: [] }),
                roles: (profile.preferences?.roles ?? []).filter(r => r !== roleToRemove)
            }
        });
    };

    const toggleWorkMode = (mode: string) => {
        const current = profile.work_preferences ?? [];
        const updated = current.includes(mode) ? current.filter(m => m !== mode) : [...current, mode];
        setProfile({ ...profile, work_preferences: updated });
    };

    // Filtered suggestions based on what's typed
    const filteredSkillSuggestions = (() => {
        if (!newSkill.trim()) return [];
        const q = newSkill.toLowerCase();
        const pool = [...new Set([...resumeKeywords, ...SKILL_SUGGESTIONS])];
        const existing = (profile.skills ?? []).map(s => s.toLowerCase());
        return pool.filter(s => s.toLowerCase().includes(q) && !existing.includes(s.toLowerCase())).slice(0, 6);
    })();

    const filteredRoleSuggestions = (() => {
        if (!newRole.trim()) return [];
        const q = newRole.toLowerCase();
        const existing = (profile.preferences?.roles ?? []).map(r => r.toLowerCase());
        return ROLE_SUGGESTIONS.filter(r => r.toLowerCase().includes(q) && !existing.includes(r.toLowerCase())).slice(0, 6);
    })();

    // Profile completeness score (0–100)
    const completenessScore = (() => {
        let score = 0;
        if (profile.headline?.trim()) score += 15;
        if (profile.bio?.trim()) score += 15;
        if ((profile.skills ?? []).length >= 3) score += 20;
        else if ((profile.skills ?? []).length > 0) score += 10;
        if (profile.currentLocation?.trim()) score += 10;
        if ((profile.work_preferences ?? []).length > 0) score += 10;
        if ((profile.preferences?.roles ?? []).length > 0) score += 20;
        if (profile.parsed_data) score += 10;
        return score;
    })();

    const completenessLabel = completenessScore >= 90 ? 'Complete' : completenessScore >= 60 ? 'Looking good' : completenessScore >= 30 ? 'Getting there' : 'Just started';
    const completenessColor = completenessScore >= 90 ? 'bg-emerald-500' : completenessScore >= 60 ? 'bg-sky-500' : completenessScore >= 30 ? 'bg-amber-400' : 'bg-slate-300';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-8 h-8 border-2 border-sky-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">My Account</span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1">Edit Profile</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Keep your professional identity up to date</p>
                </div>
                <button
                    onClick={() => navigate('/seeker/dashboard')}
                    className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Completeness Indicator */}
            <div className="mb-6 bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-700">Profile Strength</span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${completenessScore >= 90 ? 'bg-emerald-50 text-emerald-700' : completenessScore >= 60 ? 'bg-sky-50 text-sky-700' : completenessScore >= 30 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {completenessLabel} · {completenessScore}%
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${completenessColor}`}
                        style={{ width: `${completenessScore}%` }}
                    />
                </div>
                {completenessScore < 90 && (
                    <p className="mt-2.5 text-xs text-slate-400">
                        {!profile.headline?.trim() && 'Add a headline · '}
                        {!profile.bio?.trim() && 'Write a bio · '}
                        {(profile.skills ?? []).length < 3 && 'Add at least 3 skills · '}
                        {!profile.currentLocation?.trim() && 'Set your city · '}
                        {(profile.work_preferences ?? []).length === 0 && 'Set work preference · '}
                        {(profile.preferences?.roles ?? []).length === 0 && 'Add target role · '}
                        {!profile.parsed_data && 'Upload a resume'}
                    </p>
                )}
            </div>

            {status && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {status.type === 'success' ? <Sparkles className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <section className="space-y-5">
                    {/* Basic Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-sky-600" />
                            Basic Info
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="headline" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">Professional Headline</label>
                                <input
                                    id="headline"
                                    type="text"
                                    value={profile.headline ?? ''}
                                    onChange={(e) => { setProfile({ ...profile, headline: e.target.value }); }}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                    placeholder="e.g. Senior Full Stack Engineer"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="bio" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">Short Bio</label>
                                <textarea
                                    id="bio"
                                    value={profile.bio ?? ''}
                                    onChange={(e) => { setProfile({ ...profile, bio: e.target.value }); }}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all min-h-[100px] resize-none"
                                    placeholder="Tell your professional story..."
                                />
                            </div>
                            {/* S3-PROFILE-01: City */}
                            <div className="space-y-1.5">
                                <label htmlFor="current-location" className="block text-xs font-medium text-slate-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />Current City</span>
                                </label>
                                <input
                                    id="current-location"
                                    type="text"
                                    value={profile.currentLocation ?? ''}
                                    onChange={(e) => { setProfile({ ...profile, currentLocation: e.target.value }); }}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                    placeholder="e.g. Mumbai, Bangalore, Delhi..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills with autocomplete (S3-PROFILE-04) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-sky-600" />
                            Skills
                        </h2>
                        <div className="relative mb-4" ref={skillInputRef}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => { setNewSkill(e.target.value); setSkillSuggestionsOpen(true); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                    onFocus={() => { if (newSkill) setSkillSuggestionsOpen(true); }}
                                    className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                    placeholder="Add a skill..."
                                />
                                <button
                                    onClick={() => { addSkill(); }}
                                    className="flex items-center justify-center w-10 h-10 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {skillSuggestionsOpen && filteredSkillSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-soft-md z-20 overflow-hidden">
                                    {filteredSkillSuggestions.map(s => (
                                        <button
                                            key={s}
                                            onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-b border-slate-100 last:border-0 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-xs font-medium text-sky-700">
                                    {skill}
                                    <button onClick={() => { removeSkill(skill); }} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right column */}
                <section className="space-y-5">
                    {/* Job Targets with role suggestions (S3-PROFILE-03) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-sky-600" />
                            Job Targets
                        </h2>
                        <div className="relative mb-4" ref={roleInputRef}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newRole}
                                    onChange={(e) => { setNewRole(e.target.value); setRoleSuggestionsOpen(true); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(); } }}
                                    onFocus={() => { if (newRole) setRoleSuggestionsOpen(true); }}
                                    className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                    placeholder="Add target role..."
                                />
                                <button
                                    onClick={() => { addRole(); }}
                                    className="flex items-center justify-center w-10 h-10 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors shrink-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            {roleSuggestionsOpen && filteredRoleSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-soft-md z-20 overflow-hidden">
                                    {filteredRoleSuggestions.map(r => (
                                        <button
                                            key={r}
                                            onMouseDown={(e) => { e.preventDefault(); addRole(r); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 border-b border-slate-100 last:border-0 transition-colors"
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.preferences?.roles.map((role, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
                                    {role}
                                    <button onClick={() => { removeRole(role); }} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Work Preferences (S3-PROFILE-02) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-sky-600" />
                            Work Preference
                        </h2>
                        <div className="flex flex-col gap-3">
                            {WORK_MODE_OPTIONS.map(mode => {
                                const checked = (profile.work_preferences ?? []).includes(mode);
                                const id = `work-pref-${mode.toLowerCase()}`;
                                return (
                                    <label key={mode} htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            id={id}
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => { toggleWorkMode(mode); }}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-sky-700 border-sky-700' : 'border-slate-300 group-hover:border-sky-400'}`}>
                                            {checked && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </div>
                                        <span className="text-sm text-slate-700">{mode}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Profile
                    </button>
                </section>
            </div>
        </div>
    );
};
