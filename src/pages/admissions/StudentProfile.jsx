import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, Edit2, Save, X, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { differenceInMonths } from 'date-fns'

function printAdmissionForm(student) {
  const photoUrl = student.passport_photo_url
  const admDate = new Date(student.admission_date).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const win = window.open('', '_blank', 'width=860,height=950')
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>Admission Form – ${student.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;font-size:13px;color:#000;padding:32px 40px;}
      .header{text-align:center;padding-bottom:12px;margin-bottom:18px;border-bottom:3px double #000;}
      .header h1{font-size:17px;text-transform:uppercase;letter-spacing:1px;}
      .header h2{font-size:12px;font-weight:normal;margin-top:3px;}
      .form-title{text-align:center;font-size:14px;font-weight:bold;text-decoration:underline;
        text-transform:uppercase;margin-bottom:18px;letter-spacing:1px;}
      .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
      .meta{display:flex;flex-direction:column;gap:6px;}
      .meta-box{border:1px solid #000;padding:6px 14px;font-size:13px;min-width:220px;}
      .meta-box small{display:block;font-size:10px;color:#555;text-transform:uppercase;margin-bottom:1px;}
      .photo{width:110px;height:130px;border:2px solid #000;display:flex;align-items:center;
        justify-content:center;font-size:10px;color:#888;text-align:center;overflow:hidden;flex-shrink:0;}
      .photo img{width:100%;height:100%;object-fit:cover;}
      .section{margin-bottom:14px;}
      .sec-title{background:#000;color:#fff;padding:4px 10px;font-size:11px;font-weight:bold;
        text-transform:uppercase;letter-spacing:.5px;}
      .fields{border:1px solid #000;border-top:none;}
      .row{display:flex;border-bottom:1px solid #ccc;}
      .row:last-child{border-bottom:none;}
      .cell{flex:1;padding:7px 10px;border-right:1px solid #ccc;}
      .cell:last-child{border-right:none;}
      .cell label{display:block;font-size:10px;color:#666;text-transform:uppercase;margin-bottom:2px;}
      .cell span{font-size:13px;font-weight:500;}
      .declaration{margin-top:16px;padding:12px;border:1px solid #000;font-size:12px;line-height:1.7;}
      .sigs{display:flex;justify-content:space-between;margin-top:48px;}
      .sig{text-align:center;width:175px;}
      .sig .line{border-top:1px solid #000;padding-top:5px;font-size:11px;}
      .footer{text-align:center;margin-top:24px;font-size:10px;color:#999;border-top:1px solid #ccc;padding-top:8px;}
      @media print{body{padding:15px 20px;}}
    </style></head><body>
    <div class="header">
      <h1>St. Augustine Kipsebwo Vocational Training Centre</h1>
      <h2>P.O. Box — Kipsebwo, Kenya &nbsp;|&nbsp; Tel: — &nbsp;|&nbsp; Email: —</h2>
    </div>
    <div class="form-title">Student Admission Form</div>
    <div class="top">
      <div class="meta">
        <div class="meta-box"><small>Admission Number</small>${student.admission_number}</div>
        <div class="meta-box"><small>Admission Date</small>${admDate}</div>
        <div class="meta-box"><small>Course</small>${student.course}</div>
        <div class="meta-box"><small>Residence Type</small>${student.residence}</div>
        <div class="meta-box"><small>Status</small>${student.status}</div>
      </div>
      <div class="photo">
        ${photoUrl ? `<img src="${photoUrl}" alt="Passport Photo"/>` : 'PASSPORT<br/>PHOTO'}
      </div>
    </div>
    <div class="section">
      <div class="sec-title">Personal Information</div>
      <div class="fields">
        <div class="row">
          <div class="cell"><label>Full Name</label><span>${student.name}</span></div>
          <div class="cell"><label>Sex</label><span>${student.sex}</span></div>
        </div>
        <div class="row">
          <div class="cell"><label>National ID / Birth Cert No.</label><span>${student.id_number || '—'}</span></div>
          <div class="cell"><label>Religion</label><span>${student.religion || '—'}</span></div>
        </div>
        <div class="row">
          <div class="cell"><label>Phone Number</label><span>${student.phone_number}</span></div>
          <div class="cell"><label>Email Address</label><span>${student.email || '—'}</span></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="sec-title">Academic &amp; Family Details</div>
      <div class="fields">
        <div class="row">
          <div class="cell"><label>Last School Attended</label><span>${student.last_school || '—'}</span></div>
          <div class="cell"><label>Year Enrolled</label><span>${student.year_enrolled}</span></div>
        </div>
        <div class="row">
          <div class="cell"><label>Parent / Guardian Contacts</label><span>${student.parent_contacts || '—'}</span></div>
          <div class="cell"><label>Course Duration</label><span>${student.projected_duration_months} months</span></div>
        </div>
      </div>
    </div>
    <div class="declaration">
      <strong>Declaration:</strong> I, the undersigned, confirm that the information provided is true
      and correct to the best of my knowledge. I agree to abide by all the rules and regulations of
      St. Augustine Kipsebwo Vocational Training Centre.
    </div>
    <div class="sigs">
      <div class="sig"><div class="line">Student Signature &amp; Date</div></div>
      <div class="sig"><div class="line">Parent / Guardian &amp; Date</div></div>
      <div class="sig"><div class="line">Principal Signature &amp; Date</div></div>
    </div>
    <div class="footer">Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; St. Augustine Kipsebwo VTC</div>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>
  `)
  win.document.close()
}

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile: userProfile } = useAuth()
  const [student, setStudent] = useState(null)
  const [balance, setBalance] = useState(null)
  const [payments, setPayments] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    const [{ data: s }, { data: b }, { data: p }] = await Promise.all([
      supabase.from('students').select('*').eq('id', id).single(),
      supabase.from('fee_balances').select('*').eq('student_id', id).single(),
      supabase.from('payments').select('*').eq('student_id', id).order('date_paid', { ascending: false }),
    ])
    setStudent(s); setBalance(b); setPayments(p || [])
    setForm(s || {})
  }

  async function handleSave() {
    setLoading(true)
    const { error } = await supabase.from('students').update(form).eq('id', id)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Profile updated')
    setEditing(false)
    fetchData()
  }

  if (!student) return <div style={{ padding: 32, color: '#64748b' }}>Loading…</div>

  const totalMonths = differenceInMonths(new Date(), new Date(student.admission_date))
  const year = Math.min(Math.floor(totalMonths / 12) + 1, 3)
  const term = Math.min(Math.floor((totalMonths % 12) / 4) + 1, 3)
  const canEdit = userProfile?.department === 'admissions' || userProfile?.department === 'admin'
  const balance_amount = balance ? (balance.total_invoiced - balance.total_paid) : 0

  return (
    <div className="page-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn-secondary btn-sm" onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Photo thumbnail */}
        {student.passport_photo_url
          ? <img src={student.passport_photo_url} alt={student.name}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2a3347' }} />
          : <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e2535',
              border: '2px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>👤</span>
            </div>
        }

        <div>
          <h1 style={{ fontSize: 20, fontFamily: 'Syne' }}>{student.name}</h1>
          <span style={{ fontSize: 13, color: '#64748b' }}>#{student.admission_number}</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn-secondary btn-sm"
            onClick={() => printAdmissionForm(student)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={14} /> Print Admission Form
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Details card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16 }}>Student Details</h3>
            {canEdit && !editing && (
              <button className="btn-secondary btn-sm" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit2 size={13} /> Edit
              </button>
            )}
            {editing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                  <Save size={13} />
                </button>
                <button className="btn-secondary btn-sm" onClick={() => { setEditing(false); setForm(student) }}>
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              ['Course', 'course'], ['Sex', 'sex'], ['Residence', 'residence'],
              ['Phone', 'phone_number'], ['Email', 'email'], ['Religion', 'religion'],
              ['Last School', 'last_school'], ['Parent Contacts', 'parent_contacts'],
              ['ID Number', 'id_number'], ['Admission Date', 'admission_date'],
            ].map(([label, key]) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                {editing
                  ? <input value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  : <div style={{ fontSize: 14, color: '#cbd5e1', paddingTop: 4 }}>{student[key] || '—'}</div>
                }
              </div>
            ))}
            <div className="form-group">
              <label>Status</label>
              {editing
                ? <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {['Active','Deferred','Dropout','Completed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                : <span className={`badge ${student.status === 'Active' ? 'badge-green' : student.status === 'Completed' ? 'badge-blue' : 'badge-yellow'}`}>
                    {student.status}
                  </span>
              }
            </div>
            <div className="form-group">
              <label>Academic Progress</label>
              <div style={{ fontSize: 14, color: '#cbd5e1', paddingTop: 4 }}>Year {year} / Term {term}</div>
            </div>
          </div>
        </div>

        {/* Finance summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ borderTop: '3px solid #22c55e' }}>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Fee Summary</h3>
            {balance ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Invoiced</div>
                  <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 800, color: '#e2e8f0' }}>
                    KES {Number(balance.total_invoiced).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Paid</div>
                  <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 800, color: '#22c55e' }}>
                    KES {Number(balance.total_paid).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Balance</div>
                  <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 800, color: balance_amount > 0 ? '#ef4444' : '#22c55e' }}>
                    KES {balance_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ) : <p style={{ color: '#64748b', fontSize: 14 }}>No fee record found</p>}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Payment History</h3>
            {payments.length === 0
              ? <p style={{ color: '#64748b', fontSize: 14 }}>No payments recorded</p>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Ref</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id}>
                          <td><code style={{ fontSize: 12, color: '#60a5fa' }}>{p.reference_number}</code></td>
                          <td style={{ fontWeight: 600, color: '#22c55e' }}>KES {Number(p.amount).toLocaleString()}</td>
                          <td>{p.mode}</td>
                          <td style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(p.date_paid).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}
