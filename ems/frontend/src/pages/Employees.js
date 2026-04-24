import { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['Manager', 'Staff', 'Intern'];

const perfBadge = (att, task) => {
  if (att >= 85 && task >= 75) return <span className="badge badge-green">⭐ High Performer</span>;
  if (att < 60 || task < 40) return <span className="badge badge-red">⚠️ Needs Improvement</span>;
  return <span className="badge badge-yellow">📊 Average</span>;
};

const roleBadge = (role) => {
  const map = { Manager: 'badge-purple', Staff: 'badge-blue', Intern: 'badge-gray' };
  return <span className={`badge ${map[role] || 'badge-gray'}`}>{role}</span>;
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [perfData, setPerfData] = useState({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', role: 'Staff', salary: '', joiningDate: '' });

  const fetchEmployees = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterDept) params.department = filterDept;
      if (filterRole) params.role = filterRole;
      const { data } = await API.get('/employees', { params });
      setEmployees(data);
      // Fetch performance for all
      const perfResults = await Promise.allSettled(data.map(e => API.get(`/employees/${e._id}/performance`)));
      const map = {};
      perfResults.forEach((r, i) => {
        if (r.status === 'fulfilled') map[data[i]._id] = r.value.data;
      });
      setPerfData(map);
    } catch { toast.error('Failed to fetch employees'); }
    finally { setLoading(false); }
  }, [search, filterDept, filterRole]);

  const fetchDepts = async () => {
    const { data } = await API.get('/departments');
    setDepartments(data);
  };

  useEffect(() => { fetchDepts(); }, []);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openAdd = () => {
    setEditEmp(null);
    setForm({ name: '', email: '', phone: '', department: departments[0]?._id || '', role: 'Staff', salary: '', joiningDate: '' });
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department?._id || emp.department, role: emp.role, salary: emp.salary, joiningDate: emp.joiningDate?.split('T')[0] });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.department || !form.salary || !form.joiningDate)
      return toast.error('Please fill all required fields');
    try {
      if (editEmp) {
        await API.put(`/employees/${editEmp._id}`, form);
        toast.success('Employee updated!');
      } else {
        await API.post('/employees', form);
        toast.success('Employee added!');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving employee'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/employees/${id}`);
      toast.success('Employee removed');
      fetchEmployees();
    } catch { toast.error('Failed to delete'); }
  };

  const alerts = employees.filter(e => {
    const p = perfData[e._id];
    return p && (p.attendancePct < 60 || p.taskPct < 40);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Employees</div>
          <div className="page-subtitle">{employees.length} total employees</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Employee</button>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
          ⚠️ <strong>{alerts.length} employee(s)</strong> have low attendance or task performance: {alerts.map(e => e.name).join(', ')}
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-input search-input" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto', minWidth: '160px' }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', minWidth: '130px' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
        {(search || filterDept || filterRole) && (
          <button className="btn btn-outline" onClick={() => { setSearch(''); setFilterDept(''); setFilterRole(''); }}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <div className="loading-wrap"><div className="spinner" /></div> : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>No employees found. Add your first employee!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Department</th><th>Role</th><th>Salary</th>
                  <th>Attendance</th><th>Performance</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const p = perfData[emp._id];
                  return (
                    <tr key={emp._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #7c4dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: 'white', flexShrink: 0 }}>
                            {emp.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="td-name">{emp.name}</div>
                            <div style={{ fontSize: '11px', color: '#5a6a8a' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department?.name || '—'}</td>
                      <td>{roleBadge(emp.role)}</td>
                      <td style={{ fontWeight: '600' }}>₹{Number(emp.salary).toLocaleString('en-IN')}</td>
                      <td>
                        {p ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="progress-bar" style={{ width: '60px' }}>
                              <div className="progress-fill" style={{ width: `${p.attendancePct}%`, background: p.attendancePct >= 75 ? '#06d6a0' : p.attendancePct >= 50 ? '#ffd166' : '#ff4d6d' }} />
                            </div>
                            <span style={{ fontSize: '12px' }}>{p.attendancePct}%</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td>{p ? perfBadge(p.attendancePct, p.taskPct) : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-icon" onClick={() => openEdit(emp)} title="Edit">✏️</button>
                          <button className="btn-icon" onClick={() => handleDelete(emp._id, emp.name)} title="Delete" style={{ color: '#ff4d6d' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{editEmp ? '✏️ Edit Employee' : '➕ Add New Employee'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-select" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary (₹) *</label>
                  <input className="form-input" type="number" placeholder="50000" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date *</label>
                  <input className="form-input" type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editEmp ? 'Save Changes' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
