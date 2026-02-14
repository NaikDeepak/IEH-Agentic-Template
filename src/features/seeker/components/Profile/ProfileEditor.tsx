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
    Trash2,
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
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
                <p className="font-mono text-sm font-black uppercase tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 flex justify-between items-end border-b-4 border-black pb-4">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Edit Profile</h1>
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">
                        Refine your professional identity
                    </p>
                </div>
                <button
                    onClick={() => navigate('/seeker/dashboard')}
                    className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {status && (
                <div className={`mb-8 p-4 border-2 border-black flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                    {status.type === 'success' ? <Sparkles className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                    <p className="font-bold uppercase text-sm">{status.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <section className="space-y-6">
                    <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Core Identity
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="headline" className="block text-[10px] font-black uppercase text-gray-400 mb-1">Professional Headline</label>
                                <input
                                    id="headline"
                                    type="text"
                                    value={profile.headline ?? ''}
                                    onChange={(e) => { setProfile({ ...profile, headline: e.target.value }); }}
                                    className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:bg-indigo-50"
                                    placeholder="e.g. Senior Full Stack Engineer"
                                />
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-[10px] font-black uppercase text-gray-400 mb-1">Short Bio</label>
                                <textarea
                                    id="bio"
                                    value={profile.bio ?? ''}
                                    onChange={(e) => { setProfile({ ...profile, bio: e.target.value }); }}
                                    className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:bg-indigo-50 min-h-[120px]"
                                    placeholder="Tell your professional story..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-indigo-600" />
                            Skill Set
                        </h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => { setNewSkill(e.target.value); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
                                className="flex-grow border-2 border-black p-2 font-bold focus:outline-none"
                                placeholder="Add a skill..."
                            />
                            <button
                                onClick={addSkill}
                                className="bg-black text-white p-2 border-2 border-black hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <Plus />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill, i) => (
                                <span key={i} className="group border-2 border-black px-3 py-1 bg-gray-50 flex items-center gap-2 font-bold uppercase text-xs">
                                    {skill}
                                    <button onClick={() => { removeSkill(skill); }} className="hover:text-red-600">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Job Preferences */}
                <section className="space-y-6">
                    <div className="border-4 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-600" />
                            Job Targets
                        </h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newRole}
                                onChange={(e) => { setNewRole(e.target.value); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') addRole(); }}
                                className="flex-grow border-2 border-black p-2 font-bold focus:outline-none"
                                placeholder="Add target role..."
                            />
                            <button
                                onClick={addRole}
                                className="bg-black text-white p-2 border-2 border-black hover:bg-white hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <Plus />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {profile.preferences?.roles.map((role, i) => (
                                <span key={i} className="group border-2 border-black px-3 py-1 bg-indigo-50 flex items-center gap-2 font-black uppercase text-xs">
                                    {role}
                                    <button onClick={() => { removeRole(role); }} className="hover:text-red-600">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t-2 border-black">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <span className="font-bold text-sm uppercase tracking-tight">Preferred Locations (Coming Soon)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-gray-400" />
                                    <span className="font-bold text-sm uppercase tracking-tight">Open to Remote</span>
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
                                    className={`w-12 h-6 border-2 border-black transition-all relative ${profile.preferences?.remote ? 'bg-black' : 'bg-gray-200'
                                        }`}
                                >
                                    <div className={`absolute top-0 w-5 h-full bg-white transition-all transform border-r-2 border-black ${profile.preferences?.remote ? 'left-6' : 'left-0'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-black text-white py-4 font-black uppercase tracking-widest text-lg border-4 border-black hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center justify-center gap-3 active:transform active:translate-x-1 active:translate-y-1"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save />}
                        Update Professional Profile
                    </button>
                </section>
            </div>
        </div>
    );
};
