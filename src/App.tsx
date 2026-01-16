import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage'
import { Header } from './components/Header'
import { RoleSelection } from './components/RoleSelection'
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
