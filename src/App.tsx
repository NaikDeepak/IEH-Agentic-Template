import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { trackUserActivity } from './lib/activity';
import { LandingPage } from './pages/LandingPage'
import { Register } from './pages/Register'
import { SeekerDashboard } from './pages/seeker/Dashboard'
import { ResumeAnalyzer } from './features/seeker/components/ResumeAnalyzer/ResumeAnalyzer'
import { GapAnalysis } from './features/seeker/components/SkillGap/GapAnalysis'
import { InterviewPrep } from './features/seeker/components/Interview/InterviewPrep'
import { SkillProofs } from './features/seeker/components/Assessments/SkillProofs'
import { InsiderConnections } from './features/seeker/components/Networking/InsiderConnections'
import { ApplicationBoard } from './features/seeker/components/ApplicationBoard/ApplicationBoard'
import { ProfileEditor } from './features/seeker/components/Profile/ProfileEditor'
import { TrackerService } from './features/seeker/services/trackerService'
import { Header } from './components/Header'
import { RoleSelection } from './components/RoleSelection'
import { Login } from './components/Login'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import { JobsPage } from './pages/JobsPage'
import { PostJob } from './pages/PostJob'
import { TalentSearch } from './pages/employer/TalentSearch'
import { CompanyEditor } from './pages/employer/CompanyEditor'
import { CompanyProfile } from './pages/CompanyProfile'
import { JobApplicants } from './pages/employer/JobApplicants'
import { EmployerJobs } from './pages/employer/EmployerJobs'
import { JobDetailPage } from './pages/JobDetailPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import FinancialDashboard from './pages/admin/FinancialDashboard';

import { Navigate } from 'react-router-dom';

function DashboardRedirect() {
  const { userData } = useAuth();
  if (userData?.role === 'admin') return <Navigate to="/admin" replace />;
  if (userData?.role === 'employer') return <Navigate to="/employer/jobs" replace />;
  return <Navigate to="/seeker/dashboard" replace />;
}

import { useState, useCallback } from 'react';
import type { Application, ApplicationStatus } from './features/applications/types';
import { ApplicationService } from './features/applications/services/applicationService';

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
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white flex flex-col font-sans text-black">
              <Header />
              <RoleSelection />
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
    </Router>
  )
}

export default App
