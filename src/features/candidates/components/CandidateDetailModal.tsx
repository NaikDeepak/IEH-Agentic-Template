import React, { useEffect, useState } from "react"
import {
  X,
  User,
  Briefcase,
  MapPin,
  Star,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Globe,
  Github,
  Linkedin,
  Clock,
  Target,
  MessageSquare,
  Send,
  Check,
} from "lucide-react"
import { FocusTrap } from "focus-trap-react"
import type { CandidateSearchResult } from "../../../lib/ai/search"
import { SavedCandidatesService } from "../services/savedCandidatesService"
import { useAuth } from "../../../hooks/useAuth"

interface CandidateDetailModalProps {
  candidate: CandidateSearchResult | null
  isOpen: boolean
  onClose: () => void
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, isOpen, onClose }) => {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [savingLoading, setSavingLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !user || !candidate) {
      setCheckingStatus(false)
      return
    }
    const check = async () => {
      setCheckingStatus(true)
      try {
        const result = await SavedCandidatesService.isSaved(user.uid, candidate.id)
        setSaved(result)
      } catch {
        // non-fatal
      } finally {
        setCheckingStatus(false)
      }
    }
    void check()
  }, [isOpen, user, candidate])

  useEffect(() => {
    if (!isOpen) {
      setShowContact(false)
      setContactMessage("")
      setContactSent(false)
      setContactError(null)
      return
    }
    setShowContact(false)
    setContactMessage("")
    setContactSent(false)
    setContactError(null)
  }, [isOpen, candidate?.id])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, onClose])

  const handleToggleSave = async () => {
    if (!user || !candidate) return
    setSavingLoading(true)
    try {
      if (saved) {
        await SavedCandidatesService.unsave(user.uid, candidate.id)
        setSaved(false)
      } else {
        await SavedCandidatesService.save(user.uid, candidate)
        setSaved(true)
      }
    } catch (err) {
      console.error("[CandidateDetailModal] save toggle failed:", err)
    } finally {
      setSavingLoading(false)
    }
  }

  const handleContact = () => {
    if (!user || !candidate || !contactMessage.trim()) return
    setContactSending(true)
    setContactError(null)
    try {
      throw new Error('Messaging delivery is not available yet. Please use email/LinkedIn links for now.')
    } catch (err) {
      console.error("[CandidateDetailModal] contact send failed:", err)
      setContactError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setContactSending(false)
    }
  }

  if (!isOpen || !candidate) return null

  const skillList: string[] = Array.isArray(candidate.skills)
    ? candidate.skills
    : typeof candidate.skills === "string"
      ? candidate.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-100"
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-100"
    return "text-slate-500 bg-slate-50 border-slate-200"
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-center justify-center'
      role='dialog'
      aria-modal='true'
      aria-label='Candidate profile'
    >
      {/* Backdrop */}
      <div className='absolute inset-0 bg-slate-900/50 backdrop-blur-sm' role='presentation' onClick={onClose} />

      <FocusTrap>
        <div className='relative z-10 bg-white w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-5 border-b border-slate-100'>
            <h2 className='text-base font-bold text-slate-900'>Candidate Profile</h2>
            <button
              onClick={onClose}
              className='p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors'
              aria-label='Close'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Scrollable body */}
          <div className='overflow-y-auto flex-1 px-6 py-5 space-y-5'>
            {/* Identity row */}
            <div className='flex items-start gap-4'>
              <div className='w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden'>
                {candidate.photoURL ? (
                  <img
                    src={candidate.photoURL}
                    alt={candidate.displayName ?? "Candidate"}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User className='w-6 h-6 text-slate-400' />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-bold text-slate-900 leading-tight'>
                  {candidate.displayName ?? "Anonymous Candidate"}
                </h3>
                {candidate.jobTitle && (
                  <p className='text-sm text-slate-500 flex items-center gap-1.5 mt-0.5'>
                    <Briefcase className='w-3.5 h-3.5' />
                    {candidate.jobTitle}
                  </p>
                )}
                {candidate.location && (
                  <p className='text-sm text-slate-400 flex items-center gap-1.5 mt-0.5'>
                    <MapPin className='w-3.5 h-3.5' />
                    {candidate.location}
                  </p>
                )}
              </div>
              {candidate.matchScore !== undefined && (
                <span
                  className={`shrink-0 px-2.5 py-0.5 border rounded-full text-xs font-semibold flex items-center gap-1 ${getMatchColor(candidate.matchScore)}`}
                >
                  <Star className='w-3 h-3 fill-current' />
                  {Math.round(candidate.matchScore)}% match
                </span>
              )}
            </div>

            {/* Bio */}
            {candidate.bio && (
              <div>
                <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5'>About</p>
                <p className='text-sm text-slate-600 leading-relaxed'>{candidate.bio}</p>
              </div>
            )}

            {/* Quick facts */}
            <div className='grid grid-cols-2 gap-3'>
              {candidate.experience && (
                <FactChip
                  icon={<Briefcase className='w-3.5 h-3.5' />}
                  label='Experience'
                  value={candidate.experience}
                />
              )}
              {candidate.availability && (
                <FactChip
                  icon={<Clock className='w-3.5 h-3.5' />}
                  label='Availability'
                  value={candidate.availability}
                />
              )}
              {candidate.preferredRole && (
                <FactChip
                  icon={<Target className='w-3.5 h-3.5' />}
                  label='Preferred Role'
                  value={candidate.preferredRole}
                />
              )}
            </div>

            {/* Skills */}
            {skillList.length > 0 && (
              <div>
                <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2'>Skills</p>
                <div className='flex flex-wrap gap-1.5'>
                  {skillList.map((skill, i) => (
                    <span
                      key={i}
                      className='px-2.5 py-0.5 text-xs font-medium border border-slate-200 bg-slate-50 text-slate-600 rounded-full'
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(candidate.linkedIn ?? candidate.portfolio ?? candidate.github) && (
              <div>
                <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2'>Links</p>
                <div className='flex flex-wrap gap-2'>
                  {candidate.linkedIn && (
                    <a
                      href={candidate.linkedIn}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-100 rounded-lg hover:bg-sky-100 transition-colors'
                    >
                      <Linkedin className='w-3.5 h-3.5' /> LinkedIn
                    </a>
                  )}
                  {candidate.portfolio && (
                    <a
                      href={candidate.portfolio}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors'
                    >
                      <Globe className='w-3.5 h-3.5' /> Portfolio
                    </a>
                  )}
                  {candidate.github && (
                    <a
                      href={candidate.github}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors'
                    >
                      <Github className='w-3.5 h-3.5' /> GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact message compose */}
          {showContact && (
            <div className='px-6 py-4 border-t border-slate-100 bg-slate-50'>
              <div className='mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700'>
                Contact delivery endpoint is pending. Message sending is temporarily disabled.
              </div>
              {contactSent ? (
                <div className='flex items-center gap-2 text-sm text-emerald-700 font-semibold py-2'>
                  <Check className='w-4 h-4' /> Message sent!
                </div>
              ) : (
                <div className='space-y-3'>
                  <p className='text-xs font-semibold text-slate-600'>
                    Message to {candidate.displayName ?? "candidate"}
                  </p>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => {
                      setContactMessage(e.target.value)
                    }}
                    placeholder="Introduce yourself and explain why you'd like to connect..."
                    rows={3}
                    className='w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none'
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        handleContact()
                      }}
                      disabled
                      className='flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-xl transition-colors disabled:opacity-50'
                    >
                      {contactSending ? (
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      ) : (
                        <Send className='w-3.5 h-3.5' />
                      )}
                      Send
                    </button>
                    <button
                      onClick={() => {
                        setShowContact(false)
                      }}
                      className='px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors'
                    >
                      Cancel
                    </button>
                  </div>
                  {contactError && <p className='text-xs text-red-600'>{contactError}</p>}
                </div>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className='px-6 py-4 border-t border-slate-100 flex gap-3'>
            <button
              onClick={() => void handleToggleSave()}
              disabled={savingLoading || checkingStatus}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-colors disabled:opacity-50 ${
                saved
                  ? "bg-sky-700 text-white border-sky-700 hover:bg-sky-800"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {savingLoading || checkingStatus ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : saved ? (
                <BookmarkCheck className='w-4 h-4' />
              ) : (
                <Bookmark className='w-4 h-4' />
              )}
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => {
                setShowContact((c) => !c)
              }}
              className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-colors'
            >
              <MessageSquare className='w-4 h-4' /> Contact
            </button>
            <button
              onClick={onClose}
              className='flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  )
}

interface FactChipProps {
  icon: React.ReactNode
  label: string
  value: string
}
const FactChip: React.FC<FactChipProps> = ({ icon, label, value }) => (
  <div className='bg-slate-50 rounded-xl border border-slate-200 p-3'>
    <p className='text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5'>
      {icon} {label}
    </p>
    <p className='text-xs font-semibold text-slate-700'>{value}</p>
  </div>
)
