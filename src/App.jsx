import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import AppShell from './components/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Messages from './pages/Messages.jsx'
import Students from './pages/Students.jsx'
import ClassPage from './pages/ClassPage.jsx'
import Calendar from './pages/Calendar.jsx'
import Consent from './pages/Consent.jsx'
import Newsletters from './pages/Newsletters.jsx'
import Letters from './pages/Letters.jsx'
import ClassPagesAdmin from './pages/ClassPagesAdmin.jsx'
import Surveys from './pages/Surveys.jsx'

export default function App() {
  const { session, staffMember, isTeacher, loading } = useAuth()

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Loading…</div>
  }
  if (!session) return <Login />
  if (!staffMember) return <Onboarding />

  return (
    <Routes>
      <Route element={<AppShell />}>
        {isTeacher ? (
          <>
            <Route path="/class-page" element={<ClassPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<Navigate to="/class-page" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/consent" element={<Consent />} />
            <Route path="/newsletters" element={<Newsletters />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/class-pages" element={<ClassPagesAdmin />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/students" element={<Students />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Route>
    </Routes>
  )
}
