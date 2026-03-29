import React, { useEffect, useState } from "react"
import * as Sentry from "@sentry/react"
import { useParams, useNavigate } from "react-router-dom"
import { ApplicationService } from "../../features/applications/services/applicationService"
import { KanbanBoard } from "../../features/applications/components/KanbanBoard"
import type { Application, ApplicationStatus } from "../../features/applications/types"
import { JobService } from "../../features/jobs/services/jobService"
import type { JobPosting } from "../../features/jobs/types"
import { Header } from "../../components/Header"
import { Loader2, ArrowLeft, Users, ExternalLink } from "lucide-react"

import { ApplicantCard } from "../../features/applications/components/ApplicantCard"

export const JobApplicants: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = React.useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const COLUMNS = [
    { id: "applied", title: "Applied" },
    { id: "screening", title: "Screening" },
    { id: "interview", title: "Interview" },
    { id: "offer", title: "Offer" },
    { id: "hired", title: "Hired" },
    { id: "rejected", title: "Rejected" },
  ]

  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const [jobData, appData] = await Promise.all([
          JobService.getJobById(id),
          ApplicationService.getApplicationsForJob(id),
        ])

        if (!isMountedRef.current) return

        if (!jobData) {
          setError("Job posting not found.")
        } else {
          setJob(jobData)
          setApplications(appData)
        }
      } catch (err) {
        if (isMountedRef.current) {
          console.error("Error loading applicants:", err)
          setError("Failed to load application data.")
        }
      } finally {
        if (isMountedRef.current) setLoading(false)
      }
    }

    void loadData()
  }, [id])

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      // Optimistic update
      const app = applications.find((a) => a.id === appId)
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)))

      await ApplicationService.updateApplicationStatus(appId, newStatus)

      // Cross-user notifications are server-only.
      // TODO: invoke trusted backend endpoint to notify the candidate.
      if (app?.candidate_id) {
        const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
        console.warn(`[JobApplicants] Notification skipped (backend required): app=${appId}, status=${statusLabel}`)
      }
    } catch (err) {
      console.error("[JobApplicants] Failed to update status:", err)
      Sentry.captureException(err, {
        extra: { appId, newStatus, jobId: id },
      })

      // Show user feedback
      // (Prefer a toast/snackbar; avoid blocking `alert`.)
      console.error("Failed to save pipeline changes. Please check your connection and try again.")

      // Revert on error
      if (id) {
        try {
          const refreshed = await ApplicationService.getApplicationsForJob(id)
          if (isMountedRef.current) setApplications(refreshed)
        } catch (refreshErr) {
          console.error("[JobApplicants] Failed to refresh applications after error:", refreshErr)
          Sentry.captureException(refreshErr, { extra: { jobId: id } })
        }
      }
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col font-sans'>
        <Header />
        <div className='flex-grow flex flex-col items-center justify-center py-24'>
          <Loader2 className='w-8 h-8 animate-spin text-sky-600 mb-4' />
          <p className='text-sm text-slate-400'>Loading applicant pipeline...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col font-sans'>
        <Header />
        <div className='flex-grow container mx-auto px-4 py-24 text-center'>
          <h1 className='text-2xl font-semibold text-slate-900 mb-3'>Something went wrong</h1>
          <p className='text-slate-500 mb-8'>{error ?? "The job posting you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/jobs")}
            className='bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 font-semibold rounded-xl text-sm transition-colors'
          >
            Return to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col font-sans'>
      <Header />

      <main className='flex-grow container mx-auto px-4 md:px-8 py-12 max-w-[1600px]'>
        <div className='mb-10 border-b border-slate-200 pb-8'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 mb-6 text-sm font-medium text-slate-500 hover:text-sky-700 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' /> Back to dashboard
          </button>

          <div className='flex flex-col md:flex-row justify-between items-start gap-6'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold text-slate-900 mb-3'>Applicant Pipeline</h1>
              <div className='flex items-center gap-3'>
                <span className='bg-sky-100 text-sky-700 px-3 py-1 text-xs font-medium rounded-full'>{job.title}</span>
                <div className='flex items-center gap-1.5 text-slate-400 text-xs'>
                  <Users className='w-3.5 h-3.5' /> {applications.length} Total Applicants
                </div>
              </div>
            </div>

            <button
              onClick={() => window.open(`/jobs`, "_blank")}
              className='flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors'
            >
              View Live Post <ExternalLink className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>

        <KanbanBoard<Application>
          items={applications}
          columns={COLUMNS}
          onStatusChange={(appId, newStatus) => {
            void handleStatusChange(appId, newStatus as ApplicationStatus)
          }}
          renderCard={(app) => <ApplicantCard application={app} />}
          renderOverlayCard={(app) => <ApplicantCard application={app} />}
        />
      </main>
    </div>
  )
}
