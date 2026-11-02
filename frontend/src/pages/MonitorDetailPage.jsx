import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { monitorService } from '../services/api';
import StatusBadge from '../components/monitors/StatusBadge';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.625rem 0.875rem' }}>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</p>
      <p style={{ margin: '0.25rem 0 0', fontWeight: 700, color: '#6366f1' }}>{payload[0].value}ms</p>
    </div>
  );
};

export default function MonitorDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [stats, setStats]       = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try {
      const [statsRes, histRes] = await Promise.all([
        monitorService.getById(id).then(() => monitorService.getAll()),
        monitorService.getPingHistory(id, { limit: 100 }),
      ]);
      // get stats from the dedicated endpoint
      const statsData = await fetch(`/api/monitors/${id}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cp_token')}` }
      }).then(r => r.json());

      setStats(statsData.data);
      const raw = histRes.data.data;
      // Prepare chart data (oldest first)
      setHistory(
        [...raw].reverse().map((p) => ({
          time: new Date(p.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          responseTime: p.responseTimeMs,
          isUp: p.isUp,
        }))
      );
    } catch (err) {
      toast.error('Failed to load monitor details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!stats) return null;

  const { monitor, stats: s } = stats;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{monitor.name}</h1>
            <StatusBadge isUp={monitor.isUp} />
          </div>
          <a href={monitor.url} target="_blank" rel="noreferrer"
            style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <ExternalLink size={14} /> {monitor.url}
          </a>
        </div>
        <button className="btn-ghost" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '7-Day Uptime', value: s?.uptimePercentage != null ? `${s.uptimePercentage}%` : '—', color: '#22c55e' },
          { label: 'Total Checks', value: s?.total ?? 0, color: '#6366f1' },
          { label: 'Avg Response', value: s?.avgResponseTimeMs != null ? `${s.avgResponseTimeMs}ms` : '—', color: '#06b6d4' },
          { label: 'Min Response', value: s?.minResponseTimeMs != null ? `${s.minResponseTimeMs}ms` : '—', color: '#8b5cf6' },
          { label: 'Max Response', value: s?.maxResponseTimeMs != null ? `${s.maxResponseTimeMs}ms` : '—', color: '#f59e0b' },
          { label: 'Down Events',  value: s?.downCount ?? 0, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', margin: '0 0 0.375rem', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Response time chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, margin: '0 0 1.25rem', fontSize: '1rem' }}>Response Time History</h2>
        {history.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No data yet — wait for the first check.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} unit="ms" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="responseTime" stroke="#6366f1" strokeWidth={2} fill="url(#rtGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent pings table */}
      <div className="card">
        <h2 style={{ fontWeight: 700, margin: '0 0 1rem', fontSize: '1rem' }}>Recent Checks</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Time', 'Status', 'HTTP Code', 'Response Time', 'Error'].map(col => (
                  <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0, 20).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.625rem 0.75rem', color: 'var(--color-text-secondary)' }}>{row.time}</td>
                  <td style={{ padding: '0.625rem 0.75rem' }}><StatusBadge isUp={row.isUp} /></td>
                  <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace' }}>—</td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#06b6d4', fontWeight: 600 }}>{row.responseTime}ms</td>
                  <td style={{ padding: '0.625rem 0.75rem', color: '#ef4444', fontSize: '0.75rem' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
