import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', head: '' });

  const fetch = async () => {
    try {
      const { data } = await API.get('/departments');
      setDepartments(data);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditDept(null); setForm({ name: '', description: '', head: '' }); setShowModal(true); };
  const openEdit = (d) => { setEditDept(d); setForm({ name: d.name, description: d.description || '', head: d.head || '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Department name is required');
    try {
      if (editDept) { await API.put(`/departments/${editDept._id}`, form); toast.success('Department updated!'); }
      else { await API.post('/departments', form); toast.success('Department created!'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try { await API.delete(`/departments/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const colors = ['#4f8ef7', '#7c4dff', '#00d4aa', '#ffd166', '#ff4d6d', '#06d6a0', '#f77f00'];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Departments</div>
          <div className="page-subtitle">Manage company departments</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ New Department</button>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
        departments.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-state-icon">🏢</div><p>No departments yet. Create your first one!</p></div></div>
        ) : (
          <div className="grid-3">
            {departments.map((d, i) => (
              <div key={d._id} className="card" style={{ borderTop: `3px solid ${colors[i % colors.length]}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${colors[i % colors.length]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏢</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-icon" onClick={() => openEdit(d)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(d._id, d.name)} style={{ color: '#ff4d6d' }}>🗑️</button>
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: '#e8edf8', marginBottom: '6px' }}>{d.name}</div>
                {d.description && <div style={{ fontSize: '12.5px', color: '#8a9bc0', marginBottom: '12px' }}>{d.description}</div>}
                {d.head && <div style={{ fontSize: '12px', color: '#5a6a8a' }}>👤 Head: <span style={{ color: '#8a9bc0' }}>{d.head}</span></div>}
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1e2a42', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '700', color: colors[i % colors.length] }}>{d.employeeCount || 0}</span>
                  <span style={{ fontSize: '12px', color: '#5a6a8a' }}>employee{d.employeeCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editDept ? '✏️ Edit Department' : '➕ New Department'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input className="form-input" placeholder="e.g. Engineering" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Department Head</label>
                <input className="form-input" placeholder="Manager name" value={form.head} onChange={e => setForm({ ...form, head: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editDept ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
