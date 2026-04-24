import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#4f8ef7', '#7c4dff', '#00d4aa', '#ffd166', '#ff4d6d', '#06d6a0'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#161b2a', border: '1px solid #2a3a5c', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ color: '#8a9bc0', fontSize: '12px' }}>{label}</p>
        <p style={{ color: '#e8edf8', fontWeight: '600' }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, perfRes] = await Promise.all([
          API.get('/employees/stats/dashboard'),
          API.get('/tasks/stats/performers')
        ]);
        setStats(statsRes.data);
        setPerformers(perfRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  const deptData = (stats?.byDept || []).map(d => ({ name: d.name || 'Unknown', value: d.count }));
  const salaryData = (stats?.bySalary || []).map(d => ({ name: d.name || 'Unknown', salary: Math.round(d.avgSalary || 0) }));
  const attendanceData = [
    { name: 'Present Today', value: stats?.presentToday || 0 },
    { name: 'Absent Today', value: stats?.absentToday || 0 },
  ];
  const topPerformer = performers[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview of your organization at a glance</div>
        </div>
        <div style={{ fontSize: '13px', color: '#5a6a8a' }}>
          📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79,142,247,0.12)' }}>👥</div>
          <div>
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{stats?.total || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,214,160,0.12)' }}>✅</div>
          <div>
            <div className="stat-label">Present Today</div>
            <div className="stat-value">{stats?.presentToday || 0}</div>
            <div className="stat-sub" style={{ color: '#06d6a0' }}>Active today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,77,109,0.12)' }}>❌</div>
          <div>
            <div className="stat-label">Absent Today</div>
            <div className="stat-value">{stats?.absentToday || 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(124,77,255,0.12)' }}>🏢</div>
          <div>
            <div className="stat-label">Departments</div>
            <div className="stat-value">{deptData.length}</div>
          </div>
        </div>
      </div>

      {/* Top Performer Alert */}
      {topPerformer && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          🏆 <strong>Top Performer:</strong> {topPerformer.name} — {Math.round(topPerformer.rate)}% task completion rate ({topPerformer.completed}/{topPerformer.total} tasks)
        </div>
      )}

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '600' }}>Department Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: '#2a3a5c' }}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#161b2a', border: '1px solid #2a3a5c', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No department data yet</p></div>}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '600' }}>Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: '#2a3a5c' }}>
                <Cell fill="#06d6a0" />
                <Cell fill="#ff4d6d" />
              </Pie>
              <Tooltip contentStyle={{ background: '#161b2a', border: '1px solid #2a3a5c', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Salary Chart */}
      {salaryData.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '600' }}>Average Salary by Department (₹)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a42" />
              <XAxis dataKey="name" tick={{ fill: '#8a9bc0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8a9bc0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="salary" fill="#4f8ef7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Performers Table */}
      {performers.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '18px', fontSize: '15px', fontWeight: '600' }}>🏆 Performance Leaderboard</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Rank</th><th>Employee</th><th>Tasks Completed</th><th>Total Tasks</th><th>Completion Rate</th><th>Badge</th></tr>
              </thead>
              <tbody>
                {performers.slice(0, 5).map((p, i) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: '700', color: i === 0 ? '#ffd166' : i === 1 ? '#8a9bc0' : '#cd7f32' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td className="td-name">{p.name}</td>
                    <td>{p.completed}</td>
                    <td>{p.total}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${p.rate}%`, background: p.rate >= 75 ? '#06d6a0' : p.rate >= 50 ? '#ffd166' : '#ff4d6d' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '35px' }}>{Math.round(p.rate)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.rate >= 75 ? 'badge-green' : p.rate >= 50 ? 'badge-yellow' : 'badge-red'}`}>
                        {p.rate >= 75 ? '⭐ High Performer' : p.rate >= 50 ? '📊 Average' : '⚠️ Needs Work'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
