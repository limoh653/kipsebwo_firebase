import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Plus, X, Package, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { printConsumables, printEquipment } from '../../lib/print'

const BLANK_CONSUMABLE = { description: '', quantity: 0, number_issued: 0 }
const BLANK_EQUIPMENT = {
  asset_description: '', serial_number: '', make_and_model: '',
  date_of_delivery: '', original_location: '', current_location: '',
  asset_condition: 'Good', remarks: ''
}

export default function StoresPage() {
  const { user } = useAuth()
  const [consumables, setConsumables] = useState([])
  const [equipment, setEquipment] = useState([])
  const [activeTab, setActiveTab] = useState('consumables')
  const [showConsModal, setShowConsModal] = useState(false)
  const [showEquipModal, setShowEquipModal] = useState(false)
  const [consForm, setConsForm] = useState(BLANK_CONSUMABLE)
  const [equipForm, setEquipForm] = useState(BLANK_EQUIPMENT)
  const [editingCons, setEditingCons] = useState(null)
  const [editingEquip, setEditingEquip] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: c }, { data: e }] = await Promise.all([
      supabase.from('consumables').select('*').order('description'),
      supabase.from('permanent_equipment').select('*').order('asset_description')
    ])
    setConsumables(c || []); setEquipment(e || [])
  }

  async function handleConsSave(e) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...consForm, added_by: user.id }
    const action = editingCons
      ? supabase.from('consumables').update(payload).eq('id', editingCons.id)
      : supabase.from('consumables').insert(payload)
    const { error } = await action
    setLoading(false)
    if (error) { toast.error(error.message); return }
    await supabase.from('audit_trail').insert({ user_id: user.id, username: user.email, action: `${editingCons ? 'Edited' : 'Added'} consumable: ${consForm.description}` })
    toast.success('Consumable saved!')
    setShowConsModal(false); setEditingCons(null); setConsForm(BLANK_CONSUMABLE); fetchAll()
  }

  async function handleEquipSave(e) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...equipForm, added_by: user.id }
    const action = editingEquip
      ? supabase.from('permanent_equipment').update(payload).eq('id', editingEquip.id)
      : supabase.from('permanent_equipment').insert(payload)
    const { error } = await action
    setLoading(false)
    if (error) { toast.error(error.message); return }
    await supabase.from('audit_trail').insert({ user_id: user.id, username: user.email, action: `${editingEquip ? 'Edited' : 'Added'} equipment: ${equipForm.asset_description}` })
    toast.success('Equipment saved!')
    setShowEquipModal(false); setEditingEquip(null); setEquipForm(BLANK_EQUIPMENT); fetchAll()
  }

  function conditionBadge(c) {
    const cls = { Good: 'badge-green', Fair: 'badge-yellow', Damaged: 'badge-red', Disposed: 'badge-gray' }
    return <span className={`badge ${cls[c] || 'badge-gray'}`}>{c}</span>
  }

  return (
    <div className="page-wrap">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Stores</h1><p>Manage inventory and equipment</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => { setEditingEquip(null); setEquipForm(BLANK_EQUIPMENT); setShowEquipModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Equipment
          </button>
          <button className="btn-primary" onClick={() => { setEditingCons(null); setConsForm(BLANK_CONSUMABLE); setShowConsModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Consumable
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderTop: '3px solid #3b82f6' }}>
          <div className="stat-value">{consumables.length}</div>
          <div className="stat-label">Consumable Items</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #22c55e' }}>
          <div className="stat-value">{equipment.length}</div>
          <div className="stat-label">Equipment Assets</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #2a3347' }}>
        {['consumables', 'equipment'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', color: activeTab === tab ? '#e2e8f0' : '#64748b',
              padding: '10px 20px', borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: -1, textTransform: 'capitalize'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'consumables' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>Consumables Inventory</h3>
            <button className="btn-secondary btn-sm" onClick={() => printConsumables(consumables)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={13} /> Print Report
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Description</th><th>Quantity</th><th>Issued</th><th>Balance</th><th>Date Supplied</th><th></th></tr>
              </thead>
              <tbody>
                {consumables.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.description}</td>
                    <td>{c.quantity}</td>
                    <td>{c.number_issued}</td>
                    <td>
                      <span className={`badge ${c.balance_in_stock > 0 ? 'badge-green' : 'badge-red'}`}>
                        {c.balance_in_stock}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{c.date_supplied}</td>
                    <td>
                      <button className="btn-secondary btn-sm" onClick={() => {
                        setEditingCons(c)
                        setConsForm({ description: c.description, quantity: c.quantity, number_issued: c.number_issued })
                        setShowConsModal(true)
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15 }}>Permanent Equipment Register</h3>
            <button className="btn-secondary btn-sm" onClick={() => printEquipment(equipment)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Printer size={13} /> Print Register
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Description</th><th>Serial No.</th><th>Make/Model</th><th>Location</th><th>Condition</th><th>Delivery</th><th></th></tr>
              </thead>
              <tbody>
                {equipment.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.asset_description}</td>
                    <td><code style={{ fontSize: 12, color: '#94a3b8' }}>{e.serial_number}</code></td>
                    <td style={{ color: '#94a3b8' }}>{e.make_and_model}</td>
                    <td>{e.current_location}</td>
                    <td>{conditionBadge(e.asset_condition)}</td>
                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{e.date_of_delivery}</td>
                    <td>
                      <button className="btn-secondary btn-sm" onClick={() => {
                        setEditingEquip(e); setEquipForm({
                          asset_description: e.asset_description, serial_number: e.serial_number,
                          make_and_model: e.make_and_model, date_of_delivery: e.date_of_delivery,
                          original_location: e.original_location, current_location: e.current_location,
                          asset_condition: e.asset_condition, remarks: e.remarks || ''
                        }); setShowEquipModal(true)
                      }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consumable Modal */}
      {showConsModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowConsModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCons ? 'Edit' : 'Add'} Consumable</h2>
              <button onClick={() => setShowConsModal(false)} style={{ background: 'none', padding: 4, color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleConsSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Description *</label>
                <input value={consForm.description} onChange={e => setConsForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" value={consForm.quantity} onChange={e => setConsForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} min={0} />
                </div>
                <div className="form-group">
                  <label>Number Issued</label>
                  <input type="number" value={consForm.number_issued} onChange={e => setConsForm(f => ({ ...f, number_issued: parseInt(e.target.value) || 0 }))} min={0} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowConsModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEquipModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2>{editingEquip ? 'Edit' : 'Add'} Equipment</h2>
              <button onClick={() => setShowEquipModal(false)} style={{ background: 'none', padding: 4, color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleEquipSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Asset Description *</label>
                  <input value={equipForm.asset_description} onChange={e => setEquipForm(f => ({ ...f, asset_description: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Serial Number *</label>
                  <input value={equipForm.serial_number} onChange={e => setEquipForm(f => ({ ...f, serial_number: e.target.value }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Make & Model</label>
                  <input value={equipForm.make_and_model} onChange={e => setEquipForm(f => ({ ...f, make_and_model: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Date of Delivery</label>
                  <input type="date" value={equipForm.date_of_delivery} onChange={e => setEquipForm(f => ({ ...f, date_of_delivery: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Original Location</label>
                  <input value={equipForm.original_location} onChange={e => setEquipForm(f => ({ ...f, original_location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Current Location</label>
                  <input value={equipForm.current_location} onChange={e => setEquipForm(f => ({ ...f, current_location: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Condition</label>
                  <select value={equipForm.asset_condition} onChange={e => setEquipForm(f => ({ ...f, asset_condition: e.target.value }))}>
                    {['Good','Fair','Damaged','Disposed'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Remarks</label>
                  <input value={equipForm.remarks} onChange={e => setEquipForm(f => ({ ...f, remarks: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Equipment'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEquipModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
