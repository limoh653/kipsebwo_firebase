import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, DollarSign, BookOpen,
  Package, Shield, LogOut, GraduationCap
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', depts: ['finance','admissions','examinations','stores','admin'] },
  { to: '/admissions', icon: Users, label: 'Admissions', depts: ['admissions','admin'] },
  { to: '/finance', icon: DollarSign, label: 'Finance', depts: ['finance','admin'] },
  { to: '/examinations', icon: BookOpen, label: 'Examinations', depts: ['examinations','admin'] },
  { to: '/stores', icon: Package, label: 'Stores', depts: ['stores','admin'] },
  { to: '/admin', icon: Shield, label: 'Admin Panel', depts: ['admin'] },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const visibleNav = NAV.filter(item =>
    !profile || item.depts.includes(profile.department)
  )

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const deptColors = {
    finance: '#f59e0b',
    admissions: '#3b82f6',
    examinations: '#8b5cf6',
    stores: '#22c55e',
    admin: '#ef4444',
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0d1119', borderRight: '1px solid #1e2535',
        display: 'flex', flexDirection: 'column', padding: '0', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e2535' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, background: '#1d4ed8', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>KIPSEBWO</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>VTC System</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {visibleNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                color: isActive ? '#e2e8f0' : '#64748b',
                background: isActive ? '#1e2535' : 'transparent',
                fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                textDecoration: 'none'
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e2535' }}>
          {profile && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: '#1e2535', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{profile.username}</div>
              <div style={{
                fontSize: 11, color: deptColors[profile.department] || '#64748b',
                textTransform: 'capitalize', marginTop: 2
              }}>
                {profile.department}
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '10px 12px', borderRadius: 8,
              background: 'transparent', color: '#64748b',
              border: '1px solid #1e2535', fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={e => e.currentTarget.style.color = '#64748b'}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  )
}
