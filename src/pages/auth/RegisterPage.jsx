import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { GraduationCap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  { value: 'finance', label: 'Finance' },
  { value: 'admissions', label: 'Admissions' },
  { value: 'examinations', label: 'Examinations' },
  { value: 'stores', label: 'Stores' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', department: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.department) { toast.error('Please select a department'); return }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username } }
    })

    if (error) { toast.error(error.message); setLoading(false); return }

    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      username: form.username,
      department: form.department,
      is_approved: false
    })

    if (profileError) { toast.error(profileError.message); setLoading(false); return }

    await supabase.auth.signOut()
    setLoading(false)
    setDone(true)
  }

  if (done) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f1117',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{
            width: 80, height: 80,
            background: 'rgba(34,197,94,0.1)',
            border: '2px solid rgba(34,197,94,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px'
          }}>
            <CheckCircle size={38} color="#22c55e" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, marginBottom: 14 }}>
            Registration Submitted
          </h1>
          <p style={{ color: '#64748b', lineHeight: 1.9, marginBottom: 6 }}>
            Your account has been created for the{' '}
            <strong style={{ color: '#e2e8f0', textTransform: 'capitalize' }}>
              {form.department}
            </strong>{' '}
            department.
          </p>
          <p style={{ color: '#64748b', lineHeight: 1.9, marginBottom: 36 }}>
            An administrator needs to approve your account before you can log in. Please check back later.
          </p>
          <Link to="/login" style={{
            display: 'inline-block',
            background: '#1d4ed8', color: 'white',
            padding: '12px 36px', borderRadius: 10,
            fontWeight: 600, fontSize: 14, textDecoration: 'none'
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 60, height: 60, background: '#1d4ed8', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <GraduationCap size={30} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>Create Account</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
            Registration requires admin approval
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Full Name / Username</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                required
              >
                <option value="">Select your department</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Registering…' : 'Register Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3b82f6' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}