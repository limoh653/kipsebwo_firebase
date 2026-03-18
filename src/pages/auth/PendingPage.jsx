import { Link } from 'react-router-dom'
import { Clock, GraduationCap } from 'lucide-react'

export default function PendingPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0f1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 80, height: 80, background: 'rgba(245,158,11,0.1)',
          border: '2px solid rgba(245,158,11,0.3)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Clock size={36} color="#f59e0b" />
        </div>
        <h1 style={{ fontFamily: 'Syne', fontSize: 26, marginBottom: 12 }}>Pending Approval</h1>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 32 }}>
          Your registration has been submitted and is awaiting administrator approval.
          You will be able to log in once your account is activated.
        </p>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#1d4ed8', color: 'white', padding: '12px 28px',
          borderRadius: 10, fontWeight: 600, fontSize: 14
        }}>
          Back to Login
        </Link>
      </div>
    </div>
  )
}
