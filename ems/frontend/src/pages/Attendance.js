import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [existing, setExisting] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyEmp, setHistoryEmp] = useState('');
  const [summary, setSummary] = useState(null);

  const fetchEmployees = async () => {
    const { data } = await API.get('/employees');
    setEmployees(data);
    const init = {};
    data.forEach(e => { init[e._id] = 'Absent'; });
    setAttendance(init);
  };

  const fetchForDate = async (d) => {
    setLoading(true);
    try {
      const { data } = await API.get('/attendance', { params: { date: d } });
      setExisting(data);
      const init = {};
      employees.forEach(e => { init[e._id] = 'Absent'; });
      data.forEach(r => { init[r.employee?._id] = r.status; });
      setAttendance(init);
    } catch { toast.error('Failed to fetch attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => { if (employees.length) fetchForDate(date); }, [date, employees.length]);

  const fetchSummary = async (empId) => {
    if (!empId) { setSummary(null); return; }
    try {
      const { data } = await API.get(`/attendance/summary/${empId}`);
      setSummary(data);
    } catch { toast.error('Failed to fetch summary'); }
  };

  useEffect(() => { fetchSummary(historyEmp); }, [historyEmp]);

  const handleMark = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([employeeId, status]) => ({ employeeId, status }));
      await API.post('/attendance/mark', { date, records });
      toast.success(`Attendance marked for ${date}`);
      fetchForDate(date);
    } catch { toast.error('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const toggleStatus = (id) => {
    const statuses = ['Present', 'Absent', 'Leave'];
    const cur = attendance[id] || 'Absent';
    const next = statuses[(statuses.indexOf(cur) + 1) % statuses.length];
    setAttendance({ ...attendance, [id]: next });
  };

  const statusBadge = (s) => {
    const map = { Present: 'badge-green', Absent: 'badge-red', Leave: 'badge-yellow' };
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
  };

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'Absent').length;
  const leaveCount = Object.values(attendance).filter(v => v === 'Leave').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Attendance Management</div>
          <div className="page-subtitle">Mark and track daily attendance</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          <button className="btn btn-primary" onClick={handleMark} disabled={saving || !employees.length}>
            {saving ? '⏳ Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,214,160,0.12)' }}>✅</div>
          <div><div className="stat-label">Present</div><div className="stat-value" style={{ color: '#06d6a0' }}>{presentCount}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,77,109,0.12)' }}>❌</div>
          <div><div className="stat-label">Absent</div><div className="stat-value" style={{ color: '#ff4d6d' }}>{absentCount}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,209,102,0.12)' }}>🌿</div>
          <div><div className="stat-label">On Leave</div><div className="stat-value" style={{ color: '#ffd166' }}>{leaveCount}</div></div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Mark Attendance */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>📋 Mark Attendance — {date}</h3>
          <p style={{ fontSize: '12px', color: '#5a6a8a', marginBottom: '14px' }}>Click on status badge to toggle: Present → Absent → Leave</p>
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> :
            employees.length === 0 ? <div className="empty-state"><p>No employees found</p></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
                {employees.map(emp => (
                  <div key={emp._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#161b2a', borderRadius: '8px', border: '1px solid #1e2a42' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #7c4dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
                        {emp.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e8edf8' }}>{emp.name}</div>
                        <div style={{ fontSize: '11px', color: '#5a6a8a' }}>{emp.department?.name}</div>
                      </div>
                    </div>
                    <button onClick={() => toggleStatus(emp._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      {statusBadge(attendance[emp._id] || 'Absent')}
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Attendance History */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '600' }}>📊 Attendance Summary</h3>
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select className="form-select" value={historyEmp} onChange={e => setHistoryEmp(e.target.value)}>
              <option value="">Choose an employee...</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          {summary && (
            <div>
              <div className="grid-2" style={{ marginBottom: '16px', gap: '10px' }}>
                {[
                  { label: 'Present', value: summary.present, color: '#06d6a0' },
                  { label: 'Absent', value: summary.absent, color: '#ff4d6d' },
                  { label: 'Leave', value: summary.leave, color: '#ffd166' },
                  { label: 'Attendance %', value: `${summary.percentage}%`, color: summary.percentage >= 75 ? '#06d6a0' : summary.percentage >= 50 ? '#ffd166' : '#ff4d6d' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px', background: '#161b2a', borderRadius: '8px', border: '1px solid #1e2a42', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '11px', color: '#5a6a8a', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {summary.percentage < 60 && (
                <div className="alert alert-danger">⚠️ Low attendance! Below 60% threshold.</div>
              )}
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {summary.records.slice(-20).reverse().map(r => (
                  <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2a42', fontSize: '13px' }}>
                    <span style={{ color: '#8a9bc0' }}>{r.date}</span>
                    {statusBadge(r.status)}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!historyEmp && (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon" style={{ fontSize: '32px' }}>📊</div>
              <p>Select an employee to view history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
