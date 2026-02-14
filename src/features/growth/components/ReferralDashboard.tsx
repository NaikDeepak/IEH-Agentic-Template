import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
    Gift,
    Copy,
    CheckCircle2,
    Clock,
    AlertCircle,
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

interface ReferralRecord {
    id: string;
    uid: string;
    email: string;
    displayName: string;
    status: 'pending' | 'verified' | 'rewarded';
    joinedAt: unknown;
}

interface UserDataDoc {
    email: string;
    displayName: string;
    referralRewarded?: boolean;
    phoneVerified?: boolean;
    linkedinVerified?: boolean;
    created_at: unknown;
}

export const ReferralDashboard: React.FC = () => {
    const { userData, refreshUserData } = useAuth();
    const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

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
            if (!userData?.uid) return;

            try {
                // Find users referred by this user
                const q = query(
                    collection(db, 'users'),
                    where('referredBy', '==', userData.uid),
                    orderBy('created_at', 'desc')
                );
                const snap = await getDocs(q);
                const records = snap.docs.map(doc => {
                    const data = doc.data() as UserDataDoc;
                    let status: 'pending' | 'verified' | 'rewarded' = 'pending';
                    if (data.referralRewarded) status = 'rewarded';
                    else if (data.phoneVerified && data.linkedinVerified) status = 'verified';

                    return {
                        id: doc.id,
                        uid: doc.id,
                        email: data.email,
                        displayName: data.displayName,
                        status,
                        joinedAt: data.created_at
                    };
                });
                setReferrals(records);
            } catch (error) {
                console.error('Error fetching referrals:', error);
            } finally {
                setLoading(false);
            }
        };

        void fetchReferrals();
    }, [userData]);

    const handleRedeem = async (item: { title: string, cost: number }) => {
        if (!userData || (userData.browniePoints ?? 0) < item.cost) return;

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
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-6 h-6 text-black" />
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Referral Hub</h1>
                    </div>
                    <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                        Share your code. Earn Brownie Points. Level up your career.
                    </p>
                </div>
                <PointsBadge />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: My Code & Verification */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-black text-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(128,128,128,1)]">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Your Referral Link
                        </h2>
                        <div className="flex gap-2 mb-4">
                            <div className="flex items-center gap-2 bg-white/10 p-4 border border-white/20 flex-grow overflow-hidden">
                                <span className="text-xs font-mono truncate">
                                    {window.location.origin}/register?ref={userData?.referralCode}
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
                                className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white flex items-center justify-center shrink-0"
                                title="Copy link"
                            >
                                {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => {
                                    if (userData?.referralCode) {
                                        const url = `${window.location.origin}/register?ref=${userData.referralCode}`;
                                        const text = encodeURIComponent(`Hey! Join me on IEH to accelerate your career. Use my link to register and we both earn rewards: ${url}`);
                                        window.open(`https://wa.me/?text=${text}`, '_blank');
                                    }
                                }}
                                className="p-4 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 transition-all text-[#25D366] flex items-center justify-center shrink-0"
                                title="Share via WhatsApp"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[9px] font-mono uppercase text-gray-400 leading-relaxed">
                            Share this link with fellow professionals. They'll get the referral code automatically, and you'll earn <span className="text-white font-bold">50 Brownie Points</span> once they verify their account and apply for their first job.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 px-1">
                            <Zap className="w-4 h-4" /> Verification Status
                        </h2>
                        <PhoneVerification />
                        <LinkedInVerification />
                    </div>
                </div>

                {/* Right Column: Stats & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Referred', value: stats.total, icon: Users, color: 'text-black' },
                            { label: 'Pending App', value: stats.verified, icon: Clock, color: 'text-blue-600' },
                            { label: 'Points Earned', value: stats.rewarded * 50, icon: Trophy, color: 'text-yellow-600' },
                            { label: 'Successful', value: stats.rewarded, icon: CheckCircle2, color: 'text-green-600' },
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <stat.icon className={`w-4 h-4 mb-2 ${stat.color}`} />
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-[8px] font-mono font-bold uppercase text-gray-500 tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Referral History Table */}
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-50">
                            <h2 className="text-xs font-black uppercase tracking-widest">Referral History</h2>
                            <div className="text-[10px] font-mono font-bold text-gray-500 uppercase">{referrals.length} Total</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white">
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black">User</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black">Status</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest border-b-2 border-black">Bonus</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={3} className="p-8 text-center font-mono text-xs uppercase text-gray-400">Loading records...</td></tr>
                                    ) : referrals.length === 0 ? (
                                        <tr><td colSpan={3} className="p-8 text-center font-mono text-xs uppercase text-gray-400">No referrals yet. Start sharing!</td></tr>
                                    ) : referrals.map((ref) => (
                                        <tr key={ref.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-sm">{ref.displayName || 'New User'}</div>
                                                <div className="text-[10px] font-mono text-gray-400">{ref.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`
                                                    inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase border
                                                    ${ref.status === 'rewarded' ? 'bg-green-50 border-green-200 text-green-700' :
                                                        ref.status === 'verified' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                            'bg-gray-50 border-gray-200 text-gray-500'}
                                                `}>
                                                    {ref.status === 'rewarded' && <CheckCircle2 className="w-2.5 h-2.5" />}
                                                    {ref.status === 'verified' && <Zap className="w-2.5 h-2.5" />}
                                                    {ref.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-black text-sm">
                                                {ref.status === 'rewarded' ? '+50' : '--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Redemption Store */}
                    <div className="bg-yellow-50 border-2 border-black p-6 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h2 className="text-lg font-black uppercase tracking-tighter mb-2 flex items-center gap-2">
                                <Trophy className="w-5 h-5" /> Brownie Points Store
                            </h2>
                            <p className="text-xs font-mono font-bold text-gray-600 uppercase mb-6">
                                Spend your points on career boosters. More items coming soon!
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'AI Interview Coach (1h)', cost: 100 },
                                    { title: 'Premium Profile Badge', cost: 250 },
                                ].map((item, idx) => {
                                    const canAfford = (userData?.browniePoints ?? 0) >= item.cost;
                                    const redeeming = isRedeeming === item.title;

                                    return (
                                        <div key={idx} className={`bg-white border-2 border-black p-4 flex flex-col justify-between ${!canAfford ? 'opacity-60' : ''}`}>
                                            <div className="mb-4">
                                                <div className="text-xs font-black uppercase mb-1">{item.title}</div>
                                                <div className="text-lg font-black text-yellow-600">{item.cost} BP</div>
                                            </div>
                                            <button
                                                onClick={() => handleRedeem(item)}
                                                disabled={!canAfford || redeeming}
                                                className={`
                                                    w-full py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black transition-all
                                                    ${canAfford && !redeeming
                                                        ? 'bg-black text-white hover:bg-white hover:text-black cursor-pointer'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                                `}
                                            >
                                                {redeeming ? 'Redeeming...' : canAfford ? 'Redeem Now' : 'Not Enough Points'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <AlertCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-black/5 rotate-12 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
};
