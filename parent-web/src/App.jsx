import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import Login from './pages/Login.jsx'
import AddChild from './pages/AddChild.jsx'
import AppShell from './components/AppShell.jsx'
import Home from './pages/Home.jsx'
import Messages from './pages/Messages.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import TermDates from './pages/TermDates.jsx'
import Consent from './pages/Consent.jsx'
import Newsletters from './pages/Newsletters.jsx'
import Letters from './pages/Letters.jsx'
import ClassPage from './pages/ClassPage.jsx'
import Surveys from './pages/Surveys.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  const { session, kids, loading } = useAuth()

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Loading…</div>
  }
  if (!session) return <Login />
  if (!kids || kids.length === 0) return <AddChild />

  return (
    <Routes>
      <Route path="/add-child" element={<AddChild />} />
      <Route element={<AppShell />}>
        <Route path="/home" element={<Home />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/term-dates" element={<TermDates />} />
        <Route path="/consent" element={<Consent />} />
        <Route path="/newsletters" element={<Newsletters />} />
        <Route path="/letters" element={<Letters />} />
        <Route path="/class-page" element={<ClassPage />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  )
}
