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
            <div className="min-h-screen bg-slate-50 flex flex-col">
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
            <div className="min-h-screen bg-slate-50 flex flex-col">
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
            <div className="min-h-screen bg-slate-50 flex flex-col">
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
              <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-grow p-8">
                  <h1 className="text-2xl font-bold">Dashboard (Placeholder)</h1>
                </main>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-grow p-8">
                  <h1 className="text-2xl font-bold">Post a Job (Placeholder)</h1>
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
                  <Route path="users" element={<div>Users Management (Placeholder)</div>} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="settings" element={<div>Admin Settings (Placeholder)</div>} />
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
