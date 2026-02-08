import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { trackUserActivity } from './lib/activity';
import { LandingPage } from './pages/LandingPage'
import { Register } from './pages/Register'
import { Header } from './components/Header'
import { RoleSelection } from './components/RoleSelection'
import { Login } from './components/Login'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import { JobsPage } from './pages/JobsPage'
import { PostJob } from './pages/PostJob'
import { TalentSearch } from './pages/employer/TalentSearch'
import { ProtectedRoute } from './components/ProtectedRoute'

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
              <div className="min-h-screen bg-white flex flex-col font-sans text-black">
                <Header />
                <main className="flex-grow p-8 md:p-12">
                  <div className="border-2 border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Dashboard</h1>
                    <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">
                      Your command center is under construction.
                    </p>
                    <div className="h-2 w-24 bg-black"></div>
                  </div>
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
