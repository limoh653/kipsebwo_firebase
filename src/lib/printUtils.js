// ============================================================
// KIPSEBWO VTC — Print Utilities
// All print functions open a styled window and trigger window.print()
// ============================================================

export function printReceipt(payment, student, balance) {
  const win = window.open('', '_blank', 'width=600,height=750')
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${payment.reference_number}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 30px; margin: 0; }
    .receipt-card {
      background: white; max-width: 500px; margin: auto;
      padding: 40px; border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      border-top: 8px solid #1e8449;
    }
    .school-title { text-align: center; margin-bottom: 30px; }
    .school-title h1 { margin: 0; color: #1e8449; font-size: 20px; text-transform: uppercase; }
    .school-title p { margin: 5px 0; color: #7f8c8d; font-size: 13px; font-weight: bold; }
    .divider { border-top: 2px solid #eee; margin: 20px 0; position: relative; }
    .divider::after {
      content: "OFFICIAL RECEIPT"; position: absolute; top: -10px;
      left: 50%; transform: translateX(-50%); background: white;
      padding: 0 10px; font-size: 10px; color: #95a5a6; font-weight: bold;
    }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid #fafafa; }
    .label { color: #7f8c8d; }
    .value { color: #2c3e50; font-weight: 600; }
    .amount-highlight { background: #f1f9f4; padding: 20px; border-radius: 5px; margin-top: 20px; text-align: center; }
    .amount-paid { font-size: 32px; color: #27ae60; font-weight: bold; margin: 0; }
    .balance-due { font-size: 14px; color: #c0392b; margin-top: 5px; }
    .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
    .sig-box { border-top: 1px solid #333; width: 150px; text-align: center; font-size: 12px; padding-top: 5px; color: #7f8c8d; }
    .actions { text-align: center; margin-top: 30px; }
    .btn { padding: 10px 25px; border-radius: 5px; font-weight: bold; cursor: pointer; border: none; font-size: 14px; margin: 4px; }
    .btn-print { background: #1e8449; color: white; }
    .btn-close { background: #7f8c8d; color: white; }
    @media print {
      body { background: white; padding: 0; }
      .receipt-card { box-shadow: none; border: 1px solid #eee; max-width: 100%; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="school-title">
      <h1>ST AUGUSTINE KIPSEBWO VTC</h1>
      <p>Finance Department — Payment Receipt</p>
    </div>
    <div class="divider"></div>
    <div class="info-row"><span class="label">Receipt Number</span><span class="value">${payment.reference_number}</span></div>
    <div class="info-row"><span class="label">Date</span><span class="value">${new Date(payment.date_paid).toLocaleString()}</span></div>
    <div class="info-row"><span class="label">Student Name</span><span class="value">${student.name}</span></div>
    <div class="info-row"><span class="label">Admission Number</span><span class="value">${student.admission_number}</span></div>
    <div class="info-row"><span class="label">Course</span><span class="value">${student.course}</span></div>
    <div class="info-row"><span class="label">Payment Mode</span><span class="value">${payment.mode}</span></div>
    <div class="amount-highlight">
      <p style="margin:0;font-size:12px;color:#7f8c8d;text-transform:uppercase;">Total Amount Paid</p>
      <p class="amount-paid">KSH ${Number(payment.amount).toLocaleString()}</p>
      <p class="balance-due">Outstanding Balance: KSH ${Number(balance).toLocaleString()}</p>
    </div>
    <div class="signature-section">
      <div class="sig-box">Student Signature</div>
      <div class="sig-box">Bursar's Stamp/Sig</div>
    </div>
    <div class="actions">
      <button onclick="window.print()" class="btn btn-print">🖨 Print Receipt</button>
      <button onclick="window.close()" class="btn btn-close">Close</button>
    </div>
  </div>
</body>
</html>`)
  win.document.close()
}

export function printFeeStructure(structure) {
  const t1 = (s) => [s.pta_t1,s.medical_t1,s.ltt_t1,s.contingencies_t1,s.adm_fee,s.caution_money,s.student_id_fee,s.boarding_fee_t1].reduce((a,b)=>a+Number(b),0)
  const t2 = (s) => [s.pta_t2,s.medical_t2,s.ltt_t2,s.boarding_fee_t2].reduce((a,b)=>a+Number(b),0)
  const t3 = (s) => [s.pta_t3,s.medical_t3,s.ltt_t3,s.boarding_fee_t3].reduce((a,b)=>a+Number(b),0)

  const term1 = t1(structure), term2 = t2(structure), term3 = t3(structure)
  const grand = term1 + term2 + term3

  const row = (label, k1, k2, k3) => {
    const v1 = Number(structure[k1]||0), v2 = Number(structure[k2]||0), v3 = Number(structure[k3]||0)
    return `<tr>
      <td>${label}</td>
      <td class="tr">${v1.toLocaleString()}</td>
      <td class="tr">${v2.toLocaleString()}</td>
      <td class="tr">${v3.toLocaleString()}</td>
      <td class="tr bold">${(v1+v2+v3).toLocaleString()}</td>
    </tr>`
  }
  const oneOff = (label, key) => {
    const v = Number(structure[key]||0)
    return `<tr>
      <td>${label}</td>
      <td class="tr">${v.toLocaleString()}</td>
      <td class="tr">0</td><td class="tr">0</td>
      <td class="tr bold">${v.toLocaleString()}</td>
    </tr>`
  }

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fee Structure - ${structure.course}</title>
  <style>
    body { font-family: "Times New Roman", Times, serif; line-height: 1.4; color: #000; margin: 0; padding: 20px; }
    .container { max-width: 850px; margin: auto; padding: 20px; border: 1px solid #eee; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h2, .header h3 { margin: 2px 0; text-transform: uppercase; }
    .header-line { border-bottom: 2px solid #000; margin: 10px 0; }
    .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 13px; }
    th { background-color: #f2f2f2; text-align: center; }
    .tr { text-align: right; }
    .bold { font-weight: bold; }
    .total-row { background-color: #eee; font-weight: bold; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; }
    .sig-line { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px; font-size: 13px; }
    .no-print { text-align: right; margin-bottom: 15px; }
    .btn-print { padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    @media print { .no-print { display: none; } body { padding: 0; } .container { border: none; } }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" class="btn-print">🖨 Print Fee Structure</button>
  </div>
  <div class="container">
    <div class="header">
      <h3>MINISTRY OF EDUCATION</h3>
      <h2>ST. AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h2>
      <p>P.O BOX 45-30304 KAPCHENO | TEL: 0720919005</p>
      <div class="header-line"></div>
      <h3>FEE STRUCTURE FOR FY: ${structure.financial_year}</h3>
    </div>
    <div class="info-section">
      <div>NAME: _________________________________</div>
      <div>ADM NO: _______________________________</div>
      <div>COURSE: ${structure.course.toUpperCase()}</div>
      <div>STATUS: ${structure.scholar_type.toUpperCase()}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>VOTE HEAD</th><th>TERM 1 (Ksh)</th><th>TERM 2 (Ksh)</th><th>TERM 3 (Ksh)</th><th>TOTAL (Ksh)</th>
        </tr>
      </thead>
      <tbody>
        ${row('L.T.T (Training)', 'ltt_t1', 'ltt_t2', 'ltt_t3')}
        ${row('BOARDING FEE', 'boarding_fee_t1', 'boarding_fee_t2', 'boarding_fee_t3')}
        ${row('P.T.A (Lunch & Tea)', 'pta_t1', 'pta_t2', 'pta_t3')}
        ${row('MEDICAL', 'medical_t1', 'medical_t2', 'medical_t3')}
        ${oneOff('CONTINGENCIES', 'contingencies_t1')}
        ${oneOff('ADMISSION FEE (New Students)', 'adm_fee')}
        ${oneOff('STUDENT ID CARD', 'student_id_fee')}
        ${oneOff('CAUTION MONEY', 'caution_money')}
        <tr class="total-row">
          <td>TOTAL PER TERM (KSH)</td>
          <td class="tr">${term1.toLocaleString()}</td>
          <td class="tr">${term2.toLocaleString()}</td>
          <td class="tr">${term3.toLocaleString()}</td>
          <td class="tr">${grand.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      <div class="sig-line">Bursar / Principal</div>
      <div style="width:200px;text-align:center;font-weight:bold;border:2px dashed #ccc;padding:20px;">OFFICIAL STAMP</div>
    </div>
  </div>
</body>
</html>`)
  win.document.close()
}

export function printTransactions(payments, startDate, endDate) {
  const total = payments.reduce((s, p) => s + Number(p.amount), 0)
  const rows = payments.map(p => `
    <tr>
      <td>${new Date(p.date_paid).toLocaleDateString()}</td>
      <td>${p.students?.name || ''}</td>
      <td>${p.students?.admission_number || ''}</td>
      <td>${p.mode}</td>
      <td>${p.reference_number}</td>
      <td style="text-align:right;font-weight:bold;">KSH ${Number(p.amount).toLocaleString()}</td>
    </tr>`).join('')

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Transactions Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 13px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h1 { margin: 0; font-size: 18px; }
    h2 { margin: 4px 0; color: #444; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #444; padding: 8px 10px; text-align: left; }
    th { background-color: #f2f2f2; text-transform: uppercase; font-size: 11px; }
    .total-row { background: #e8f5e9; font-weight: bold; font-size: 15px; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #666; }
    .no-print { text-align: right; margin-bottom: 15px; }
    .btn { padding: 8px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin: 2px; }
    .btn-print { background: #1e8449; color: white; }
    .btn-close { background: #888; color: white; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" class="btn btn-print">🖨 Print Report</button>
    <button onclick="window.close()" class="btn btn-close">Close</button>
  </div>
  <div class="header">
    <h1>ST AUGUSTINE KIPSEBWO VTC</h1>
    <h2>TRANSACTIONS REPORT</h2>
    <p>Period: ${startDate} to ${endDate} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
  </div>
  <table>
    <thead>
      <tr><th>Date</th><th>Student Name</th><th>Adm. No.</th><th>Mode</th><th>Reference</th><th style="text-align:right">Amount (KSH)</th></tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td colspan="5" style="text-align:right;">TOTAL COLLECTED</td>
        <td style="text-align:right;">KSH ${total.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>
  <div class="footer">
    <span>Total Records: ${payments.length}</span>
    <span>End of Report</span>
  </div>
</body>
</html>`)
  win.document.close()
}

export function printConsumables(items) {
  const rows = items.map(i => `
    <tr>
      <td>${i.description}</td>
      <td>${i.quantity}</td>
      <td>${i.number_issued}</td>
      <td><strong>${i.balance_in_stock}</strong></td>
      <td>${i.date_supplied || '—'}</td>
    </tr>`).join('')

  const win = window.open('', '_blank', 'width=800,height=600')
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Consumables Inventory Report</title>
  <style>
    body { font-family: sans-serif; padding: 20px; font-size: 13px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
    h1 { margin: 0; font-size: 18px; }
    h2 { margin: 4px 0; color: #444; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #444; padding: 9px 10px; text-align: left; }
    th { background-color: #f2f2f2; text-transform: uppercase; font-size: 11px; }
    tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
    .no-print { text-align: right; margin-bottom: 15px; }
    .btn { padding: 8px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin: 2px; }
    .btn-print { background: #1e8449; color: white; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" class="btn btn-print">🖨 Print Report</button>
  </div>
  <div class="header">
    <h1>ST AUGUSTINE KIPSEBWO VTC</h1>
    <h2>CONSUMABLES INVENTORY REPORT</h2>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>
  <table>
    <thead>
      <tr><th>Description</th><th>Qty In</th><th>Qty Issued</th><th>Balance</th><th>Date Supplied</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer"><p>Total Items: ${items.length} &nbsp;|&nbsp; End of Report</p></div>
</body>
</html>`)
  win.document.close()
}

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

  const win = window.open('', '_blank', 'width=1100,height=700')
  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Permanent Asset Register</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; padding: 20px; font-size: 11px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
    h1 { margin: 0; font-size: 17px; }
    h2 { margin: 5px 0; color: #444; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; font-size: 10px; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; }
    .sig-line { border-top: 1px solid #000; width: 200px; margin-top: 40px; text-align: center; font-size: 12px; padding-top: 5px; }
    .no-print { text-align: right; margin-bottom: 15px; }
    .btn { padding: 8px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
    .btn-print { background: #1e8449; color: white; }
    @media print {
      @page { size: landscape; margin: 1cm; }
      .no-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" class="btn btn-print">🖨 Print Register</button>
  </div>
  <div class="header">
    <h1>ST AUGUSTINE KIPSEBWO VOCATIONAL TRAINING CENTRE</h1>
    <h2>PERMANENT ASSET REGISTER</h2>
    <p>Report Date: ${new Date().toLocaleString()}</p>
  </div>
  <table>
    <thead>
      <tr><th>Asset Description</th><th>Serial Number</th><th>Make/Model</th><th>Delivery Date</th><th>Current Location</th><th>Condition</th><th>Remarks</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <div class="sig-line">Storekeeper Signature</div>
    <div class="sig-line">Manager/Principal Signature</div>
  </div>
</body>
</html>`)
  win.document.close()
}
