import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage'
import { Register } from './pages/Register'
import { Header } from './components/Header'
import { RoleSelection } from './components/RoleSelection'
import { Login } from './components/Login'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
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

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<div>Users Management (Placeholder)</div>} />
                <Route path="jobs" element={<div>Jobs Management (Placeholder)</div>} />
                <Route path="settings" element={<div>Admin Settings (Placeholder)</div>} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
