import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, X, User, Camera, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { differenceInMonths } from 'date-fns'

function getAcademicProgress(student) {
  const today = new Date()
  const admDate = new Date(student.admission_date)
  const totalMonths = differenceInMonths(today, admDate)
  if (totalMonths >= student.projected_duration_months) {
    return { status: 'Completed', year: 'N/A', term: 'N/A' }
  }
  const year = Math.floor(totalMonths / 12) + 1
  const term = Math.min(Math.floor((totalMonths % 12) / 4) + 1, 3)
  return { status: student.status, year: `Year ${year}`, term: `Term ${term}` }
}

const BLANK = {
  name: '', admission_number: '', id_number: '', email: '',
  phone_number: '', sex: '', course: '', last_school: '',
  parent_contacts: '', religion: '',
  admission_date: new Date().toISOString().split('T')[0],
  projected_duration_months: 12,
  year_enrolled: new Date().getFullYear(),
  residence: 'Day Scholar', status: 'Active'
}

function printAdmissionForm(student, photoUrl) {
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
      .footer{text-align:center;margin-top:24px;font-size:10px;color:#999;
        border-top:1px solid #ccc;padding-top:8px;}
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

    <div class="footer">
      Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; St. Augustine Kipsebwo VTC
    </div>
    <script>window.onload = function(){ window.print(); }</script>
    </body></html>
  `)
  win.document.close()
}

export default function AdmissionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])

  useEffect(() => { fetchStudents() }, [])

  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*').order('name')
    setStudents(data || [])
    setCourses([...new Set((data || []).map(s => s.course))])
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function uploadPhoto(admissionNumber) {
    if (!photoFile) return null
    const ext = photoFile.name.split('.').pop()
    const path = `${admissionNumber}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('student-photos')
      .upload(path, photoFile, { upsert: true })
    if (error) { toast.error('Photo upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('student-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { data: fs } = await supabase
      .from('fee_structures').select('id').ilike('course', form.course).limit(1)

    if (!fs || fs.length === 0) {
      toast.error(`No fee structure found for "${form.course}". Set it up in Finance first.`)
      setLoading(false)
      return
    }

    const photoUrl = await uploadPhoto(form.admission_number)

    const { data, error } = await supabase
      .from('students')
      .insert({ ...form, passport_photo_url: photoUrl })
      .select().single()

    setLoading(false)
    if (error) { toast.error(error.message); return }

    await supabase.from('audit_trail').insert({
      user_id: user.id, username: user.email, action: `Admitted student: ${data.name}`
    })

    toast.success(`${data.name} admitted! Printing form…`)
    handleCloseModal()
    fetchStudents()
    printAdmissionForm(data, photoUrl)
  }

  function handleCloseModal() {
    setShowModal(false)
    setForm(BLANK)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase())
    const matchGender = !genderFilter || s.sex === genderFilter
    const matchCourse = !courseFilter || s.course === courseFilter
    return matchSearch && matchGender && matchCourse
  })

  // Group by course
  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.course]) acc[s.course] = []
    acc[s.course].push(s)
    return acc
  }, {})

  const statusBadge = s => {
    const cls = { Active: 'badge-green', Completed: 'badge-blue', Deferred: 'badge-yellow', Dropout: 'badge-red' }
    return <span className={`badge ${cls[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Admissions</h1>
          <p>{students.length} students enrolled</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Admit Student
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <Search size={16} color="#64748b" />
          <input
            placeholder="Search by name or admission number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} style={{ width: 140 }}>
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} style={{ width: 200 }}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grouped tables */}
      {Object.entries(grouped).map(([course, courseStudents]) => (
        <div key={course} className="card fade-in" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>{course}</h3>
            <span className="badge badge-blue">{courseStudents.length} students</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Adm. No.</th>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Residence</th>
                  <th>Year/Term</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courseStudents.map(s => {
                  const progress = getAcademicProgress(s)
                  return (
                    <tr key={s.id}>
                      <td>
                        {s.passport_photo_url
                          ? <img src={s.passport_photo_url} alt={s.name}
                              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #2a3347' }} />
                          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e2535',
                              border: '2px solid #2a3347', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={16} color="#64748b" />
                            </div>
                        }
                      </td>
                      <td><code style={{ color: '#60a5fa', fontSize: 13 }}>{s.admission_number}</code></td>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>{s.sex}</td>
                      <td>{s.residence}</td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>{progress.year} / {progress.term}</td>
                      <td>{statusBadge(progress.status)}</td>
                      <td style={{ color: '#94a3b8' }}>{s.phone_number}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-secondary btn-sm"
                            onClick={() => navigate(`/students/${s.id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <User size={12} /> View
                          </button>
                          <button className="btn-secondary btn-sm"
                            onClick={() => printAdmissionForm(s, s.passport_photo_url)}
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
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          {students.length === 0
            ? 'No students yet. Click "Admit Student" to get started.'
            : 'No students match your filters.'}
        </div>
      )}

      {/* Admit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleCloseModal()}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2>Admit New Student</h2>
              <button onClick={handleCloseModal} style={{ background: 'none', padding: 4, color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ── Photo Upload ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20,
                padding: '14px 0', borderBottom: '1px solid #2a3347' }}>
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    width: 90, height: 110, border: '2px dashed #2a3347', borderRadius: 10,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                    background: '#0f1117', flexShrink: 0, transition: 'border-color 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#2a3347'}
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <>
                        <Camera size={22} color="#64748b" />
                        <span style={{ fontSize: 11, color: '#64748b', marginTop: 6, textAlign: 'center', lineHeight: 1.4 }}>
                          Click to<br/>add photo
                        </span>
                      </>
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Passport Photo</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                    JPG or PNG, max 2MB. Photo will appear on the printed admission form.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn-secondary btn-sm"
                      onClick={() => fileRef.current.click()}>
                      {photoFile ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {photoFile && (
                      <button type="button" className="btn-secondary btn-sm"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                        style={{ color: '#ef4444' }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handlePhotoChange} style={{ display: 'none' }} />
              </div>

              {/* ── Student Fields ── */}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Admission Number *</label>
                  <input value={form.admission_number} onChange={e => setForm(f => ({ ...f, admission_number: e.target.value }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Course *</label>
                  <input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. Electrical Installation" required />
                </div>
                <div className="form-group">
                  <label>Sex *</label>
                  <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value }))} required>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Residence *</label>
                  <select value={form.residence} onChange={e => setForm(f => ({ ...f, residence: e.target.value }))}>
                    <option>Day Scholar</option>
                    <option>Boarder</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>National ID Number</label>
                  <input value={form.id_number} onChange={e => setForm(f => ({ ...f, id_number: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Last School Attended</label>
                  <input value={form.last_school} onChange={e => setForm(f => ({ ...f, last_school: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Parent / Guardian Contacts</label>
                  <input value={form.parent_contacts} onChange={e => setForm(f => ({ ...f, parent_contacts: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Religion</label>
                  <input value={form.religion} onChange={e => setForm(f => ({ ...f, religion: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Admission Date</label>
                  <input type="date" value={form.admission_date} onChange={e => setForm(f => ({ ...f, admission_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Course Duration (months)</label>
                  <input type="number" value={form.projected_duration_months}
                    onChange={e => setForm(f => ({ ...f, projected_duration_months: parseInt(e.target.value) || 12 }))} min={1} />
                </div>
                <div className="form-group">
                  <label>Year Enrolled</label>
                  <input type="number" value={form.year_enrolled}
                    onChange={e => setForm(f => ({ ...f, year_enrolled: parseInt(e.target.value) || new Date().getFullYear() }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {loading ? 'Saving…' : <><Printer size={15} /> Admit &amp; Print Form</>}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
