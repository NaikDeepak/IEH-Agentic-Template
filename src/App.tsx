import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import * as Sentry from '@sentry/react';
import { useAuth } from './hooks/useAuth';
import { trackUserActivity } from './lib/activity';
import { Header } from './components/Header'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ApplicationService } from './features/applications/services/applicationService';
import { TrackerService } from './features/seeker/services/trackerService';
import type { Application, ApplicationStatus } from './features/applications/types';

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const SeekerDashboard = lazy(() => import('./pages/seeker/Dashboard').then(module => ({ default: module.SeekerDashboard })));
const ResumeAnalyzer = lazy(() => import('./features/seeker/components/ResumeAnalyzer/ResumeAnalyzer').then(module => ({ default: module.ResumeAnalyzer })));
const GapAnalysis = lazy(() => import('./features/seeker/components/SkillGap/GapAnalysis').then(module => ({ default: module.GapAnalysis })));
const InterviewPrep = lazy(() => import('./features/seeker/components/Interview/InterviewPrep').then(module => ({ default: module.InterviewPrep })));
const SkillProofs = lazy(() => import('./features/seeker/components/Assessments/SkillProofs').then(module => ({ default: module.SkillProofs })));
const InsiderConnections = lazy(() => import('./features/seeker/components/Networking/InsiderConnections').then(module => ({ default: module.InsiderConnections })));
const ApplicationBoard = lazy(() => import('./features/seeker/components/ApplicationBoard/ApplicationBoard').then(module => ({ default: module.ApplicationBoard })));
const ProfileEditor = lazy(() => import('./features/seeker/components/Profile/ProfileEditor').then(module => ({ default: module.ProfileEditor })));
const ReferralDashboard = lazy(() => import('./features/growth/components/ReferralDashboard').then(module => ({ default: module.ReferralDashboard })));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const FinancialDashboard = lazy(() => import('./pages/admin/FinancialDashboard'));
const JobsPage = lazy(() => import('./pages/JobsPage').then(module => ({ default: module.JobsPage })));
const PostJob = lazy(() => import('./pages/PostJob').then(module => ({ default: module.PostJob })));
const TalentSearch = lazy(() => import('./pages/employer/TalentSearch').then(module => ({ default: module.TalentSearch })));
const CompanyEditor = lazy(() => import('./pages/employer/CompanyEditor').then(module => ({ default: module.CompanyEditor })));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile').then(module => ({ default: module.CompanyProfile })));
const JobApplicants = lazy(() => import('./pages/employer/JobApplicants').then(module => ({ default: module.JobApplicants })));
const EmployerJobs = lazy(() => import('./pages/employer/EmployerJobs').then(module => ({ default: module.EmployerJobs })));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage').then(module => ({ default: module.JobDetailPage })));
const Login = lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const AuthEntry = lazy(() => import('./pages/AuthEntry').then(module => ({ default: module.AuthEntry })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(module => ({ default: module.VerifyEmail })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })));
const RoleSelection = lazy(() => import('./components/RoleSelection').then(module => ({ default: module.RoleSelection })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })));


// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-sky-50 flex-col gap-4">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 bg-sky-700 rounded-lg flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-sm tracking-tight">WM</span>
      </div>
      <span className="text-lg font-bold text-slate-900">WorkMila</span>
    </div>
    <div className="w-8 h-8 border-2 border-sky-700 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function DashboardRedirect() {
  const { userData, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (userData?.role === 'admin') return <Navigate to="/admin" replace />;

  // New users with a role but explicit incomplete onboarding go to the wizard
  if (userData?.role && userData.onboarding_complete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  if (userData?.role === 'employer') return <Navigate to="/employer/jobs" replace />;
  return <Navigate to="/seeker/dashboard" replace />;
}

function SeekerTrackerPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await TrackerService.getSeekerApplications(user.uid);
      setApplications(data);
    } catch (error) {
      Sentry.captureException(error);
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const handleStatusChange = async (itemId: string, newStatus: ApplicationStatus) => {
    try {
      await ApplicationService.updateApplicationStatus(itemId, newStatus);
      setApplications(prev =>
        prev.map(app => (app.id === itemId ? { ...app, status: newStatus } : app))
      );
    } catch (error) {
      Sentry.captureException(error);
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return (
    <div className="space-y-3" aria-label="Loading application tracker" role="status">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-slate-100 rounded-lg mb-3" />
          <div className="flex gap-4">
            <div className="h-3 w-1/4 bg-slate-100 rounded-lg" />
            <div className="h-3 w-1/4 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-6 border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest">My Applications</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Application Tracker</h1>
      </div>
      <ApplicationBoard applications={applications} onStatusChange={handleStatusChange} />
    </div>
  );
}

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      void trackUserActivity(user.uid);
    }
  }, [user]);

  return (
    <Router>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-sky-700 text-white font-semibold text-sm rounded-lg pointer-events-auto">
        Skip to Content
      </a>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          classNames: {
            toast: 'font-sans text-sm rounded-xl border border-slate-200 shadow-soft',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <RoleSelection />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <main id="main-content" className="flex-grow">
                  <LandingPage />
                </main>
              </div>
            }
          />

          <Route
            path="/jobs"
            element={<JobsPage />}
          />

          <Route
            path="/jobs/:id"
            element={<JobDetailPage />}
          />

          <Route
            path="/pricing"
            element={
              <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
                <Header />
                <main id="main-content" className="flex-grow">
                  <PricingPage />
                </main>
              </div>
            }
          />

          <Route
            path="/companies/:id"
            element={<CompanyProfile />}
          />

          {/* Auth — role picker entry points */}
          <Route
            path="/register"
            element={
              user ? <DashboardRedirect /> : (
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main id="main-content" className="flex-grow">
                    <AuthEntry mode="register" />
                  </main>
                </div>
              )
            }
          />

          <Route
            path="/register/seeker"
            element={
              user ? <DashboardRedirect /> : (
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                    <main id="main-content" className="flex-grow">
                      {/* eslint-disable-next-line jsx-a11y/aria-role */}
                      <Register role="seeker" />
                    </main>
                </div>
              )
            }
          />

          <Route
            path="/register/employer"
            element={
              user ? <DashboardRedirect /> : (
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                    <main id="main-content" className="flex-grow">
                      {/* eslint-disable-next-line jsx-a11y/aria-role */}
                      <Register role="employer" />
                    </main>
                </div>
              )
            }
          />

          <Route
            path="/login"
            element={
              user ? <DashboardRedirect /> : (
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow">
                    <AuthEntry mode="login" />
                  </main>
                </div>
              )
            }
          />

          <Route
            path="/login/seeker"
            element={
              user ? <DashboardRedirect /> : (
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                    <main className="flex-grow flex items-center justify-center p-4">
                      {/* eslint-disable-next-line jsx-a11y/aria-role */}
                      <Login variant="card" role="seeker" />
                    </main>
                </div>
              )
            }
          />

          <Route
            path="/login/employer"
            element={
              user ? <DashboardRedirect /> : (
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                    <main className="flex-grow flex items-center justify-center p-4">
                      {/* eslint-disable-next-line jsx-a11y/aria-role */}
                      <Login variant="card" role="employer" />
                    </main>
                </div>
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowedRoles={['seeker', 'employer']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow">
                    <Onboarding />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/verify-email"
            element={
              <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <main className="flex-grow">
                  <VerifyEmail />
                </main>
              </div>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['seeker', 'employer', 'admin']}>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/resume"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 md:px-8 py-10 max-w-4xl">
                    <ResumeAnalyzer />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/skills"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
                    <GapAnalysis />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/interview"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 md:px-8 py-10 max-w-4xl">
                    <InterviewPrep />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/assessments"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
                    <SkillProofs />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/networking"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
                    <InsiderConnections />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/tracker"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-sky-50 flex flex-col font-sans">
                  <Header />
                  <main className="flex-grow container mx-auto px-4 md:px-8 py-10 max-w-7xl">
                    <SeekerTrackerPage />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/profile"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main id="main-content" className="flex-grow">
                    <ProfileEditor />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seeker/referral"
            element={
              <ProtectedRoute allowedRoles={['seeker']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
                    <ReferralDashboard />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/post-job"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <PostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/search"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main id="main-content" className="flex-grow">
                    <TalentSearch />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/company"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main id="main-content" className="flex-grow">
                    <CompanyEditor />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/jobs/:id/applicants"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <JobApplicants />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<div className="font-mono text-xs font-bold uppercase tracking-widest">Users Management (Placeholder)</div>} />
                    <Route path="jobs" element={<JobsPage />} />
                    <Route path="finance" element={<FinancialDashboard />} />
                    <Route path="settings" element={<div className="font-mono text-xs font-bold uppercase tracking-widest">Admin Settings (Placeholder)</div>} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
