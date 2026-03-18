import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, X, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

const BLANK_EXAM = { student_id: '', subject_name: '', cat_1: 0, cat_2: 0, end_term: 0, year_of_study: '1', semester: '1' }
const BLANK_KNEC = { student_id: '', exam_series: '', required_amount: 0, amount_paid: 0 }

function gradeLabel(total) {
  if (total >= 70) return { label: 'A', color: '#22c55e' }
  if (total >= 60) return { label: 'B', color: '#3b82f6' }
  if (total >= 50) return { label: 'C', color: '#f59e0b' }
  if (total >= 40) return { label: 'D', color: '#f97316' }
  return { label: 'F', color: '#ef4444' }
}

// ── Print Student Report Card ─────────────────────────────────────────────────
function printStudentReport(student, exams, year, semester) {
  const filtered = exams.filter(e =>
    (!year || String(e.year_of_study) === String(year)) &&
    (!semester || String(e.semester) === String(semester))
  )
  const rows = filtered.map(e => {
    const g = gradeLabel(e.total_marks)
    return `
      <tr>
        <td>${e.subject_name}</td>
        <td style="text-align:center">${e.cat_1}</td>
        <td style="text-align:center">${e.cat_2}</td>
        <td style="text-align:center">${e.end_term}</td>
        <td style="text-align:center;font-weight:bold">${Number(e.total_marks).toFixed(1)}</td>
        <td style="text-align:center;font-weight:bold;color:${g.color}">${g.label}</td>
      </tr>`
  }).join('')
  const avg = filtered.length
    ? (filtered.reduce((s, e) => s + Number(e.total_marks), 0) / filtered.length).toFixed(1)
    : '—'
  const win = window.open('', '_blank', 'width=700,height=900')
  win.document.write(`
    <!DOCTYPE html><html><head><title>Report Card</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;font-size:13px;padding:32px 40px;color:#000;}
      .center{text-align:center;margin-bottom:18px;}
      h1{font-size:16px;text-transform:uppercase;letter-spacing:1px;}
      h2{font-size:12px;font-weight:normal;margin-top:3px;}
      .title{font-size:14px;font-weight:bold;text-decoration:underline;margin:14px 0;text-transform:uppercase;}
      .meta{display:flex;gap:32px;margin-bottom:16px;font-size:13px;border:1px solid #000;padding:10px 14px;}
      .meta div{flex:1;}
      .meta label{font-size:10px;text-transform:uppercase;color:#666;display:block;margin-bottom:2px;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th{background:#000;color:#fff;padding:7px 10px;text-align:left;font-size:12px;}
      td{padding:7px 10px;border-bottom:1px solid #ddd;font-size:13px;}
      .summary{margin-top:16px;text-align:right;font-size:13px;font-weight:bold;}
      .sigs{display:flex;justify-content:space-between;margin-top:48px;}
      .sig{text-align:center;width:175px;}
      .sig .line{border-top:1px solid #000;padding-top:5px;font-size:11px;}
      .footer{text-align:center;margin-top:24px;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:8px;}
      @media print{body{padding:15px 20px;}}
    </style></head><body>
    <div class="center">
      <h1>St. Augustine Kipsebwo Vocational Training Centre</h1>
      <h2>P.O. Box — Kipsebwo, Kenya</h2>
      <div class="title">Student Academic Report Card</div>
    </div>
    <div class="meta">
      <div><label>Student Name</label>${student?.name || '—'}</div>
      <div><label>Adm. Number</label>${student?.admission_number || '—'}</div>
      <div><label>Course</label>${student?.course || '—'}</div>
      <div><label>Year / Semester</label>Year ${year || '—'} / Sem ${semester || '—'}</div>
    </div>
    <table>
      <thead>
        <tr><th>Subject</th><th style="text-align:center">CAT 1</th><th style="text-align:center">CAT 2</th><th style="text-align:center">End Term</th><th style="text-align:center">Total</th><th style="text-align:center">Grade</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary">Average Score: ${avg}</div>
    <div class="sigs">
      <div class="sig"><div class="line">Class Teacher &amp; Date</div></div>
      <div class="sig"><div class="line">Principal &amp; Date</div></div>
    </div>
    <div class="footer">Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; St. Augustine Kipsebwo VTC</div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}

// ── Print KNEC Payments List ──────────────────────────────────────────────────
function printKnecPayments(knecList) {
  const rows = knecList.map(k => {
    const bal = Number(k.required_amount) - Number(k.amount_paid)
    const status = k.amount_paid >= k.required_amount ? 'Fully Paid' : k.amount_paid > 0 ? 'Partial' : 'Not Paid'
    return `
      <tr>
        <td>${k.students?.name || '—'}</td>
        <td>${k.students?.admission_number || '—'}</td>
        <td>${k.exam_series}</td>
        <td>KES ${Number(k.required_amount).toLocaleString()}</td>
        <td>KES ${Number(k.amount_paid).toLocaleString()}</td>
        <td style="color:${bal > 0 ? '#cc0000' : '#007700'}">KES ${bal.toLocaleString()}</td>
        <td><strong>${status}</strong></td>
      </tr>`
  }).join('')
  const totalRequired = knecList.reduce((s, k) => s + Number(k.required_amount), 0)
  const totalPaid = knecList.reduce((s, k) => s + Number(k.amount_paid), 0)
  const totalBal = totalRequired - totalPaid
  const win = window.open('', '_blank', 'width=860,height=900')
  win.document.write(`
    <!DOCTYPE html><html><head><title>KNEC Payments</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;font-size:13px;padding:32px 40px;color:#000;}
      .center{text-align:center;margin-bottom:18px;}
      h1{font-size:16px;text-transform:uppercase;letter-spacing:1px;}
      h2{font-size:12px;font-weight:normal;margin-top:3px;}
      .title{font-size:14px;font-weight:bold;text-decoration:underline;margin:14px 0;text-transform:uppercase;}
      table{width:100%;border-collapse:collapse;margin-top:12px;}
      th{background:#000;color:#fff;padding:7px 10px;text-align:left;font-size:12px;}
      td{padding:7px 10px;border-bottom:1px solid #ddd;font-size:13px;}
      .total-row td{font-weight:bold;border-top:2px solid #000;background:#f5f5f5;}
      .sigs{display:flex;justify-content:space-between;margin-top:48px;}
      .sig{text-align:center;width:175px;}
      .sig .line{border-top:1px solid #000;padding-top:5px;font-size:11px;}
      .footer{text-align:center;margin-top:24px;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:8px;}
      @media print{body{padding:15px 20px;}}
    </style></head><body>
    <div class="center">
      <h1>St. Augustine Kipsebwo Vocational Training Centre</h1>
      <h2>P.O. Box — Kipsebwo, Kenya</h2>
      <div class="title">KNEC Examination Payments Report</div>
    </div>
    <div style="margin-bottom:14px;font-size:13px;">
      <strong>Total Students:</strong> ${knecList.length} &nbsp;&nbsp;
      <strong>Date:</strong> ${new Date().toLocaleDateString()}
    </div>
    <table>
      <thead>
        <tr>
          <th>Student Name</th><th>Adm. No.</th><th>Exam Series</th>
          <th>Required</th><th>Paid</th><th>Balance</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="3">TOTALS</td>
          <td>KES ${totalRequired.toLocaleString()}</td>
          <td>KES ${totalPaid.toLocaleString()}</td>
          <td>KES ${totalBal.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <div class="sigs">
      <div class="sig"><div class="line">Examinations Officer &amp; Date</div></div>
      <div class="sig"><div class="line">Principal &amp; Date</div></div>
    </div>
    <div class="footer">Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; St. Augustine Kipsebwo VTC</div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ExaminationsPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [knec, setKnec] = useState([])
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [activeTab, setActiveTab] = useState('marks')
  const [showExamModal, setShowExamModal] = useState(false)
  const [showKnecModal, setShowKnecModal] = useState(false)
  const [examForm, setExamForm] = useState(BLANK_EXAM)
  const [knecForm, setKnecForm] = useState(BLANK_KNEC)
  const [editingExam, setEditingExam] = useState(null)
  const [editingKnec, setEditingKnec] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: e }, { data: k }, { data: s }] = await Promise.all([
      supabase.from('examinations').select('*, students(name, admission_number, course)').order('year_of_study').order('semester'),
      supabase.from('knec_payments').select('*, students(name, admission_number)').order('exam_series'),
      supabase.from('students').select('id, name, admission_number, course').order('name')
    ])
    setExams(e || []); setKnec(k || []); setStudents(s || [])
  }

  async function handleExamSave(e) {
    e.preventDefault()
    setLoading(true)
    const action = editingExam
      ? supabase.from('examinations').update(examForm).eq('id', editingExam.id)
      : supabase.from('examinations').insert(examForm)
    const { error } = await action
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Marks saved!')
    setShowExamModal(false); setEditingExam(null); setExamForm(BLANK_EXAM)
    fetchAll()
  }

  async function handleKnecSave(e) {
    e.preventDefault()
    setLoading(true)
    if (editingKnec) {
      const { error } = await supabase.from('knec_payments').update(knecForm).eq('id', editingKnec.id)
      if (error) { toast.error(error.message); setLoading(false); return }
    } else {
      const { data: existing } = await supabase.from('knec_payments')
        .select('id, amount_paid')
        .eq('student_id', knecForm.student_id)
        .eq('exam_series', knecForm.exam_series)
        .single()
      if (existing) {
        await supabase.from('knec_payments').update({
          amount_paid: Number(existing.amount_paid) + Number(knecForm.amount_paid),
          required_amount: knecForm.required_amount
        }).eq('id', existing.id)
      } else {
        const { error } = await supabase.from('knec_payments').insert(knecForm)
        if (error) { toast.error(error.message); setLoading(false); return }
      }
    }
    await supabase.from('audit_trail').insert({ user_id: user.id, username: user.email, action: `KNEC payment processed` })
    toast.success('KNEC payment saved!')
    setShowKnecModal(false); setEditingKnec(null); setKnecForm(BLANK_KNEC)
    fetchAll()
    setLoading(false)
  }

  const filteredExams = exams.filter(e => {
    const matchSearch = !search ||
      e.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.students?.admission_number?.includes(search)
    const matchCourse = !courseFilter || e.students?.course?.toLowerCase().includes(courseFilter.toLowerCase())
    return matchSearch && matchCourse
  })

  const filteredKnec = knec.filter(k => {
    return !search ||
      k.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
      k.students?.admission_number?.includes(search)
  })

  const courses = [...new Set(students.map(s => s.course))]

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Examinations</h1><p>Manage marks and KNEC payments</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary"
            onClick={() => { setEditingKnec(null); setKnecForm(BLANK_KNEC); setShowKnecModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> KNEC Payment
          </button>
          <button className="btn-primary"
            onClick={() => { setEditingExam(null); setExamForm(BLANK_EXAM); setShowExamModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Add Marks
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={16} color="#64748b" />
          <input placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #2a3347' }}>
        {['marks', 'knec'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'none', border: 'none', color: activeTab === tab ? '#e2e8f0' : '#64748b',
            padding: '10px 20px', borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: -1, textTransform: 'capitalize'
          }}>
            {tab === 'marks' ? 'Exam Marks' : 'KNEC Payments'}
          </button>
        ))}
      </div>

      {/* Marks Tab */}
      {activeTab === 'marks' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Student</th><th>Course</th><th>Subject</th><th>Year</th><th>Sem</th><th>CAT 1</th><th>CAT 2</th><th>End Term</th><th>Total</th><th>Grade</th><th></th></tr>
              </thead>
              <tbody>
                {filteredExams.map(e => {
                  const grade = gradeLabel(e.total_marks)
                  return (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 500 }}>{e.students?.name}</td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>{e.students?.course}</td>
                      <td>{e.subject_name}</td>
                      <td>Y{e.year_of_study}</td>
                      <td>S{e.semester}</td>
                      <td>{e.cat_1}</td>
                      <td>{e.cat_2}</td>
                      <td>{e.end_term}</td>
                      <td style={{ fontWeight: 700 }}>{Number(e.total_marks).toFixed(1)}</td>
                      <td><span className="badge" style={{ background: `${grade.color}20`, color: grade.color }}>{grade.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-secondary btn-sm" onClick={() => {
                            setEditingExam(e)
                            setExamForm({ student_id: e.student_id, subject_name: e.subject_name, cat_1: e.cat_1, cat_2: e.cat_2, end_term: e.end_term, year_of_study: e.year_of_study, semester: e.semester })
                            setShowExamModal(true)
                          }}>Edit</button>
                          <button className="btn-secondary btn-sm"
                            onClick={() => printStudentReport(e.students, filteredExams.filter(x => x.student_id === e.student_id), e.year_of_study, e.semester)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Printer size={12} /> Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KNEC Tab */}
      {activeTab === 'knec' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>KNEC Payments ({filteredKnec.length})</h3>
            {filteredKnec.length > 0 && (
              <button className="btn-secondary btn-sm"
                onClick={() => printKnecPayments(filteredKnec)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Printer size={13} /> Print All
              </button>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Student</th><th>Adm. No.</th><th>Exam Series</th><th>Required</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filteredKnec.map(k => {
                  const bal = Number(k.required_amount) - Number(k.amount_paid)
                  const status = k.amount_paid >= k.required_amount ? 'Fully Paid' : k.amount_paid > 0 ? 'Partial' : 'Not Paid'
                  const statusCls = status === 'Fully Paid' ? 'badge-green' : status === 'Partial' ? 'badge-yellow' : 'badge-red'
                  return (
                    <tr key={k.id}>
                      <td style={{ fontWeight: 500 }}>{k.students?.name}</td>
                      <td style={{ color: '#60a5fa', fontSize: 13 }}>{k.students?.admission_number}</td>
                      <td>{k.exam_series}</td>
                      <td>KES {Number(k.required_amount).toLocaleString()}</td>
                      <td style={{ color: '#22c55e' }}>KES {Number(k.amount_paid).toLocaleString()}</td>
                      <td style={{ color: bal > 0 ? '#ef4444' : '#22c55e' }}>KES {bal.toLocaleString()}</td>
                      <td><span className={`badge ${statusCls}`}>{status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-secondary btn-sm" onClick={() => {
                            setEditingKnec(k)
                            setKnecForm({ student_id: k.student_id, exam_series: k.exam_series, required_amount: k.required_amount, amount_paid: k.amount_paid })
                            setShowKnecModal(true)
                          }}>Edit</button>
                          <button className="btn-secondary btn-sm"
                            onClick={() => printKnecPayments([k])}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Printer size={12} /> Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exam Marks Modal */}
      {showExamModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowExamModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingExam ? 'Edit' : 'Add'} Exam Marks</h2>
              <button onClick={() => setShowExamModal(false)} style={{ background: 'none', padding: 4, color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleExamSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Student *</label>
                <select value={examForm.student_id} onChange={e => setExamForm(f => ({ ...f, student_id: e.target.value }))} required>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input value={examForm.subject_name} onChange={e => setExamForm(f => ({ ...f, subject_name: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Year of Study</label>
                  <select value={examForm.year_of_study} onChange={e => setExamForm(f => ({ ...f, year_of_study: e.target.value }))}>
                    <option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select value={examForm.semester} onChange={e => setExamForm(f => ({ ...f, semester: e.target.value }))}>
                    <option value="1">Semester 1</option><option value="2">Semester 2</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[['CAT 1','cat_1'],['CAT 2','cat_2'],['End Term','end_term']].map(([label, key]) => (
                  <div key={key} className="form-group">
                    <label>{label}</label>
                    <input type="number" value={examForm[key]} onChange={e => setExamForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} min={0} max={100} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Marks'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowExamModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KNEC Payment Modal */}
      {showKnecModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowKnecModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingKnec ? 'Edit' : 'Add'} KNEC Payment</h2>
              <button onClick={() => setShowKnecModal(false)} style={{ background: 'none', padding: 4, color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleKnecSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Student *</label>
                <select value={knecForm.student_id} onChange={e => setKnecForm(f => ({ ...f, student_id: e.target.value }))} required>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Exam Series *</label>
                <input value={knecForm.exam_series} onChange={e => setKnecForm(f => ({ ...f, exam_series: e.target.value }))} placeholder="e.g. July 2026" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Required Amount</label>
                  <input type="number" value={knecForm.required_amount} onChange={e => setKnecForm(f => ({ ...f, required_amount: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label>Amount Paid</label>
                  <input type="number" value={knecForm.amount_paid} onChange={e => setKnecForm(f => ({ ...f, amount_paid: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Payment'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowKnecModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}