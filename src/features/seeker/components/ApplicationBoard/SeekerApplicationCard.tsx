import React, { useEffect, useMemo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Application } from '../../../applications/types';
import { Calendar, Building2, StickyNote, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react';
import { FollowUpNudge } from './FollowUpNudge';
import { ApplicationService } from '../../../applications/services/applicationService';

interface SeekerApplicationCardProps {
    application: Application;
    isReadOnly?: boolean;
}

export const SeekerApplicationCard: React.FC<SeekerApplicationCardProps> = ({
    application,
    isReadOnly = false
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: application.id ?? '',
        disabled: isReadOnly
    });

    const [notesOpen, setNotesOpen] = useState(false);
    const [notes, setNotes] = useState(application.notes ?? '');
    const [reminderDate, setReminderDate] = useState(application.reminder_date ?? '');
    const [saving, setSaving] = useState(false);
    const [notesSaveError, setNotesSaveError] = useState<string | null>(null);
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    useEffect(() => {
        setNotes(application.notes ?? '');
        const incomingReminder = application.reminder_date ?? '';
        setReminderDate(incomingReminder && incomingReminder < today ? today : incomingReminder);
        setNotesSaveError(null);
        setNotesOpen(false);
    }, [application.id, application.notes, application.reminder_date, today]);

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    // Helper to format timestamp
    const formatDate = (date: unknown) => {
        if (!date) return 'Unknown';

        // Type guard for Firestore Timestamp
        const isTimestamp = (val: unknown): val is { toDate: () => Date } => {
            return !!(val && typeof (val as { toDate?: unknown }).toDate === 'function');
        };

        const d = isTimestamp(date) ? date.toDate() : new Date(date as string | number | Date);
        return d instanceof Date && !isNaN(d.getTime()) ? d.toLocaleDateString() : 'Unknown';
    };

    const handleSaveNotes = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!application.id) return;
        setSaving(true);
        setNotesSaveError(null);
        try {
            await ApplicationService.updateApplicationNotes(application.id, notes, reminderDate);
        } catch (err) {
            console.error('[SeekerApplicationCard] notes save error:', err);
            setNotesSaveError('Failed to save notes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCardClick = (_e: React.MouseEvent) => {
        // Prevent drag-and-drop from triggering navigation if we add drag handle later
        // For now, it's fine as the whole card is draggable via listeners
        if (application.job_id) {
            window.location.href = `/jobs/${application.job_id}`;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(e as unknown as React.MouseEvent);
                }
            }}
            role="button"
            tabIndex={0}
            className={`
                bg-white rounded-xl border border-slate-200 p-4 shadow-soft
                ${isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                hover:shadow-soft-md hover:border-slate-300 transition-all
                ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-semibold text-sm text-slate-900 leading-tight truncate">
                        {application.candidate_role ?? 'Position Applied'}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        Company
                    </div>
                </div>
                {application.match_score > 0 && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {Math.round(application.match_score)}%
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                <Calendar className="w-3 h-3" />
                Applied {formatDate(application.applied_at)}
            </div>

            {application.needsFollowUp && (
                <FollowUpNudge reason={application.nudgeReason ?? ''} />
            )}

            {/* Notes toggle */}
            <button
                onClick={(e) => { e.stopPropagation(); setNotesOpen(o => !o); }}
                onPointerDown={(e) => { e.stopPropagation(); }}
                className={`w-full mt-2 flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    notesOpen || notes
                        ? 'text-sky-700 bg-sky-50 border border-sky-100'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
            >
                <span className="flex items-center gap-1">
                    <StickyNote className="w-3 h-3" />
                    {notes ? 'Notes' : 'Add notes'}
                    {reminderDate && <span className="ml-1 text-amber-600">· {reminderDate}</span>}
                </span>
                {notesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {notesOpen && (
                <div
                    role="presentation"
                    onClick={(e) => { e.stopPropagation(); }}
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    className="mt-2 space-y-2"
                >
                    <textarea
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); }}
                        placeholder="Add a private note about this application..."
                        rows={3}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white placeholder:text-slate-300"
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={reminderDate}
                            min={today}
                            onChange={(e) => { setReminderDate(e.target.value < today ? today : e.target.value); }}
                            className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-400 bg-white"
                            aria-label="Reminder date"
                        />
                        <button
                            onClick={(e) => { void handleSaveNotes(e); }}
                            disabled={saving}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save
                        </button>
                    </div>
                    {notesSaveError && (
                        <p className="text-xs text-red-600" role="alert">
                            {notesSaveError}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
