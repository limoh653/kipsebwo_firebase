import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Users, DollarSign, BookOpen, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    students: 0, totalCollected: 0, exams: 0, consumables: 0
  })

  // Redirect non-admin users to their department immediately
  useEffect(() => {
    if (!profile) return
    const deptRoute = {
      finance: '/finance',
      admissions: '/admissions',
      examinations: '/examinations',
      stores: '/stores',
    }
    if (profile.department !== 'admin' && deptRoute[profile.department]) {
      navigate(deptRoute[profile.department], { replace: true })
    }
  }, [profile])

  useEffect(() => {
    if (profile?.department !== 'admin') return
    async function loadStats() {
      const [
        { count: students },
        { count: exams },
        { count: consumables },
        { data: paymentData }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('examinations').select('*', { count: 'exact', head: true }),
        supabase.from('consumables').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount')
      ])
      const total = (paymentData || []).reduce((s, p) => s + Number(p.amount), 0)
      setStats({ students: students || 0, exams: exams || 0, consumables: consumables || 0, totalCollected: total })
    }
    loadStats()
  }, [profile])

  // Don't render anything for non-admin (they're being redirected)
  if (!profile || profile.department !== 'admin') return null

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: '#3b82f6', path: '/admissions' },
    { label: 'Total Collected', value: `KES ${stats.totalCollected.toLocaleString()}`, icon: DollarSign, color: '#22c55e', path: '/finance' },
    { label: 'Exam Records', value: stats.exams, icon: BookOpen, color: '#8b5cf6', path: '/examinations' },
    { label: 'Store Items', value: stats.consumables, icon: Package, color: '#f59e0b', path: '/stores' },
  ]

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Welcome back, {profile.username}</h1>
        <p>St. Augustine Kipsebwo Vocational Training Centre — Admin Overview</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, color, path }) => (
          <div
            key={label}
            className="stat-card"
            onClick={() => navigate(path)}
            style={{ cursor: 'pointer', borderTop: `3px solid ${color}`, transition: 'transform 0.15s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-4">
        {[
          { label: 'Admissions', path: '/admissions', color: '#3b82f6' },
          { label: 'Finance', path: '/finance', color: '#22c55e' },
          { label: 'Examinations', path: '/examinations', color: '#8b5cf6' },
          { label: 'Stores', path: '/stores', color: '#f59e0b' },
        ].map(d => (
          <button key={d.label} onClick={() => navigate(d.path)}
            className="card"
            style={{
              cursor: 'pointer', textAlign: 'left', border: `1px solid ${d.color}40`,
              borderTop: `3px solid ${d.color}`, transition: 'transform 0.15s',
              fontWeight: 600, fontSize: 14, color: '#e2e8f0'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            Go to {d.label} →
          </button>
        ))}
      </div>
    </div>
  )
}