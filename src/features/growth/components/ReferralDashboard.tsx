import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Gift,
    Copy,
    CheckCircle2,
    Clock,
    Trophy,
    Share2,
    Users,
    Zap,
    MessageCircle
} from 'lucide-react';
import { PhoneVerification } from './Verification/PhoneVerification';
import { LinkedInVerification } from './Verification/LinkedInVerification';
import { PointsBadge } from './PointsBadge';
import { ReferralService } from '../services/referralService';
import { LedgerService } from '../services/ledgerService';
import { useAuth } from '../../../hooks/useAuth';

interface ReferralRecord {
    id: string;
    uid: string;
    email: string;
    displayName: string;
    status: 'pending' | 'verified' | 'rewarded';
    joinedAt: unknown;
}
// Define interface with optional referrals to allow safe checking
interface ReferralApiResponse {
    referrals?: {
        id: string;
        uid: string;
        email: string;
        displayName: string;
        status: 'pending' | 'verified' | 'rewarded';
        joinedAt: string;
    }[];
}

export const ReferralDashboard: React.FC = () => {
    const { userData, refreshUserData, user } = useAuth();
    const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        // Ensure user has a referral code if missing
        const ensureCode = async () => {
            if (userData && !userData.referralCode) {
                try {
                    await ReferralService.ensureReferralCode(userData.uid);
                    await refreshUserData();
                } catch (error) {
                    console.error('Failed to generate referral code:', error);
                }
            }
        };

        void ensureCode();
    }, [userData, refreshUserData]);

    useEffect(() => {
        const fetchReferrals = async () => {
            if (!userData?.uid || !user) {
                setLoading(false);
                return;
            }

            try {
                const token = await user.getIdToken();
                const response = await fetch('/api/growth/referrals', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json() as ReferralApiResponse;

                // Map API response to component state shape
                // Safe access with optional chaining now valid due to updated interface
                const records: ReferralRecord[] = (data.referrals ?? []).map((ref) => ({
                    id: ref.id,
                    uid: ref.uid,
                    email: ref.email,
                    displayName: ref.displayName,
                    status: ref.status,
                    joinedAt: ref.joinedAt
                }));

                setReferrals(records);
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchReferrals();
    }, [userData, user]);

    const handleRedeem = async (item: { title: string, cost: number }) => {
        if (!userData || (userData.browniePoints ?? 0) < item.cost || isRedeeming) return;

        setIsRedeeming(item.title);
        try {
            await LedgerService.adjustPoints(
                userData.uid,
                -item.cost,
                'redemption',
                { item: item.title }
            );
            await refreshUserData();
            alert(`Success! You redeemed ${item.title}. Check your email for details.`);
        } catch (error) {
            console.error('Redemption failed:', error);
            alert('Redemption failed. Please try again later.');
        } finally {
            setIsRedeeming(null);
        }
    };

    const stats = {
        total: referrals.length,
        verified: referrals.filter(r => r.status === 'verified').length,
        rewarded: referrals.filter(r => r.status === 'rewarded').length,
        pending: referrals.filter(r => r.status === 'pending').length
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Growth</span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-sky-600" />
                        Referral Hub
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Share your code. Earn Brownie Points. Level up your career.</p>
                </div>
                <PointsBadge />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: My Code & Verification */}
                <div className="lg:col-span-1 space-y-5">
                    <div className="bg-sky-700 text-white rounded-2xl p-6">
                        <h2 className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2 text-sky-200">
                            <Share2 className="w-3.5 h-3.5" /> Your Referral Link
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <div className="flex items-center bg-white/10 rounded-lg px-3 py-2 flex-grow overflow-hidden border border-white/20">
                                <span className="text-xs font-mono truncate text-white/80">
                                    {origin}/register?ref={userData?.referralCode}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (userData?.referralCode) {
                                        const url = `${window.location.origin}/register?ref=${userData.referralCode}`;
                                        void navigator.clipboard.writeText(url).then(() => {
                                            setCopied(true);
                                            setTimeout(() => { setCopied(false); }, 2000);
                                        });
                                    }
                                }}
                                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-white flex items-center justify-center shrink-0"
                                title="Copy link"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    if (userData?.referralCode) {
                                        const url = `${window.location.origin}/register?ref=${userData.referralCode}`;
                                        const text = encodeURIComponent(`Hey! Join me on WorkMila to accelerate your career. Use my link to register and we both earn rewards: ${url}`);
                                        window.open(`https://wa.me/?text=${text}`, '_blank');
                                    }
                                }}
                                className="p-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 rounded-lg transition-all text-[#25D366] flex items-center justify-center shrink-0"
                                title="Share via WhatsApp"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-sky-200 leading-relaxed">
                            Share this link. You'll earn <span className="text-white font-semibold">50 Brownie Points</span> once they verify their account and apply for their first job.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" /> Verification Status
                        </h2>
                        <PhoneVerification />
                        <LinkedInVerification />
                    </div>
                </div>

                {/* Right Column: Stats & History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Referred', value: stats.total, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
                            { label: 'Pending', value: stats.verified, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
                            { label: 'Points Earned', value: stats.rewarded * 50, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                            { label: 'Successful', value: stats.rewarded, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        ].map((stat, idx) => (
                            <div key={idx} className={`${stat.bg} border ${stat.border} rounded-xl p-4 shadow-soft`}>
                                <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Referral History Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-slate-900">Referral History</h2>
                            <div className="text-xs text-slate-400">{referrals.length} total</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">User</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Bonus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">Loading...</td></tr>
                                    ) : referrals.length === 0 ? (
                                        <tr><td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-400">No referrals yet. Start sharing!</td></tr>
                                    ) : referrals.map((ref) => (
                                        <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="text-sm font-semibold text-slate-900">{ref.displayName || 'New User'}</div>
                                                <div className="text-xs text-slate-400">{ref.email}</div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
                                                    ${ref.status === 'rewarded' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                        ref.status === 'verified' ? 'bg-sky-50 border-sky-100 text-sky-700' :
                                                            'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                    {ref.status === 'rewarded' && <CheckCircle2 className="w-3 h-3" />}
                                                    {ref.status === 'verified' && <Zap className="w-3 h-3" />}
                                                    {ref.status === 'pending' && <Clock className="w-3 h-3" />}
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                                                {ref.status === 'rewarded' ? <span className="text-emerald-600">+50 BP</span> : <span className="text-slate-300">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Leaderboard CTA */}
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-slate-900">See the Leaderboard</p>
                                <p className="text-xs text-slate-500">How do you rank against other WorkMila members?</p>
                            </div>
                        </div>
                        <Link
                            to="/leaderboard"
                            className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-white border border-amber-200 px-4 py-2 rounded-xl transition-colors shrink-0"
                        >
                            View Rankings
                        </Link>
                    </div>

                    {/* Redemption Store */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <h2 className="text-sm font-semibold text-slate-900">Brownie Points Store</h2>
                        </div>
                        <p className="text-xs text-slate-400 mb-5">Spend your points on career boosters. More items coming soon!</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { title: 'AI Interview Coach (1h)', cost: 100 },
                                { title: 'Premium Profile Badge', cost: 250 },
                            ].map((item, idx) => {
                                const canAfford = (userData?.browniePoints ?? 0) >= item.cost;
                                const redeeming = isRedeeming === item.title;

                                return (
                                    <div key={idx} className={`bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-all ${!canAfford ? 'opacity-60' : 'hover:border-sky-200 hover:shadow-soft'}`}>
                                        <div className="mb-4">
                                            <div className="text-sm font-semibold text-slate-900 mb-1">{item.title}</div>
                                            <div className="text-lg font-bold text-amber-600">{item.cost} BP</div>
                                        </div>
                                        <button
                                            onClick={() => handleRedeem(item)}
                                            disabled={!canAfford || redeeming}
                                            className={`w-full py-2 text-xs font-semibold rounded-lg transition-all
                                                ${canAfford && !redeeming
                                                    ? 'bg-sky-700 hover:bg-sky-800 text-white'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                            `}
                                        >
                                            {redeeming ? 'Redeeming...' : canAfford ? 'Redeem Now' : 'Not Enough Points'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
