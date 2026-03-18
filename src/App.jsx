import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import PendingPage from './pages/auth/PendingPage'
import Dashboard from './pages/Dashboard'
import AdmissionsPage from './pages/admissions/AdmissionsPage'
import StudentProfile from './pages/admissions/StudentProfile'
import FinancePage from './pages/finance/FinancePage'
import ExaminationsPage from './pages/examinations/ExaminationsPage'
import StoresPage from './pages/stores/StoresPage'
import AdminPage from './pages/admin/AdminPage'

const DEPT_HOME = {
  admissions: '/admissions',
  finance: '/finance',
  examinations: '/examinations',
  stores: '/stores',
  admin: '/admin',
}

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b' }}>
    Loading...
  </div>
)

// Used as a layout route — renders <Outlet /> or redirects
function ProtectedRoute({ allowedDepts }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <Spinner />

  if (!user) return <Navigate to="/login" replace />

  if (!profile || !profile.is_approved) return <Navigate to="/pending" replace />

  if (allowedDepts && !allowedDepts.includes(profile.department) && profile.department !== 'admin') {
    return <Navigate to={DEPT_HOME[profile.department] || '/dashboard'} replace />
  }

  return <Outlet />
}

function DeptRedirect() {
  const { profile } = useAuth()
  return <Navigate to={DEPT_HOME[profile?.department] || '/dashboard'} replace />
}

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return <Spinner />

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        !user
          ? <LoginPage />
          : <Navigate to={DEPT_HOME[profile?.department] || '/dashboard'} replace />
      } />
      <Route path="/register" element={
        !user
          ? <RegisterPage />
          : <Navigate to={DEPT_HOME[profile?.department] || '/dashboard'} replace />
      } />

      {/* Pending */}
      <Route path="/pending" element={
        !user
          ? <Navigate to="/login" replace />
          : profile?.is_approved
            ? <Navigate to={DEPT_HOME[profile.department] || '/dashboard'} replace />
            : <PendingPage />
      } />

      {/* All protected routes — first gate: logged in + approved */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          <Route path="/" element={<DeptRedirect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students/:id" element={<StudentProfile />} />

          {/* Dept-specific gates */}
          <Route element={<ProtectedRoute allowedDepts={['admissions']} />}>
            <Route path="/admissions" element={<AdmissionsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedDepts={['finance']} />}>
            <Route path="/finance" element={<FinancePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedDepts={['examinations']} />}>
            <Route path="/examinations" element={<ExaminationsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedDepts={['stores']} />}>
            <Route path="/stores" element={<StoresPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedDepts={['admin']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<DeptRedirect />} />
    </Routes>
  )
}