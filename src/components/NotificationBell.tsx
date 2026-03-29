import React, { useRef, useState, useEffect } from 'react';
import { Bell, BriefcaseBusiness, Sparkles, Eye, CheckCheck, CircleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../features/notifications/useNotifications';
import type { AppNotification } from '../features/notifications/types';

const TYPE_ICON: Record<AppNotification['type'], React.ReactNode> = {
    application_status: <BriefcaseBusiness className="w-4 h-4 text-sky-600" />,
    new_match: <Sparkles className="w-4 h-4 text-violet-500" />,
    profile_viewed: <Eye className="w-4 h-4 text-emerald-600" />,
};

function timeAgo(ts: AppNotification['createdAt']): string {
    const createdAtDate = (() => {
        if (ts && typeof (ts as { toDate?: unknown }).toDate === 'function') {
            const candidate = (ts as { toDate: () => Date }).toDate();
            return candidate instanceof Date && !Number.isNaN(candidate.getTime()) ? candidate : null;
        }

        if (ts instanceof Date) {
            return Number.isNaN(ts.getTime()) ? null : ts;
        }

        if (typeof ts === 'number') {
            const candidate = new Date(ts);
            return Number.isNaN(candidate.getTime()) ? null : candidate;
        }

        return null;
    })();

    if (!createdAtDate) return 'just now';
    const secs = Math.floor((Date.now() - createdAtDate.getTime()) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

export const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => { document.removeEventListener('mousedown', handler); };
    }, [open]);

    const handleNotifClick = async (n: AppNotification) => {
        if (!n.read) await markRead(n.id);
        setOpen(false);
        if (n.link) void navigate(n.link);
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => { setOpen(o => !o); }}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                className="relative p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-soft-md z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => { void markAllRead(); }}
                                className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Bell className="w-8 h-8 text-slate-200" />
                                <p className="text-sm text-slate-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                // Defensive fallback for unknown notification types.
                                // Keeps list item icon slot meaningful even on malformed data.
                                 
                                ((icon) => (
                                <button
                                    key={n.id}
                                    onClick={() => { void handleNotifClick(n); }}
                                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-sky-50/50' : ''}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                        {icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm leading-tight ${n.read ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[11px] text-slate-300 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="w-2 h-2 bg-sky-500 rounded-full mt-1.5 shrink-0" />
                                    )}
                                </button>
                                ))(TYPE_ICON[n.type] ?? <CircleAlert className="w-4 h-4 text-slate-500" />)
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
