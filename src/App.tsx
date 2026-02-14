import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
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
const RoleSelection = lazy(() => import('./components/RoleSelection').then(module => ({ default: module.RoleSelection })));


// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function DashboardRedirect() {
  const { userData } = useAuth();
  if (userData?.role === 'admin') return <Navigate to="/admin" replace />;
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
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <div className="p-12 text-center font-mono font-bold uppercase">Loading Tracker...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Application Tracker</h1>
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
      <Suspense fallback={<PageLoader />}>
        <RoleSelection />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <main className="flex-grow">
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
            path="/companies/:id"
            element={<CompanyProfile />}
          />

          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <main className="flex-grow">
                  <Register />
                </main>
              </div>
            }
          />

          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                  <Login variant="card" />
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
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
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
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
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
                <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                  <Header />
                  <main className="flex-grow p-8">
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
                  <main className="flex-grow">
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
                  <main className="flex-grow">
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
                  <main className="flex-grow">
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
