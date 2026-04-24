import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', employee: '', priority: 'Medium', status: 'Pending', dueDate: '' });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const [tasksRes, perfRes] = await Promise.all([
        API.get('/tasks', { params }),
        API.get('/tasks/stats/performers')
      ]);
      setTasks(tasksRes.data);
      setPerformers(perfRes.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    const { data } = await API.get('/employees');
    setEmployees(data);
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { fetchTasks(); }, [filterStatus]);

  const openAdd = () => {
    setEditTask(null);
    setForm({ title: '', description: '', employee: employees[0]?._id || '', priority: 'Medium', status: 'Pending', dueDate: '' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditTask(t);
    setForm({ title: t.title, description: t.description || '', employee: t.employee?._id || '', priority: t.priority, status: t.status, dueDate: t.dueDate || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.employee) return toast.error('Title and employee are required');
    try {
      if (editTask) { await API.put(`/tasks/${editTask._id}`, form); toast.success('Task updated!'); }
      else { await API.post('/tasks', form); toast.success('Task assigned!'); }
      setShowModal(false);
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving task'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await API.delete(`/tasks/${id}`); toast.success('Deleted'); fetchTasks(); }
    catch { toast.error('Failed to delete'); }
  };

  const quickStatus = async (id, status) => {
    try { await API.put(`/tasks/${id}`, { status }); fetchTasks(); }
    catch { toast.error('Failed to update'); }
  };

  const priorityBadge = (p) => {
    const map = { High: 'badge-red', Medium: 'badge-yellow', Low: 'badge-green' };
    return <span className={`badge ${map[p]}`}>{p}</span>;
  };

  const statusBadge = (s) => {
    const map = { Pending: 'badge-gray', 'In Progress': 'badge-blue', Completed: 'badge-green' };
    return <span className={`badge ${map[s]}`}>{s}</span>;
  };

  const isOverdue = (dueDate, status) => dueDate && status !== 'Completed' && new Date(dueDate) < new Date();

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks & Performance</div>
          <div className="page-subtitle">Assign tasks and track team performance</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Assign Task</button>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(138,155,192,0.12)' }}>📋</div>
          <div><div className="stat-label">Pending</div><div className="stat-value">{pending}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79,142,247,0.12)' }}>⚙️</div>
          <div><div className="stat-label">In Progress</div><div className="stat-value">{inProgress}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,214,160,0.12)' }}>✅</div>
          <div><div className="stat-label">Completed</div><div className="stat-value">{completed}</div></div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Tasks Table */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="filter-bar">
            {['', ...STATUSES].map(s => (
              <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilterStatus(s)}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="card">
            {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
              tasks.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">✅</div><p>No tasks found. Assign the first task!</p></div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {tasks.map(task => (
                        <tr key={task._id}>
                          <td>
                            <div className="td-name" style={{ maxWidth: '200px' }}>{task.title}</div>
                            {task.description && <div style={{ fontSize: '11px', color: '#5a6a8a', marginTop: '2px' }}>{task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}</div>}
                          </td>
                          <td>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#e8edf8' }}>{task.employee?.name || '—'}</div>
                            <div style={{ fontSize: '11px', color: '#5a6a8a' }}>{task.employee?.department?.name}</div>
                          </td>
                          <td>{priorityBadge(task.priority)}</td>
                          <td style={{ fontSize: '12px' }}>
                            {task.dueDate ? (
                              <span style={{ color: isOverdue(task.dueDate, task.status) ? '#ff4d6d' : '#8a9bc0' }}>
                                {isOverdue(task.dueDate, task.status) ? '⚠️ ' : ''}{task.dueDate}
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            <select value={task.status} onChange={e => quickStatus(task._id, e.target.value)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#8a9bc0', fontFamily: 'inherit' }}>
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn-icon" onClick={() => openEdit(task)}>✏️</button>
                              <button className="btn-icon" onClick={() => handleDelete(task._id)} style={{ color: '#ff4d6d' }}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>

        {/* Top Performers */}
        {performers.length > 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card">
              <h3 style={{ marginBottom: '18px', fontSize: '15px', fontWeight: '600' }}>🏆 Performance Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {performers.slice(0, 8).map((p, i) => (
                  <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', background: '#161b2a', borderRadius: '8px', border: '1px solid #1e2a42' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: i === 0 ? '#ffd166' : '#5a6a8a', width: '24px' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </div>
                    <div style={{ flex: 1, fontWeight: '600', fontSize: '13px', color: '#e8edf8' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#8a9bc0' }}>{p.completed}/{p.total} tasks</div>
                    <div style={{ width: '120px' }}>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${p.rate}%`, background: p.rate >= 75 ? '#06d6a0' : p.rate >= 50 ? '#ffd166' : '#ff4d6d' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', minWidth: '40px' }}>{Math.round(p.rate)}%</div>
                    <span className={`badge ${p.rate >= 75 ? 'badge-green' : p.rate >= 50 ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '11px' }}>
                      {p.rate >= 75 ? 'High Performer' : p.rate >= 50 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editTask ? '✏️ Edit Task' : '➕ Assign New Task'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input className="form-input" placeholder="e.g. Complete Q3 Report" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" placeholder="Task details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To *</label>
                <select className="form-select" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Assign Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
