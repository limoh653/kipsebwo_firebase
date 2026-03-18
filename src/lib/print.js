// Opens a new window and triggers window.print()
function openPrintWindow(html) {
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
}

// ─────────────────────────────────────────────
// 1. PAYMENT RECEIPT
// ─────────────────────────────────────────────
export function printReceipt(payment, student, balance) {
  openPrintWindow(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Receipt - ${payment.reference_number}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 30px; }
      .card { background: white; max-width: 500px; margin: auto; padding: 40px;
              border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              border-top: 8px solid #1e8449; }
      .school-title { text-align: center; margin-bottom: 30px; }
      .school-title h1 { margin: 0; color: #1e8449; font-size: 22px; text-transform: uppercase; }
      .school-title p { margin: 5px 0; color: #7f8c8d; font-size: 14px; }
      .divider { border-top: 2px solid #eee; margin: 20px 0; position: relative; }
      .divider::after { content: "OFFICIAL RECEIPT"; position: absolute; top: -10px;
        left: 50%; transform: translateX(-50%); background: white; padding: 0 10px;
        font-size: 10px; color: #95a5a6; font-weight: bold; }
      .row { display: flex; justify-content: space-between; padding: 8px 0;
             font-size: 15px; border-bottom: 1px solid #fafafa; }
      .label { color: #7f8c8d; }
      .value { color: #2c3e50; font-weight: 600; }
      .amount-box { background: #f1f9f4; padding: 20px; border-radius: 5px;
                    margin-top: 20px; text-align: center; }
      .amount { font-size: 28px; color: #27ae60; font-weight: bold; margin: 0; }
      .balance { font-size: 14px; color: #c0392b; margin-top: 5px; }
      .sigs { margin-top: 40px; display: flex; justify-content: space-between; }
      .sig { border-top: 1px solid #333; width: 150px; text-align: center;
             font-size: 12px; padding-top: 5px; color: #7f8c8d; }
      .actions { text-align: center; margin-top: 30px; }
      .btn { padding: 10px 25px; border-radius: 5px; font-weight: bold;
             cursor: pointer; border: none; font-size: 14px; }
      .btn-print { background: #1e8449; color: white; }
      .btn-back { background: #7f8c8d; color: white; margin-left: 10px; }
      @media print { body { background: white; padding: 0; }
        .card { box-shadow: none; max-width: 100%; } .actions { display: none; } }
    </style></head><body>
    <div class="card">
      <div class="school-title">
        <h1>ST AUGUSTINE KIPSEBWO VTC</h1>
        <p>Finance Department - Payment Receipt</p>
      </div>
      <div class="divider"></div>
      <div class="row"><span class="label">Receipt Number</span><span class="value">${payment.reference_number}</span></div>
      <div class="row"><span class="label">Date</span><span class="value">${new Date(payment.date_paid).toLocaleString()}</span></div>
      <div class="row"><span class="label">Student Name</span><span class="value">${student.name}</span></div>
      <div class="row"><span class="label">Admission Number</span><span class="value">${student.admission_number}</span></div>
      <div class="row"><span class="label">Course</span><span class="value">${student.course}</span></div>
      <div class="row"><span class="label">Payment Mode</span><span class="value">${payment.mode}</span></div>
      <div class="amount-box">
        <p style="margin:0;font-size:12px;color:#7f8c8d;text-transform:uppercase">Total Amount Paid</p>
        <p class="amount">KSH ${Number(payment.amount).toLocaleString()}</p>
        <p class="balance">Outstanding Balance: KSH ${Number(balance || 0).toLocaleString()}</p>
      </div>
      <div class="sigs">
        <div class="sig">Student Signature</div>
        <div class="sig">Bursar's Stamp/Sig</div>
      </div>
      <div class="actions">
        <button onclick="window.print()" class="btn btn-print">Print Receipt</button>
        <button onclick="window.close()" class="btn btn-back">Close</button>
      </div>
    </div>
    </body></html>
  `)
}

// ─────────────────────────────────────────────
// 2. FEE STRUCTURE
// ─────────────────────────────────────────────
export function printFeeStructure(s) {
  const t1 = [s.pta_t1,s.medical_t1,s.ltt_t1,s.contingencies_t1,s.adm_fee,s.caution_money,s.student_id_fee,s.boarding_fee_t1].reduce((a,b)=>a+Number(b),0)
  const t2 = [s.pta_t2,s.medical_t2,s.ltt_t2,s.boarding_fee_t2].reduce((a,b)=>a+Number(b),0)
  const t3 = [s.pta_t3,s.medical_t3,s.ltt_t3,s.boarding_fee_t3].reduce((a,b)=>a+Number(b),0)
  const grand = t1 + t2 + t3

  const row = (label, v1, v2, v3) => `
    <tr>
      <td>${label}</td>
      <td class="r">${Number(v1).toLocaleString()}</td>
      <td class="r">${Number(v2).toLocaleString()}</td>
      <td class="r">${Number(v3).toLocaleString()}</td>
      <td class="r b">${(Number(v1)+Number(v2)+Number(v3)).toLocaleString()}</td>
    </tr>`

  openPrintWindow(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Fee Structure - ${s.course}</title>
    <style>
      body { font-family: "Times New Roman", serif; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
      .container { max-width: 850px; margin: auto; padding: 20px; border: 1px solid #eee; }
      .header { text-align: center; margin-bottom: 20px; }
      .header h2, .header h3 { margin: 2px 0; text-transform: uppercase; }
      .header-line { border-bottom: 2px solid #000; margin: 10px 0; }
      .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
              margin-bottom: 15px; font-weight: bold; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #000; padding: 8px; font-size: 13px; }
      th { background: #f2f2f2; text-align: center; }
      .r { text-align: right; } .b { font-weight: bold; }
      .totrow { background: #eee; font-weight: bold; }
      .footer { margin-top: 40px; display: flex; justify-content: space-between; }
      .sig { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px; font-size: 13px; }
      .stamp { width: 200px; text-align: center; font-weight: bold;
               border: 2px dashed #ccc; padding: 20px; font-size: 13px; }
      .no-print { text-align: right; margin-bottom: 15px; }
      .btn { padding: 10px 20px; background: #27ae60; color: white;
             border: none; border-radius: 4px; cursor: pointer; }
      @media print { .no-print { display: none; } body { padding: 0; } .container { border: none; } }
    </style></head><body>
    <div class="no-print"><button onclick="window.print()" class="btn">Print Fee Structure</button></div>
    <div class="container">
      <div class="header">
        <h3>MINISTRY OF EDUCATION</h3>
        <h2>ST. AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h2>
        <p>P.O BOX 45-30304 KAPCHENO | TEL: 0720919005</p>
        <div class="header-line"></div>
        <h3>FEE STRUCTURE FOR FY: ${s.financial_year}</h3>
      </div>
      <div class="info">
        <div>NAME: _________________________________</div>
        <div>ADM NO: _______________________________</div>
        <div>COURSE: ${s.course.toUpperCase()}</div>
        <div>STATUS: ${s.scholar_type.toUpperCase()}</div>
      </div>
      <table>
        <thead>
          <tr><th>VOTE HEAD</th><th>TERM 1 (Ksh)</th><th>TERM 2 (Ksh)</th><th>TERM 3 (Ksh)</th><th>TOTAL (Ksh)</th></tr>
        </thead>
        <tbody>
          ${row('L.T.T (Training)', s.ltt_t1, s.ltt_t2, s.ltt_t3)}
          ${row('BOARDING FEE', s.boarding_fee_t1, s.boarding_fee_t2, s.boarding_fee_t3)}
          ${row('P.T.A (Lunch & Tea)', s.pta_t1, s.pta_t2, s.pta_t3)}
          ${row('MEDICAL', s.medical_t1, s.medical_t2, s.medical_t3)}
          <tr><td>CONTINGENCIES</td><td class="r">${Number(s.contingencies_t1).toLocaleString()}</td><td class="r">0</td><td class="r">0</td><td class="r b">${Number(s.contingencies_t1).toLocaleString()}</td></tr>
          <tr><td>ADMISSION FEE (New Students)</td><td class="r">${Number(s.adm_fee).toLocaleString()}</td><td class="r">0</td><td class="r">0</td><td class="r b">${Number(s.adm_fee).toLocaleString()}</td></tr>
          <tr><td>STUDENT ID CARD</td><td class="r">${Number(s.student_id_fee).toLocaleString()}</td><td class="r">0</td><td class="r">0</td><td class="r b">${Number(s.student_id_fee).toLocaleString()}</td></tr>
          <tr><td>CAUTION MONEY</td><td class="r">${Number(s.caution_money).toLocaleString()}</td><td class="r">0</td><td class="r">0</td><td class="r b">${Number(s.caution_money).toLocaleString()}</td></tr>
          <tr class="totrow"><td>TOTAL PER TERM (KSH)</td><td class="r">${t1.toLocaleString()}</td><td class="r">${t2.toLocaleString()}</td><td class="r">${t3.toLocaleString()}</td><td class="r">${grand.toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="sig">Bursar / Principal</div>
        <div class="stamp">OFFICIAL STAMP</div>
      </div>
    </div>
    </body></html>
  `)
}

// ─────────────────────────────────────────────
// 3. TRANSACTIONS REPORT (date range)
// ─────────────────────────────────────────────
export function printTransactions(payments, startDate, endDate) {
  const total = payments.reduce((s, p) => s + Number(p.amount), 0)
  const rows = payments.map(p => `
    <tr>
      <td>${new Date(p.date_paid).toLocaleDateString()}</td>
      <td>${p.students?.name || ''}</td>
      <td>${p.students?.admission_number || ''}</td>
      <td style="text-align:right;font-weight:bold">KSH ${Number(p.amount).toLocaleString()}</td>
      <td>${p.mode}</td>
      <td>${p.reference_number}</td>
    </tr>`).join('')

  openPrintWindow(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Transactions Report</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 13px; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
      h1 { margin: 0; font-size: 20px; } h2 { margin: 4px 0; color: #444; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #555; padding: 8px; }
      th { background: #f2f2f2; text-transform: uppercase; font-size: 11px; }
      .total-row { background: #e8f5e9; font-weight: bold; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; }
      .actions { margin-bottom: 15px; text-align: right; }
      .btn { padding: 8px 20px; background: #27ae60; color: white; border: none;
             border-radius: 4px; cursor: pointer; font-size: 13px; }
      @media print { .actions { display: none; } body { padding: 0; } }
    </style></head><body>
    <div class="actions"><button onclick="window.print()" class="btn">Print Report</button></div>
    <div class="header">
      <h1>ST AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h1>
      <h2>TRANSACTIONS REPORT</h2>
      <p>Period: ${startDate} to ${endDate} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
    </div>
    <table>
      <thead><tr><th>Date</th><th>Student Name</th><th>Adm. No.</th><th>Amount</th><th>Mode</th><th>Reference</th></tr></thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="3" style="text-align:right">TOTAL COLLECTED</td>
          <td style="text-align:right">KSH ${total.toLocaleString()}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>
    <div class="footer"><p>Total transactions: ${payments.length} &nbsp;|&nbsp; End of Report</p></div>
    </body></html>
  `)
}

// ─────────────────────────────────────────────
// 4. CONSUMABLES INVENTORY
// ─────────────────────────────────────────────
export function printConsumables(items) {
  const rows = items.map(i => `
    <tr>
      <td>${i.description}</td>
      <td>${i.quantity}</td>
      <td>${i.number_issued}</td>
      <td><strong>${i.balance_in_stock}</strong></td>
      <td>${i.date_supplied || '—'}</td>
    </tr>`).join('')

  openPrintWindow(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Consumables Inventory</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #444; padding: 10px; text-align: left; }
      th { background: #f2f2f2; text-transform: uppercase; font-size: 12px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; }
      .no-print { text-align: right; margin-bottom: 10px; }
      .btn { padding: 8px 20px; background: #27ae60; color: white; border: none;
             border-radius: 4px; cursor: pointer; }
      @media print { .no-print { display: none; } }
    </style></head><body>
    <div class="no-print"><button onclick="window.print()" class="btn">Print</button></div>
    <div class="header">
      <h1>ST AUGUSTINE KIPSEBWO VTC</h1>
      <h2>CONSUMABLES INVENTORY REPORT</h2>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Qty In</th><th>Qty Issued</th><th>Balance</th><th>Date Supplied</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer"><p>Total items: ${items.length} &nbsp;|&nbsp; End of Report</p></div>
    </body></html>
  `)
}

// ─────────────────────────────────────────────
// 5. PERMANENT EQUIPMENT REGISTER
// ─────────────────────────────────────────────
export function printEquipment(items) {
  const rows = items.map(i => `
    <tr>
      <td>${i.asset_description}</td>
      <td>${i.serial_number}</td>
      <td>${i.make_and_model || '—'}</td>
      <td>${i.date_of_delivery || '—'}</td>
      <td>${i.current_location || '—'}</td>
      <td>${i.asset_condition}</td>
      <td>${i.remarks || '—'}</td>
    </tr>`).join('')

  openPrintWindow(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Equipment Register</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 11px; }
      .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
      h1 { margin: 0; font-size: 18px; } h2 { margin: 5px 0; color: #444; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #000; padding: 6px; text-align: left; }
      th { background: #f0f0f0; font-weight: bold; text-transform: uppercase; }
      .footer { margin-top: 40px; display: flex; justify-content: space-between; }
      .sig { border-top: 1px solid #000; width: 200px; margin-top: 40px; text-align: center; font-size: 12px; padding-top: 4px; }
      .no-print { text-align: right; margin-bottom: 10px; }
      .btn { padding: 8px 20px; background: #2c3e50; color: white; border: none;
             border-radius: 4px; cursor: pointer; }
      @media print { @page { size: landscape; margin: 1cm; } .no-print { display: none; } body { padding: 0; } }
    </style></head><body>
    <div class="no-print"><button onclick="window.print()" class="btn">Print</button></div>
    <div class="header">
      <h1>ST AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h1>
      <h2>PERMANENT ASSET REGISTER</h2>
      <p>Report Date: ${new Date().toLocaleString()}</p>
    </div>
    <table>
      <thead><tr><th>Asset Description</th><th>Serial No.</th><th>Make/Model</th><th>Delivery Date</th><th>Current Location</th><th>Condition</th><th>Remarks</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="footer">
      <div class="sig">Storekeeper Signature</div>
      <div class="sig">Manager/Principal Signature</div>
    </div>
    </body></html>
  `)
}

// ─────────────────────────────────────────────
// 6. STUDENT EXAM REPORT CARD
// ─────────────────────────────────────────────
export function printStudentReport(student, exams, year, term) {
  const filtered = exams.filter(e =>
    (!year || e.year_of_study === year) &&
    (!term || e.semester === term)
  )
  const avg = filtered.length
    ? (filtered.reduce((s, e) => s + Number(e.total_marks), 0) / filtered.length).toFixed(2)
    : 0

  const rows = filtered.map(e => {
    const grade = Number(e.total_marks) >= 70 ? 'A' : Number(e.total_marks) >= 60 ? 'B' : Number(e.total_marks) >= 50 ? 'C' : Number(e.total_marks) >= 40 ? 'D' : 'F'
    return `<tr>
      <td>${e.subject_name}</td>
      <td style="text-align:center">${e.cat_1}</td>
      <td style="text-align:center">${e.cat_2}</td>
      <td style="text-align:center">${e.end_term}</td>
      <td style="text-align:center;font-weight:bold">${Number(e.total_marks).toFixed(1)}</td>
      <td style="text-align:center;font-weight:bold">${grade}</td>
    </tr>`
  }).join('')

  openPrintWindow(`
    <!DOCTYPE html><html><head><meta charset="UTF-8">
    <title>Report Card - ${student.name}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 13px; }
      .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
      h1 { margin: 0; font-size: 20px; } h2 { margin: 4px 0; }
      .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
                      margin-bottom: 20px; padding: 12px; background: #f9f9f9;
                      border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #555; padding: 8px; }
      th { background: #34495e; color: white; text-transform: uppercase; font-size: 11px; }
      .summary { margin-top: 20px; padding: 12px; background: #eafaf1;
                 border: 1px solid #27ae60; border-radius: 4px; font-weight: bold; }
      .footer { margin-top: 40px; display: flex; justify-content: space-between; }
      .sig { border-top: 1px solid #000; width: 180px; text-align: center;
             padding-top: 4px; font-size: 12px; margin-top: 30px; }
      .no-print { text-align: right; margin-bottom: 10px; }
      .btn { padding: 8px 20px; background: #8e44ad; color: white; border: none;
             border-radius: 4px; cursor: pointer; }
      @media print { .no-print { display: none; } }
    </style></head><body>
    <div class="no-print"><button onclick="window.print()" class="btn">Print Report Card</button></div>
    <div class="header">
      <h1>ST AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h1>
      <h2>STUDENT ACADEMIC REPORT</h2>
      <p>${year ? `Year ${year}` : 'All Years'} ${term ? `| Semester ${term}` : ''} &nbsp;|&nbsp; Printed: ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="student-info">
      <div><strong>Name:</strong> ${student.name}</div>
      <div><strong>Adm. No:</strong> ${student.admission_number}</div>
      <div><strong>Course:</strong> ${student.course}</div>
      <div><strong>Residence:</strong> ${student.residence}</div>
    </div>
    <table>
      <thead><tr><th>Subject</th><th>CAT 1</th><th>CAT 2</th><th>End Term</th><th>Total</th><th>Grade</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary">
      Mean Score: ${avg} &nbsp;|&nbsp; Subjects: ${filtered.length}
    </div>
    <div class="footer">
      <div class="sig">Class Teacher</div>
      <div class="sig">Principal</div>
    </div>
    </body></html>
  `)
}
