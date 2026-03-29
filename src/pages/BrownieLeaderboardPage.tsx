import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Header';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query, limit, where, getCountFromServer } from 'firebase/firestore';
import { Trophy, Medal, Star, Loader2, Users } from 'lucide-react';

interface LeaderEntry {
    uid: string;
    displayName: string;
    browniePoints: number;
    role: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];

const BrownieLeaderboardPage: React.FC = () => {
    const { user, userData } = useAuth();
    const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
    const [myRank, setMyRank] = useState<number | null>(null);
    const [myPoints, setMyPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDocs(
                    query(
                        collection(db, 'leaderboard'),
                        orderBy('browniePoints', 'desc'),
                        limit(20)
                    )
                );

                const entries: LeaderEntry[] = snap.docs.map(d => {
                    const data = d.data();
                    return {
                        uid: d.id,
                        displayName: (data['displayName'] as string | undefined) ?? 'Anonymous',
                        browniePoints: typeof data['browniePoints'] === 'number' ? data['browniePoints'] : 0,
                        role: (data['role'] as string | undefined) ?? 'seeker',
                    };
                });

                setLeaders(entries);

                // Compute current user's rank if not in top 20
                if (user) {
                    const currentPoints = typeof userData?.browniePoints === 'number' ? userData.browniePoints : 0;
                    setMyPoints(currentPoints);

                    const inTop = entries.findIndex(e => e.uid === user.uid);
                    if (inTop !== -1) {
                        setMyRank(inTop + 1);
                    } else {
                        // Count leaderboard entries with more points
                        const aboveSnap = await getCountFromServer(
                            query(collection(db, 'leaderboard'), where('browniePoints', '>', currentPoints))
                        );
                        setMyRank(aboveSnap.data().count + 1);
                    }
                }
            } catch (err) {
                console.error('[BrownieLeaderboard] load error:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [user, userData]);

    const isInTopList = leaders.some(e => e.uid === user?.uid);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-2xl">
                {/* Header */}
                <div className="border-b border-slate-200 pb-8 mb-10 text-center">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-7 h-7 text-amber-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Brownie Points</h1>
                    <p className="text-sm text-slate-400 mt-1">Top earners on WorkMila — earn points by referring friends and completing your profile</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : (
                    <>
                        {/* Your rank card (if logged in) */}
                        {user && (
                            <div className={`rounded-2xl border p-5 mb-8 flex items-center justify-between gap-4 ${
                                isInTopList
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-white border-slate-200 shadow-soft'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                                        <Star className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{userData?.displayName ?? 'You'}</p>
                                        <p className="text-xs text-slate-400">Your ranking</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-2xl font-bold text-amber-600 tabular-nums">{myPoints.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400">
                                        {myRank !== null ? `Rank #${myRank}` : '—'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Leaderboard */}
                        {leaders.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
                                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No points earned yet. Be the first!</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
                                {leaders.map((entry, idx) => {
                                    const isMe = entry.uid === user?.uid;
                                    const medal = MEDALS[idx] ?? null;
                                    return (
                                        <div
                                            key={entry.uid}
                                            className={`flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 transition-colors ${
                                                isMe ? 'bg-amber-50' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            {/* Rank */}
                                            <div className="w-8 text-center shrink-0">
                                                {medal
                                                    ? <span className="text-xl">{medal}</span>
                                                    : <span className="text-sm font-semibold text-slate-400 tabular-nums">{idx + 1}</span>
                                                }
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-sky-700">
                                                    {entry.displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold truncate ${isMe ? 'text-amber-700' : 'text-slate-900'}`}>
                                                    {entry.displayName}
                                                    {isMe && <span className="ml-1.5 text-xs font-medium text-amber-500">(you)</span>}
                                                </p>
                                                <p className="text-xs text-slate-400 capitalize">{entry.role === 'seeker' ? 'Job Seeker' : entry.role === 'employer' ? 'Employer' : entry.role}</p>
                                            </div>

                                            {/* Points */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Medal className="w-3.5 h-3.5 text-amber-400" />
                                                <span className={`text-sm font-bold tabular-nums ${isMe ? 'text-amber-600' : 'text-slate-700'}`}>
                                                    {entry.browniePoints.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* How to earn */}
                        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-soft p-6">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                How to Earn Points
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { action: 'Refer a friend who registers', points: 50 },
                                    { action: 'Complete your profile 100%', points: 20 },
                                    { action: 'Verify your phone number', points: 10 },
                                ].map(({ action, points }) => (
                                    <div key={action} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">{action}</span>
                                        <span className="font-semibold text-amber-600">+{points} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default BrownieLeaderboardPage;
