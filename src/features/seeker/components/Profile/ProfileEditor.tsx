import React, { useEffect, useState } from 'react';
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
    Globe,
    Sparkles
} from 'lucide-react';

export const ProfileEditor: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Partial<SeekerProfile>>({
        headline: '',
        bio: '',
        skills: [],
        preferences: {
            roles: [],
            locations: [],
            remote: false
        }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [newSkill, setNewSkill] = useState('');
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const data = await ProfileService.getProfile(user.uid);
                if (data) {
                    setProfile(data);
                } else {
                    // Pre-populate from resume if profile is empty
                    const latestResume = await getLatestResume(user.uid);
                    if (latestResume) {
                        setStatus({ type: 'success', message: 'Pre-populated from your latest resume!' });
                        setProfile({
                            parsed_data: latestResume.parsed_data,
                            skills: latestResume.keywords.found,
                            headline: latestResume.parsed_data.experience?.[0]?.role ?? "",
                            preferences: {
                                roles: latestResume.parsed_data.experience?.[0]?.role ? [latestResume.parsed_data.experience[0].role] : [],
                                locations: [],
                                remote: false,
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setStatus({ type: 'error', message: 'Failed to load profile' });
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        try {
            setSaving(true);
            setStatus(null);
            await ProfileService.upsertProfile(user.uid, profile);
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => navigate('/seeker/dashboard'), 1500);
        } catch (error) {
            console.error("Error saving profile:", error);
            setStatus({ type: 'error', message: 'Failed to save profile' });
        } finally {
            setSaving(false);
        }
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        const currentSkills = profile.skills ?? [];
        if (!currentSkills.includes(newSkill.trim())) {
            setProfile({ ...profile, skills: [...currentSkills, newSkill.trim()] });
        }
        setNewSkill('');
    };

    const removeSkill = (skillToRemove: string) => {
        setProfile({
            ...profile,
            skills: (profile.skills ?? []).filter(s => s !== skillToRemove)
        });
    };

    const addRole = () => {
        if (!newRole.trim()) return;
        const currentRoles = profile.preferences?.roles ?? [];
        if (!currentRoles.includes(newRole.trim())) {
            setProfile({
                ...profile,
                preferences: {
                    ...(profile.preferences ?? { locations: [], remote: false, roles: [] }),
                    roles: [...currentRoles, newRole.trim()]
                }
            });
        }
        setNewRole('');
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

            {status && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    {status.type === 'success' ? <Sparkles className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {status.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <section className="space-y-5">
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
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all min-h-[120px] resize-none"
                                    placeholder="Tell your professional story..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-sky-600" />
                            Skills
                        </h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => { setNewSkill(e.target.value); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
                                className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                placeholder="Add a skill..."
                            />
                            <button
                                onClick={addSkill}
                                className="flex items-center justify-center w-10 h-10 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
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

                {/* Job Preferences */}
                <section className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-sky-600" />
                            Job Targets
                        </h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newRole}
                                onChange={(e) => { setNewRole(e.target.value); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') addRole(); }}
                                className="flex-grow px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-400 transition-all"
                                placeholder="Add target role..."
                            />
                            <button
                                onClick={addRole}
                                className="flex items-center justify-center w-10 h-10 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-5">
                            {profile.preferences?.roles.map((role, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
                                    {role}
                                    <button onClick={() => { removeRole(role); }} className="hover:text-red-500 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <MapPin className="w-4 h-4" />
                                Preferred Locations (coming soon)
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Globe className="w-4 h-4 text-slate-400" />
                                    Open to Remote
                                </div>
                                <button
                                    onClick={() => {
                                        setProfile({
                                            ...profile,
                                            preferences: {
                                                ...(profile.preferences ?? { locations: [], roles: [], remote: false }),
                                                remote: !profile.preferences?.remote
                                            }
                                        });
                                    }}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${profile.preferences?.remote ? 'bg-sky-700' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${profile.preferences?.remote ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
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
