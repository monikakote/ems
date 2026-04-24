import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const TYPES = ['Sick', 'Casual', 'Annual', 'Other'];

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ employee: '', type: 'Casual', startDate: '', endDate: '', reason: '' });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const { data } = await API.get('/leaves', { params });
      setLeaves(data);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    const { data } = await API.get('/employees');
    setEmployees(data);
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { fetchLeaves(); }, [filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.startDate || !form.endDate || !form.reason) return toast.error('Fill all fields');
    try {
      await API.post('/leaves', form);
      toast.success('Leave request created!');
      setShowModal(false);
      setForm({ employee: '', type: 'Casual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating leave'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try { await API.delete(`/leaves/${id}`); toast.success('Deleted'); fetchLeaves(); }
    catch { toast.error('Failed to delete'); }
  };

  const statusBadge = (s) => {
    const map = { Pending: 'badge-yellow', Approved: 'badge-green', Rejected: 'badge-red' };
    return <span className={`badge ${map[s]}`}>{s}</span>;
  };

  const getDays = (start, end) => {
    const d = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return d > 0 ? d : 1;
  };

  const pending = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Leave Management</div>
          <div className="page-subtitle">{pending > 0 ? `${pending} pending approval` : 'All caught up!'}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Create Leave Request</button>
      </div>

      {pending > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
          📋 <strong>{pending} leave request(s)</strong> are awaiting your approval.
        </div>
      )}

      <div className="filter-bar">
        {['', 'Pending', 'Approved', 'Rejected'].map(s => (
          <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilterStatus(s)}>
            {s || 'All'} {s && `(${leaves.filter(l => l.status === s || !s).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
          leaves.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌿</div>
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employee</th><th>Type</th><th>Duration</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave._id}>
                      <td>
                        <div className="td-name">{leave.employee?.name || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#5a6a8a' }}>{leave.employee?.department?.name}</div>
                      </td>
                      <td><span className="badge badge-blue">{leave.type}</span></td>
                      <td style={{ fontSize: '12px', color: '#8a9bc0' }}>
                        {leave.startDate} → {leave.endDate}
                      </td>
                      <td style={{ fontWeight: '600' }}>{getDays(leave.startDate, leave.endDate)}d</td>
                      <td style={{ maxWidth: '160px', fontSize: '12.5px', color: '#8a9bc0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reason}
                      </td>
                      <td>{statusBadge(leave.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {leave.status === 'Pending' && (
                            <>
                              <button className="btn btn-sm" style={{ background: 'rgba(6,214,160,0.15)', color: '#06d6a0', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }} onClick={() => handleStatus(leave._id, 'Approved')}>✅</button>
                              <button className="btn btn-sm" style={{ background: 'rgba(255,77,109,0.15)', color: '#ff4d6d', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }} onClick={() => handleStatus(leave._id, 'Rejected')}>❌</button>
                            </>
                          )}
                          <button className="btn-icon" onClick={() => handleDelete(leave._id)} style={{ color: '#ff4d6d' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">🌿 Create Leave Request</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select className="form-select" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea className="form-input" rows="3" placeholder="Reason for leave..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
