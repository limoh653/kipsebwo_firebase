import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, X, DollarSign, Printer, TrendingUp, Users, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BLANK_STRUCTURE = {
  course: '', scholar_type: 'Day Scholar', financial_year: '2026/2027',
  pta_t1: 0, medical_t1: 0, ltt_t1: 0, contingencies_t1: 0,
  pta_t2: 0, medical_t2: 0, ltt_t2: 0,
  pta_t3: 0, medical_t3: 0, ltt_t3: 0,
  adm_fee: 0, caution_money: 0, student_id_fee: 0,
  boarding_fee_t1: 0, boarding_fee_t2: 0, boarding_fee_t3: 0,
}

function printReceipt(payment, student, balanceAmt) {
  const win = window.open('', '_blank', 'width=480,height=600')
  win.document.write(`
    <!DOCTYPE html><html><head><title>Receipt</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;font-size:13px;padding:24px;color:#000;}
      .center{text-align:center;}
      h1{font-size:16px;text-transform:uppercase;letter-spacing:1px;}
      h2{font-size:12px;font-weight:normal;margin-top:3px;}
      .title{font-size:14px;font-weight:bold;text-decoration:underline;margin:14px 0;text-transform:uppercase;}
      .divider{border-top:1px dashed #000;margin:12px 0;}
      .row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;}
      .row.bold{font-weight:bold;}
      .balance{text-align:center;margin-top:14px;font-size:15px;font-weight:bold;}
      .footer{text-align:center;margin-top:20px;font-size:11px;color:#555;}
      @media print{body{padding:10px;}}
    </style></head><body>
    <div class="center">
      <h1>St. Augustine Kipsebwo VTC</h1>
      <h2>P.O. Box — Kipsebwo, Kenya</h2>
      <div class="title">Official Payment Receipt</div>
    </div>
    <div class="divider"></div>
    <div class="row"><span>Receipt No.</span><span>${payment.reference_number}</span></div>
    <div class="row"><span>Date</span><span>${new Date(payment.date_paid || Date.now()).toLocaleDateString()}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Student Name</span><span>${student?.name || '—'}</span></div>
    <div class="row"><span>Adm. Number</span><span>${student?.admission_number || '—'}</span></div>
    <div class="divider"></div>
    <div class="row bold"><span>Amount Paid</span><span>KES ${Number(payment.amount).toLocaleString()}</span></div>
    <div class="row"><span>Mode of Payment</span><span>${payment.mode}</span></div>
    <div class="divider"></div>
    <div class="balance" style="color:${balanceAmt > 0 ? '#cc0000' : '#007700'}">
      Outstanding Balance: KES ${Number(balanceAmt).toLocaleString()}
    </div>
    <div class="footer">
      <div>Thank you for your payment.</div>
      <div style="margin-top:6px;">_______________________________</div>
      <div>Authorised Signature</div>
      <div style="margin-top:10px;">Printed: ${new Date().toLocaleString()}</div>
    </div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}

function printFeeStructure(s) {
  const lttTotal   = Number(s.ltt_t1) + Number(s.ltt_t2) + Number(s.ltt_t3)
  const boardTotal = Number(s.boarding_fee_t1) + Number(s.boarding_fee_t2) + Number(s.boarding_fee_t3)
  const ptaTotal   = Number(s.pta_t1) + Number(s.pta_t2) + Number(s.pta_t3)
  const medTotal   = Number(s.medical_t1) + Number(s.medical_t2) + Number(s.medical_t3)
  const contTotal  = Number(s.contingencies_t1)
  const admTotal   = Number(s.adm_fee)
  const idTotal    = Number(s.student_id_fee)
  const cautTotal  = Number(s.caution_money)
  const isDayScholar = s.scholar_type?.toLowerCase().includes('day')
  const t1 = Number(s.ltt_t1) + (isDayScholar ? 0 : Number(s.boarding_fee_t1)) + Number(s.pta_t1) + Number(s.medical_t1) + Number(s.contingencies_t1) + Number(s.adm_fee) + Number(s.student_id_fee) + Number(s.caution_money)
  const t2 = Number(s.ltt_t2) + (isDayScholar ? 0 : Number(s.boarding_fee_t2)) + Number(s.pta_t2) + Number(s.medical_t2)
  const t3 = Number(s.ltt_t3) + (isDayScholar ? 0 : Number(s.boarding_fee_t3)) + Number(s.pta_t3) + Number(s.medical_t3)
  const grand = t1 + t2 + t3
  const boardingRow = isDayScholar ? '' : `
    <tr>
      <td style="padding-left:10px;font-weight:bold;color:#1e8449;">BOARDING FEE</td>
      <td style="text-align:center">${Number(s.boarding_fee_t1).toLocaleString()}</td>
      <td style="text-align:center">${Number(s.boarding_fee_t2).toLocaleString()}</td>
      <td style="text-align:center">${Number(s.boarding_fee_t3).toLocaleString()}</td>
      <td style="text-align:center;background:#f9f9f9;font-weight:bold">${boardTotal.toLocaleString()}</td>
    </tr>`
  const win = window.open('', '_blank', 'width=860,height=1000')
  win.document.write(`
    <!DOCTYPE html><html><head><title>Fee Structure</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Times New Roman',Times,serif;font-size:14px;color:#000;padding:40px 60px;}
      .header{text-align:center;line-height:1.3;text-transform:uppercase;margin-bottom:20px;}
      .header h3{margin:0;font-size:16px;text-decoration:underline;}
      .header h2{margin:5px 0;font-size:20px;}
      .header p{margin:2px 0;font-size:13px;font-weight:bold;}
      .header hr{border:1px solid black;margin:10px 0;}
      .meta{display:grid;grid-template-columns:1fr 1fr;gap:20px;font-weight:bold;margin-top:15px;margin-bottom:10px;font-size:14px;}
      .underline{border-bottom:1px dotted #000;display:inline-block;min-width:200px;font-weight:bold;text-transform:uppercase;padding:0 4px;}
      table{width:100%;border-collapse:collapse;margin-top:15px;table-layout:fixed;}
      table,th,td{border:1px solid black;}
      th{background:#f2f2f2;padding:8px;font-size:12px;text-transform:uppercase;}
      td{padding:6px 10px;height:35px;font-size:14px;}
      .row-total{background:#f9f9f9;font-weight:bold;text-align:center;}
      .total-row td{background:#eee;font-weight:bold;}
      .grand-total{background:#2c3e50 !important;color:white !important;text-align:center;font-weight:bold;}
      .payment-details{margin-top:25px;font-size:14px;line-height:1.9;}
      .payment-details p{font-weight:bold;margin-bottom:4px;}
      .pd-row{margin-left:10px;}
      .pd-value{border-bottom:1px dotted #000;display:inline-block;min-width:280px;font-weight:bold;text-transform:uppercase;padding:0 4px;}
      .sigs{display:flex;justify-content:space-between;margin-top:60px;align-items:flex-end;}
      .sig{text-align:center;width:220px;}
      .sig hr{border:0.5px solid black;margin-bottom:5px;}
      .sig p{margin:0;font-size:14px;}
      .stamp{border:1px solid black;width:120px;height:80px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#ccc;text-align:center;}
      @media print{body{padding:20px 30px;}.grand-total{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
    </style></head><body>
    <div class="header">
      <h3>COUNTY GOVERNMENT OF NANDI</h3>
      <h2>ST. AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h2>
      <p>P.O BOX 45-30304 KAPCHENO | TEL: 0720919005</p>
      <hr/>
      <div style="margin:10px 0;font-size:15px;">
        <span style="font-weight:bold;">FEE STRUCTURE FOR FY: </span>
        <span class="underline">${s.financial_year}</span>
      </div>
    </div>
    <div class="meta">
      <div>COURSE: <span class="underline">${s.course}</span></div>
      <div style="text-align:right">TYPE: <span class="underline">${s.scholar_type}</span></div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:30%">VOTE HEAD</th>
          <th style="width:17%">TERM 1 (Ksh)</th>
          <th style="width:17%">TERM 2 (Ksh)</th>
          <th style="width:17%">TERM 3 (Ksh)</th>
          <th style="width:19%">TOTAL (Ksh)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding-left:10px">L.T.T (Training)</td><td style="text-align:center">${Number(s.ltt_t1).toLocaleString()}</td><td style="text-align:center">${Number(s.ltt_t2).toLocaleString()}</td><td style="text-align:center">${Number(s.ltt_t3).toLocaleString()}</td><td class="row-total">${lttTotal.toLocaleString()}</td></tr>
        ${boardingRow}
        <tr><td style="padding-left:10px">P.T.A (Lunch &amp; Tea)</td><td style="text-align:center">${Number(s.pta_t1).toLocaleString()}</td><td style="text-align:center">${Number(s.pta_t2).toLocaleString()}</td><td style="text-align:center">${Number(s.pta_t3).toLocaleString()}</td><td class="row-total">${ptaTotal.toLocaleString()}</td></tr>
        <tr><td style="padding-left:10px">MEDICAL</td><td style="text-align:center">${Number(s.medical_t1).toLocaleString()}</td><td style="text-align:center">${Number(s.medical_t2).toLocaleString()}</td><td style="text-align:center">${Number(s.medical_t3).toLocaleString()}</td><td class="row-total">${medTotal.toLocaleString()}</td></tr>
        <tr><td style="padding-left:10px">CONTINGENCIES</td><td style="text-align:center">${Number(s.contingencies_t1).toLocaleString()}</td><td style="text-align:center;background:#f9f9f9">0</td><td style="text-align:center;background:#f9f9f9">0</td><td class="row-total">${contTotal.toLocaleString()}</td></tr>
        <tr><td style="padding-left:10px">ADMISSION FEE</td><td style="text-align:center">${Number(s.adm_fee).toLocaleString()}</td><td style="text-align:center;background:#f9f9f9">0</td><td style="text-align:center;background:#f9f9f9">0</td><td class="row-total">${admTotal.toLocaleString()}</td></tr>
        <tr><td style="padding-left:10px">STUDENT ID CARD</td><td style="text-align:center">${Number(s.student_id_fee).toLocaleString()}</td><td style="text-align:center;background:#f9f9f9">0</td><td style="text-align:center;background:#f9f9f9">0</td><td class="row-total">${idTotal.toLocaleString()}</td></tr>
        <tr><td style="padding-left:10px">CAUTION MONEY</td><td style="text-align:center">${Number(s.caution_money).toLocaleString()}</td><td style="text-align:center;background:#f9f9f9">0</td><td style="text-align:center;background:#f9f9f9">0</td><td class="row-total">${cautTotal.toLocaleString()}</td></tr>
        <tr class="total-row">
          <td style="text-align:right;padding-right:15px">TOTAL PER TERM (KSH)</td>
          <td style="text-align:center">${t1.toLocaleString()}</td>
          <td style="text-align:center">${t2.toLocaleString()}</td>
          <td style="text-align:center">${t3.toLocaleString()}</td>
          <td class="grand-total">${grand.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    <div class="payment-details">
      <p>PAYMENT DETAILS:</p>
      <div class="pd-row">ACCOUNT NAME: <span class="pd-value">ST. AUGUSTINE KIPSEBWO VTC</span></div>
      <div class="pd-row">ACCOUNT NO: <span class="pd-value">0490277836158</span></div>
      <div class="pd-row">BANK: <span class="pd-value">EQUITY BANK KAPSABET BRANCH</span></div>
    </div>
    <div class="sigs">
      <div class="sig"><hr/><p>Bursar / Principal</p></div>
      <div class="stamp">OFFICIAL<br/>STAMP</div>
    </div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}

function printTransactions(payments, dateFrom, dateTo) {
  const total = payments.reduce((s, p) => s + Number(p.amount), 0)
  const rows = payments.map(p => `
    <tr>
      <td>${p.reference_number}</td>
      <td>${p.students?.name || '—'}</td>
      <td>${p.students?.admission_number || '—'}</td>
      <td style="text-align:right">KES ${Number(p.amount).toLocaleString()}</td>
      <td>${p.mode}</td>
      <td>${new Date(p.date_paid).toLocaleDateString()}</td>
    </tr>`).join('')
  const win = window.open('', '_blank', 'width=860,height=900')
  win.document.write(`
    <!DOCTYPE html><html><head><title>Transactions</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Times New Roman',Times,serif;font-size:14px;padding:40px 60px;color:#000;}
      .header{text-align:center;margin-bottom:18px;}
      .header h3{font-size:15px;text-decoration:underline;text-transform:uppercase;}
      .header h2{font-size:20px;text-transform:uppercase;margin:5px 0;}
      .header p{font-size:13px;font-weight:bold;}
      .header hr{border:1px solid black;margin:10px 0;}
      .title{font-size:15px;font-weight:bold;text-decoration:underline;text-transform:uppercase;text-align:center;margin-bottom:14px;}
      table{width:100%;border-collapse:collapse;}
      table,th,td{border:1px solid black;}
      th{background:#f2f2f2;padding:8px;font-size:12px;text-transform:uppercase;}
      td{padding:7px 10px;font-size:13px;}
      .total-row td{font-weight:bold;background:#eee;}
      .footer{text-align:center;margin-top:24px;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:8px;}
      @media print{body{padding:20px 30px;}}
    </style></head><body>
    <div class="header">
      <h3>COUNTY GOVERNMENT OF NANDI</h3>
      <h2>ST. AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h2>
      <p>P.O BOX 45-30304 KAPCHENO | TEL: 0720919005</p>
      <hr/>
    </div>
    <div class="title">Payments Transaction Report</div>
    <div style="margin-bottom:14px;font-size:13px;">
      <strong>Period:</strong> ${dateFrom || 'All dates'} ${dateTo ? '— ' + dateTo : ''}
      &nbsp;&nbsp;<strong>Total Records:</strong> ${payments.length}
    </div>
    <table>
      <thead><tr><th>Reference</th><th>Student</th><th>Adm. No.</th><th style="text-align:right">Amount</th><th>Mode</th><th>Date</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td style="text-align:right">KES ${total.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>
    <div class="footer">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; St. Augustine Kipsebwo VTC</div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}

function printFeeStatus(student, balance, payments) {
  const balanceAmt = balance ? (balance.total_invoiced - balance.total_paid) : 0
  const rows = (payments || []).map(p => `
    <tr>
      <td>${p.reference_number}</td>
      <td>${new Date(p.date_paid).toLocaleDateString()}</td>
      <td>${p.mode}</td>
      <td style="text-align:right">KES ${Number(p.amount).toLocaleString()}</td>
    </tr>`).join('')
  const win = window.open('', '_blank', 'width=700,height=900')
  win.document.write(`
    <!DOCTYPE html><html><head><title>Fee Statement</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:'Times New Roman',Times,serif;font-size:14px;color:#000;padding:40px 60px;}
      .header{text-align:center;line-height:1.3;text-transform:uppercase;margin-bottom:20px;}
      .header h3{font-size:15px;text-decoration:underline;}
      .header h2{font-size:20px;margin:5px 0;}
      .header p{font-size:13px;font-weight:bold;margin:2px 0;}
      .header hr{border:1px solid black;margin:10px 0;}
      .title{font-size:15px;font-weight:bold;text-decoration:underline;text-transform:uppercase;text-align:center;margin-bottom:18px;}
      .meta{border:1px solid #000;padding:12px 16px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px;}
      .meta-item label{font-size:11px;text-transform:uppercase;color:#555;display:block;margin-bottom:2px;}
      .meta-item span{font-weight:bold;text-transform:uppercase;}
      .summary{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #000;margin-bottom:20px;}
      .sum-box{padding:12px 16px;text-align:center;border-right:1px solid #000;}
      .sum-box:last-child{border-right:none;}
      .sum-box label{font-size:11px;text-transform:uppercase;color:#555;display:block;margin-bottom:4px;}
      .sum-box .amount{font-size:18px;font-weight:bold;}
      table{width:100%;border-collapse:collapse;}
      table,th,td{border:1px solid black;}
      th{background:#f2f2f2;padding:8px 10px;font-size:12px;text-transform:uppercase;}
      td{padding:7px 10px;font-size:14px;}
      .total-row td{font-weight:bold;background:#eee;}
      .sigs{display:flex;justify-content:space-between;margin-top:60px;align-items:flex-end;}
      .sig{text-align:center;width:200px;}
      .sig hr{border:0.5px solid black;margin-bottom:5px;}
      .sig p{margin:0;font-size:13px;}
      .stamp{border:1px solid black;width:110px;height:80px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#ccc;text-align:center;}
      .footer{text-align:center;margin-top:24px;font-size:11px;color:#555;border-top:1px solid #ccc;padding-top:8px;}
      @media print{body{padding:20px 30px;}}
    </style></head><body>
    <div class="header">
      <h3>COUNTY GOVERNMENT OF NANDI</h3>
      <h2>ST. AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h2>
      <p>P.O BOX 45-30304 KAPCHENO | TEL: 0720919005</p>
      <hr/>
    </div>
    <div class="title">Student Fee Statement</div>
    <div class="meta">
      <div class="meta-item"><label>Student Name</label><span>${student.name}</span></div>
      <div class="meta-item"><label>Admission Number</label><span>${student.admission_number}</span></div>
      <div class="meta-item"><label>Course</label><span>${student.course}</span></div>
      <div class="meta-item"><label>Residence</label><span>${student.residence}</span></div>
    </div>
    <div class="summary">
      <div class="sum-box">
        <label>Total Invoiced</label>
        <div class="amount">KES ${balance ? Number(balance.total_invoiced).toLocaleString() : '0'}</div>
      </div>
      <div class="sum-box">
        <label>Total Paid</label>
        <div class="amount" style="color:#007700">KES ${balance ? Number(balance.total_paid).toLocaleString() : '0'}</div>
      </div>
      <div class="sum-box">
        <label>Outstanding Balance</label>
        <div class="amount" style="color:${balanceAmt > 0 ? '#cc0000' : '#007700'}">KES ${balanceAmt.toLocaleString()}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr><th>Reference No.</th><th>Date</th><th>Mode</th><th style="text-align:right">Amount (KES)</th></tr>
      </thead>
      <tbody>
        ${rows.length ? rows : '<tr><td colspan="4" style="text-align:center;padding:20px;color:#666;font-style:italic">No payments recorded yet.</td></tr>'}
        ${payments && payments.length > 0 ? `
        <tr class="total-row">
          <td colspan="3" style="text-align:right;padding-right:12px">TOTAL PAID</td>
          <td style="text-align:right">KES ${balance ? Number(balance.total_paid).toLocaleString() : '0'}</td>
        </tr>` : ''}
      </tbody>
    </table>
    <div class="sigs">
      <div class="sig"><hr/><p>Bursar / Principal</p></div>
      <div class="stamp">OFFICIAL<br/>STAMP</div>
    </div>
    <div class="footer">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; St. Augustine Kipsebwo VTC</div>
    </body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [payments, setPayments] = useState([])
  const [structures, setStructures] = useState([])
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editingStructure, setEditingStructure] = useState(null)
  const [structureForm, setStructureForm] = useState(BLANK_STRUCTURE)
  const [paymentForm, setPaymentForm] = useState({ adm_no: '', amount: '', mode: 'Cash', reference_number: '' })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('payments')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: s }, { data: p }, { data: fs }] = await Promise.all([
      supabase.from('students').select('*, fee_balances(*)').order('name'),
      supabase.from('payments').select('*, students(name, admission_number)').order('date_paid', { ascending: false }).limit(100),
      supabase.from('fee_structures').select('*').order('financial_year', { ascending: false })
    ])
    setStudents(s || [])
    setPayments(p || [])
    setStructures(fs || [])
  }

  async function handleSearchAdm(e) {
    e.preventDefault()
    if (!search.trim()) return
    const { data } = await supabase
      .from('students').select('*, fee_balances(*)')
      .ilike('admission_number', search.trim()).single()
    if (!data) { toast.error('Student not found'); setSearchResult(null) }
    else setSearchResult(data)
  }

  async function handleStructureSave(e) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...structureForm }
    if (payload.scholar_type === 'Day Scholar') {
      payload.boarding_fee_t1 = 0
      payload.boarding_fee_t2 = 0
      payload.boarding_fee_t3 = 0
    }
    const action = editingStructure
      ? supabase.from('fee_structures').update(payload).eq('id', editingStructure.id)
      : supabase.from('fee_structures').insert(payload)
    const { error } = await action
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Fee structure saved!')
    setShowStructureModal(false); setEditingStructure(null); setStructureForm(BLANK_STRUCTURE)
    fetchAll()
  }

  async function handlePayment(e) {
    e.preventDefault()
    setLoading(true)
    const student = students.find(s => s.admission_number.toLowerCase() === paymentForm.adm_no.toLowerCase())
    if (!student) { toast.error('Student not found'); setLoading(false); return }
    const { data: payment, error } = await supabase.from('payments').insert({
      student_id: student.id,
      amount: parseFloat(paymentForm.amount),
      mode: paymentForm.mode,
      reference_number: paymentForm.reference_number || null,
      recorded_by: user.id
    }).select('*, students(name, admission_number)').single()
    setLoading(false)
    if (error) { toast.error(error.message); return }
    await supabase.from('audit_trail').insert({
      user_id: user.id, username: user.email,
      action: `Recorded ${paymentForm.mode} payment of KES ${paymentForm.amount} for ${student.name}`
    })
    const { data: balData } = await supabase.from('fee_balances').select('*').eq('student_id', student.id).single()
    const balanceAmt = balData ? (balData.total_invoiced - balData.total_paid) : 0
    toast.success(`Payment recorded! Ref: ${payment.reference_number}`)
    setShowPaymentModal(false)
    setPaymentForm({ adm_no: '', amount: '', mode: 'Cash', reference_number: '' })
    fetchAll()
    printReceipt(payment, student, balanceAmt)
  }

  // t1/t2/t3 totals — exclude boarding for Day Scholar in the structures list
  function t1Total(s) {
    const base = [s.pta_t1,s.medical_t1,s.ltt_t1,s.contingencies_t1,s.adm_fee,s.caution_money,s.student_id_fee].reduce((a,b)=>a+Number(b),0)
    return base + (s.scholar_type?.toLowerCase().includes('day') ? 0 : Number(s.boarding_fee_t1))
  }
  function t2Total(s) {
    const base = [s.pta_t2,s.medical_t2,s.ltt_t2].reduce((a,b)=>a+Number(b),0)
    return base + (s.scholar_type?.toLowerCase().includes('day') ? 0 : Number(s.boarding_fee_t2))
  }
  function t3Total(s) {
    const base = [s.pta_t3,s.medical_t3,s.ltt_t3].reduce((a,b)=>a+Number(b),0)
    return base + (s.scholar_type?.toLowerCase().includes('day') ? 0 : Number(s.boarding_fee_t3))
  }

  const filteredPayments = payments.filter(p => {
    if (!dateFrom && !dateTo) return true
    const d = new Date(p.date_paid)
    if (dateFrom && d < new Date(dateFrom)) return false
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  // ── School-wide summary stats ──────────────────────────────────────────────
  const totalInvoiced = students.reduce((sum, s) => sum + Number(s.fee_balances?.total_invoiced || 0), 0)
  const totalPaid     = students.reduce((sum, s) => sum + Number(s.fee_balances?.total_paid || 0), 0)
  const totalBalance  = totalInvoiced - totalPaid
  const studentsWithBalance = students.filter(s => s.fee_balances && (s.fee_balances.total_invoiced - s.fee_balances.total_paid) > 0).length

  // ── Modal live totals ──────────────────────────────────────────────────────
  const isDayScholar = structureForm.scholar_type === 'Day Scholar'

  const modalT1 = ['ltt_t1','pta_t1','medical_t1','contingencies_t1','adm_fee','student_id_fee','caution_money',
    ...(isDayScholar ? [] : ['boarding_fee_t1'])
  ].reduce((a,k) => a + Number(structureForm[k]||0), 0)
  const modalT2 = ['ltt_t2','pta_t2','medical_t2',
    ...(isDayScholar ? [] : ['boarding_fee_t2'])
  ].reduce((a,k) => a + Number(structureForm[k]||0), 0)
  const modalT3 = ['ltt_t3','pta_t3','medical_t3',
    ...(isDayScholar ? [] : ['boarding_fee_t3'])
  ].reduce((a,k) => a + Number(structureForm[k]||0), 0)

  // ── Inline table input helpers ─────────────────────────────────────────────
  const th  = { border: '1px solid #555', background: '#1e2736', padding: '8px 10px', fontSize: 12, textTransform: 'uppercase', textAlign: 'center', color: '#e2e8f0' }
  const tdi = { border: '1px solid #555', padding: 0 }
  const tdt = { border: '1px solid #555', padding: '6px 8px', textAlign: 'center', background: '#0f1520', fontWeight: 'bold', color: '#e2e8f0' }
  const tdl = { border: '1px solid #555', padding: '6px 8px', textAlign: 'center', background: '#0f1520', color: '#475569' }

  const ni = (key) => (
    <input
      type="number"
      value={structureForm[key]}
      onChange={e => setStructureForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
      style={{ width: '100%', background: 'transparent', border: 'none', color: '#e2e8f0', textAlign: 'center', padding: '7px 4px', fontSize: 14, outline: 'none' }}
    />
  )

  return (
    <div className="page-wrap">

      {/* ── Page header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Finance</h1>
          <p>Manage payments and fee structures</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary"
            onClick={() => { setEditingStructure(null); setStructureForm(BLANK_STRUCTURE); setShowStructureModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Fee Structure
          </button>
          <button className="btn-primary" onClick={() => setShowPaymentModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* ── School-wide summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: students.length, icon: <Users size={20} />, color: '#3b82f6', bg: '#1e3a5f' },
          { label: 'Total Invoiced', value: `KES ${totalInvoiced.toLocaleString()}`, icon: <TrendingUp size={20} />, color: '#a78bfa', bg: '#2e1a5f' },
          { label: 'Total Collected', value: `KES ${totalPaid.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#22c55e', bg: '#14532d' },
          { label: 'Outstanding Balance', value: `KES ${totalBalance.toLocaleString()}`, icon: <AlertCircle size={20} />, color: '#ef4444', bg: '#450a0a', sub: `${studentsWithBalance} student${studentsWithBalance !== 1 ? 's' : ''} with arrears` },
        ].map(card => (
          <div key={card.label} style={{ background: '#0f1117', border: '1px solid #2a3347', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</div>
              <div style={{ background: card.bg, color: card.color, padding: '6px', borderRadius: 8 }}>{card.icon}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
            {card.sub && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Search / Student Fee Statement ── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Student Fee Statement</h3>
        <form onSubmit={handleSearchAdm} style={{ display: 'flex', gap: 10 }}>
          <input placeholder="Enter admission number…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
          <button type="submit" className="btn-primary btn-sm">Search</button>
          {searchResult && <button type="button" className="btn-secondary btn-sm" onClick={() => setSearchResult(null)}>Clear</button>}
        </form>

        {searchResult && (
          <div style={{ marginTop: 16, padding: 16, background: '#0a0d14', borderRadius: 10, border: '1px solid #2a3347' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{searchResult.name}</div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{searchResult.admission_number} · {searchResult.course} · {searchResult.residence}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {searchResult.fee_balances ? (
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Invoiced</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa' }}>KES {Number(searchResult.fee_balances.total_invoiced).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Paid</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>KES {Number(searchResult.fee_balances.total_paid).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Balance</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: (searchResult.fee_balances.total_invoiced - searchResult.fee_balances.total_paid) > 0 ? '#ef4444' : '#22c55e' }}>
                        KES {(searchResult.fee_balances.total_invoiced - searchResult.fee_balances.total_paid).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : <span style={{ color: '#64748b', fontSize: 13 }}>No fee balance data</span>}
                <button className="btn-secondary btn-sm"
                  onClick={async () => {
                    const { data: pays } = await supabase.from('payments').select('*')
                      .eq('student_id', searchResult.id).order('date_paid', { ascending: false })
                    printFeeStatus(searchResult, searchResult.fee_balances, pays || [])
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Printer size={13} /> Print Statement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #2a3347' }}>
        {['payments', 'structures', 'students'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            background: 'none', border: 'none',
            color: activeTab === tab ? '#e2e8f0' : '#64748b',
            padding: '10px 20px',
            borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: -1, textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {/* ── Payments Tab ── */}
      {activeTab === 'payments' && (
        <div className="card">
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 15, flex: 1 }}>Recent Payments</h3>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: 160, fontSize: 13 }} />
            <span style={{ color: '#64748b', fontSize: 13 }}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: 160, fontSize: 13 }} />
            {(dateFrom || dateTo) && <button className="btn-secondary btn-sm" onClick={() => { setDateFrom(''); setDateTo('') }}>Clear</button>}
            {filteredPayments.length > 0 && (
              <button className="btn-secondary btn-sm"
                onClick={() => printTransactions(filteredPayments, dateFrom, dateTo)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Printer size={13} /> Print Report
              </button>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Ref</th><th>Student</th><th>Adm. No.</th><th>Amount</th><th>Mode</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td><code style={{ color: '#60a5fa', fontSize: 12 }}>{p.reference_number}</code></td>
                    <td style={{ fontWeight: 500 }}>{p.students?.name}</td>
                    <td style={{ color: '#94a3b8' }}>{p.students?.admission_number}</td>
                    <td style={{ fontWeight: 600, color: '#22c55e' }}>KES {Number(p.amount).toLocaleString()}</td>
                    <td><span className="badge badge-blue">{p.mode}</span></td>
                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(p.date_paid).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-secondary btn-sm"
                        onClick={async () => {
                          const { data: bal } = await supabase.from('fee_balances').select('*').eq('student_id', p.student_id).single()
                          const balance = bal ? (bal.total_invoiced - bal.total_paid) : 0
                          printReceipt(p, p.students, balance)
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Printer size={12} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Structures Tab ── */}
      {activeTab === 'structures' && (
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Fee Structures</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Course</th><th>Type</th><th>Year</th><th>Term 1</th><th>Term 2</th><th>Term 3</th><th>Total</th><th></th></tr>
              </thead>
              <tbody>
                {structures.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.course}</td>
                    <td>{s.scholar_type}</td>
                    <td style={{ color: '#94a3b8' }}>{s.financial_year}</td>
                    <td>KES {t1Total(s).toLocaleString()}</td>
                    <td>KES {t2Total(s).toLocaleString()}</td>
                    <td>KES {t3Total(s).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#60a5fa' }}>KES {(t1Total(s)+t2Total(s)+t3Total(s)).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-secondary btn-sm"
                          onClick={() => { setEditingStructure(s); setStructureForm(s); setShowStructureModal(true) }}>
                          Edit
                        </button>
                        <button className="btn-secondary btn-sm" onClick={() => printFeeStructure(s)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Printer size={12} /> Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Students Tab ── */}
      {activeTab === 'students' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>All Students – Fee Status</h3>
            <div style={{ fontSize: 13, color: '#64748b' }}>{students.length} students total</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Name</th><th>Adm. No.</th><th>Course</th><th>Invoiced</th><th>Paid</th><th>Balance</th><th></th></tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const bal = s.fee_balances
                  const diff = bal ? (bal.total_invoiced - bal.total_paid) : 0
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td style={{ color: '#60a5fa', fontSize: 13 }}>{s.admission_number}</td>
                      <td style={{ color: '#94a3b8' }}>{s.course}</td>
                      <td style={{ color: '#a78bfa' }}>{bal ? `KES ${Number(bal.total_invoiced).toLocaleString()}` : '—'}</td>
                      <td style={{ color: '#22c55e' }}>{bal ? `KES ${Number(bal.total_paid).toLocaleString()}` : '—'}</td>
                      <td style={{ fontWeight: 700, color: diff > 0 ? '#ef4444' : '#22c55e' }}>
                        {bal ? `KES ${diff.toLocaleString()}` : '—'}
                      </td>
                      <td>
                        <button className="btn-secondary btn-sm"
                          onClick={async () => {
                            const { data: pays } = await supabase.from('payments').select('*')
                              .eq('student_id', s.id).order('date_paid', { ascending: false })
                            printFeeStatus(s, bal, pays || [])
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Printer size={12} /> Statement
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#0a0d14', borderRadius: 8, border: '1px solid #2a3347', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Invoiced</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa' }}>KES {totalInvoiced.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Collected</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#22c55e' }}>KES {totalPaid.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Outstanding</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>KES {totalBalance.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Collection Rate</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>
                {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ── */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPaymentModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', padding: 4, color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Admission Number *</label>
                <input value={paymentForm.adm_no}
                  onChange={e => setPaymentForm(f => ({ ...f, adm_no: e.target.value }))}
                  placeholder="e.g. KIP/2024/001" required />
              </div>
              <div className="form-group">
                <label>Amount (KES) *</label>
                <input type="number" value={paymentForm.amount}
                  onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} required min={1} />
              </div>
              <div className="form-group">
                <label>Mode of Payment *</label>
                <select value={paymentForm.mode} onChange={e => setPaymentForm(f => ({ ...f, mode: e.target.value }))}>
                  {['M-Pesa','Bank Cheque','Bank Deposit','Cash','Others'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reference Number (optional)</label>
                <input value={paymentForm.reference_number}
                  onChange={e => setPaymentForm(f => ({ ...f, reference_number: e.target.value }))}
                  placeholder="Auto-generated if left blank" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Record & Print Receipt'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Fee Structure Modal ── */}
      {showStructureModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowStructureModal(false)}>
          <div className="modal" style={{ maxWidth: 820 }}>
            <div className="modal-header">
              <h2>{editingStructure ? 'Edit' : 'Add'} Fee Structure</h2>
              <button onClick={() => setShowStructureModal(false)} style={{ background: 'none', padding: 4, color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleStructureSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Top meta fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Course *</label>
                  <input value={structureForm.course}
                    onChange={e => setStructureForm(f => ({ ...f, course: e.target.value }))}
                    required placeholder="e.g. Electrical Installation" />
                </div>
                <div className="form-group">
                  <label>Scholar Type *</label>
                  <select value={structureForm.scholar_type}
                    onChange={e => setStructureForm(f => ({ ...f, scholar_type: e.target.value }))}>
                    <option>Day Scholar</option>
                    <option>Boarder</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Financial Year *</label>
                  <input value={structureForm.financial_year}
                    onChange={e => setStructureForm(f => ({ ...f, financial_year: e.target.value }))}
                    placeholder="e.g. 2026/2027" />
                </div>
              </div>

              {/* Fee table — matches Django layout */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: '30%', textAlign: 'left' }}>VOTE HEAD</th>
                      <th style={{ ...th, width: '17%' }}>TERM 1 (Ksh)</th>
                      <th style={{ ...th, width: '17%' }}>TERM 2 (Ksh)</th>
                      <th style={{ ...th, width: '17%' }}>TERM 3 (Ksh)</th>
                      <th style={{ ...th, width: '19%' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* LTT */}
                    <tr>
                      <td style={{ border: '1px solid #555', padding: '4px 8px', color: '#e2e8f0' }}>L.T.T (Training)</td>
                      <td style={tdi}>{ni('ltt_t1')}</td>
                      <td style={tdi}>{ni('ltt_t2')}</td>
                      <td style={tdi}>{ni('ltt_t3')}</td>
                      <td style={tdt}>{(Number(structureForm.ltt_t1||0)+Number(structureForm.ltt_t2||0)+Number(structureForm.ltt_t3||0)).toLocaleString()}</td>
                    </tr>

                    {/* Boarding — hidden for Day Scholar */}
                    {!isDayScholar && (
                      <tr>
                        <td style={{ border: '1px solid #555', padding: '4px 8px', fontWeight: 'bold', color: '#4ade80' }}>BOARDING FEE</td>
                        <td style={tdi}>{ni('boarding_fee_t1')}</td>
                        <td style={tdi}>{ni('boarding_fee_t2')}</td>
                        <td style={tdi}>{ni('boarding_fee_t3')}</td>
                        <td style={tdt}>{(Number(structureForm.boarding_fee_t1||0)+Number(structureForm.boarding_fee_t2||0)+Number(structureForm.boarding_fee_t3||0)).toLocaleString()}</td>
                      </tr>
                    )}

                    {/* PTA */}
                    <tr>
                      <td style={{ border: '1px solid #555', padding: '4px 8px', color: '#e2e8f0' }}>P.T.A (Lunch &amp; Tea)</td>
                      <td style={tdi}>{ni('pta_t1')}</td>
                      <td style={tdi}>{ni('pta_t2')}</td>
                      <td style={tdi}>{ni('pta_t3')}</td>
                      <td style={tdt}>{(Number(structureForm.pta_t1||0)+Number(structureForm.pta_t2||0)+Number(structureForm.pta_t3||0)).toLocaleString()}</td>
                    </tr>

                    {/* Medical */}
                    <tr>
                      <td style={{ border: '1px solid #555', padding: '4px 8px', color: '#e2e8f0' }}>MEDICAL</td>
                      <td style={tdi}>{ni('medical_t1')}</td>
                      <td style={tdi}>{ni('medical_t2')}</td>
                      <td style={tdi}>{ni('medical_t3')}</td>
                      <td style={tdt}>{(Number(structureForm.medical_t1||0)+Number(structureForm.medical_t2||0)+Number(structureForm.medical_t3||0)).toLocaleString()}</td>
                    </tr>

                    {/* One-off fees */}
                    {[
                      { label: 'CONTINGENCIES', key: 'contingencies_t1' },
                      { label: 'ADMISSION FEE', key: 'adm_fee' },
                      { label: 'STUDENT ID CARD', key: 'student_id_fee' },
                      { label: 'CAUTION MONEY', key: 'caution_money' },
                    ].map(row => (
                      <tr key={row.key}>
                        <td style={{ border: '1px solid #555', padding: '4px 8px', color: '#e2e8f0' }}>{row.label}</td>
                        <td style={tdi}>{ni(row.key)}</td>
                        <td style={tdl}>—</td>
                        <td style={tdl}>—</td>
                        <td style={tdt}>{Number(structureForm[row.key]||0).toLocaleString()}</td>
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr>
                      <td style={{ border: '1px solid #555', padding: '8px', textAlign: 'right', fontWeight: 'bold', background: '#1e2736', textTransform: 'uppercase', fontSize: 12, color: '#e2e8f0' }}>Total per Term</td>
                      <td style={{ border: '1px solid #555', padding: '8px', textAlign: 'center', fontWeight: 'bold', background: '#1e2736', color: '#e2e8f0' }}>{modalT1.toLocaleString()}</td>
                      <td style={{ border: '1px solid #555', padding: '8px', textAlign: 'center', fontWeight: 'bold', background: '#1e2736', color: '#e2e8f0' }}>{modalT2.toLocaleString()}</td>
                      <td style={{ border: '1px solid #555', padding: '8px', textAlign: 'center', fontWeight: 'bold', background: '#1e2736', color: '#e2e8f0' }}>{modalT3.toLocaleString()}</td>
                      <td style={{ border: '1px solid #555', padding: '8px', textAlign: 'center', fontWeight: 'bold', background: '#2c3e50', color: 'white' }}>{(modalT1+modalT2+modalT3).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Structure'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowStructureModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}