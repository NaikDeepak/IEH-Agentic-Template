import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicationService } from '../../features/applications/services/applicationService';
import { KanbanBoard } from '../../features/applications/components/KanbanBoard';
import { Application, ApplicationStatus } from '../../features/applications/types';
import { JobService } from '../../features/jobs/services/jobService';
import { JobPosting } from '../../features/jobs/types';
import { Header } from '../../components/Header';
import { Loader2, ArrowLeft, Users, ExternalLink } from 'lucide-react';

export const JobApplicants: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [jobData, appData] = await Promise.all([
                    JobService.getJobById(id),
                    ApplicationService.getApplicationsForJob(id)
                ]);

                if (!jobData) {
                    setError("Job posting not found.");
                } else {
                    setJob(jobData);
                    setApplications(appData);
                }
            } catch (err) {
                console.error("Error loading applicants:", err);
                setError("Failed to load application data.");
            } finally {
                setLoading(false);
            }
        };

        void loadData();
    }, [id]);

    const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
        try {
            // Optimistic update
            setApplications(prev => prev.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));

            await ApplicationService.updateApplicationStatus(appId, newStatus);
        } catch (err) {
            console.error("Failed to update status:", err);
            // Revert on error
            if (id) {
                const refreshed = await ApplicationService.getApplicationsForJob(id);
                setApplications(refreshed);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-12 h-12 animate-spin text-black mb-6" />
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500">Scanning Pipeline...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <div className="flex-grow container mx-auto px-4 py-24 text-center">
                    <h1 className="text-4xl font-black uppercase mb-4">Pipeline Error</h1>
                    <p className="font-mono text-gray-500 mb-8">{error ?? "The job posting you're looking for doesn't exist."}</p>
                    <button
                        onClick={() => navigate('/jobs')}
                        className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest"
                    >
                        Return to Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-black">
            <Header />

            <main className="flex-grow container mx-auto px-4 md:px-8 py-12 max-w-[1600px]">
                <div className="mb-12 border-b-4 border-black pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">
                                Applicant Pipeline
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="bg-black text-white px-2 py-1 text-xs font-mono font-bold uppercase">
                                    {job.title}
                                </span>
                                <div className="flex items-center gap-1 text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                                    <Users className="w-3 h-3" /> {applications.length} Total Applicants
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.open(`/jobs`, '_blank')}
                            className="flex items-center gap-2 border-2 border-black px-4 py-2 font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all"
                        >
                            View Live Post <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <KanbanBoard
                    applications={applications}
                    onStatusChange={handleStatusChange}
                />
            </main>
        </div>
    );
};
