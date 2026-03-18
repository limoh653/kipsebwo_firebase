import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, Trash2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_trail').select('*').order('created_at', { ascending: false }).limit(50)
    ])
    setProfiles(p || []); setAuditLogs(a || [])
  }

  async function approveUser(profile) {
    const { error } = await supabase.from('user_profiles').update({ is_approved: true }).eq('id', profile.id)
    if (error) { toast.error(error.message); return }
    await supabase.from('audit_trail').insert({ user_id: user.id, username: user.email, action: `Approved user: ${profile.username}` })
    toast.success(`${profile.username} approved!`)
    fetchAll()
  }

  async function deleteUser(profile) {
    if (!confirm(`Delete user "${profile.username}"? This cannot be undone.`)) return
    // Delete from auth via Supabase admin or just mark as unapproved
    // Note: full auth deletion requires service role key — here we just revoke access
    const { error } = await supabase.from('user_profiles').delete().eq('id', profile.id)
    if (error) { toast.error(error.message); return }
    await supabase.from('audit_trail').insert({ user_id: user.id, username: user.email, action: `Deleted user profile: ${profile.username}` })
    toast.success(`${profile.username} removed.`)
    fetchAll()
  }

  const pending = profiles.filter(p => !p.is_approved)
  const active = profiles.filter(p => p.is_approved && p.id !== user?.id)

  const deptColors = {
    finance: '#f59e0b', admissions: '#3b82f6',
    examinations: '#8b5cf6', stores: '#22c55e', admin: '#ef4444'
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage users, approvals and audit logs</p>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="stat-value">{pending.length}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #22c55e' }}>
          <div className="stat-value">{active.length}</div>
          <div className="stat-label">Active Users</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <div className="stat-value">{profiles.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #8b5cf6' }}>
          <div className="stat-value">{auditLogs.length}</div>
          <div className="stat-label">Recent Actions</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #2a3347' }}>
        {['users','audit'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', color: activeTab === tab ? '#e2e8f0' : '#64748b',
              padding: '10px 20px', borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: -1, textTransform: 'capitalize'
            }}>
            {tab === 'audit' ? 'Audit Trail' : 'Users'}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {pending.length > 0 && (
            <div className="card" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              <h3 style={{ fontSize: 15, marginBottom: 16, color: '#ef4444' }}>⏳ Pending Approval ({pending.length})</h3>
              <table>
                <thead>
                  <tr><th>Username</th><th>Department</th><th>Registered</th><th></th></tr>
                </thead>
                <tbody>
                  {pending.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.username}</td>
                      <td>
                        <span className="badge" style={{ background: `${deptColors[p.department]}20`, color: deptColors[p.department] }}>
                          {p.department}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-green btn-sm" onClick={() => approveUser(p)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button className="btn-danger btn-sm" onClick={() => deleteUser(p)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Trash2 size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card">
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Active Users</h3>
            <table>
              <thead>
                <tr><th>Username</th><th>Department</th><th>Status</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {active.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.username}</td>
                    <td>
                      <span className="badge" style={{ background: `${deptColors[p.department]}20`, color: deptColors[p.department] }}>
                        {p.department}
                      </span>
                    </td>
                    <td><span className="badge badge-green">Active</span></td>
                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => deleteUser(p)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Audit Trail (last 50 actions)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>User</th><th>Action</th><th>Time</th></tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: 13, color: '#60a5fa' }}>{log.username || 'System'}</td>
                    <td>{log.action}</td>
                    <td style={{ color: '#94a3b8', fontSize: 13, whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
