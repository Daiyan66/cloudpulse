import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { monitorService } from '../services/api';
import { useMonitors } from '../hooks/useMonitors';
import StatusBadge from '../components/monitors/StatusBadge';

export default function AnalyticsPage() {
  const { monitors } = useMonitors();
  const [selectedId, setSelectedId] = useState('');
  const [history, setHistory]       = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    if (monitors.length && !selectedId) {
      setSelectedId(monitors[0].id);
    }
  }, [monitors, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingChart(true);
    monitorService.getPingHistory(selectedId, { limit: 200 })
      .then((res) => {
        const raw = [...res.data.data].reverse();
        setHistory(raw.map((p) => ({
          time: new Date(p.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          responseTime: p.responseTimeMs,
          status: p.isUp ? 1 : 0,
        })));
      })
      .catch(() => setHistory([]))
      .finally(() => setLoadingChart(false));
  }, [selectedId]);

  // Summary table data
  const summaryData = monitors.map((m) => ({
    name: m.name,
    uptime: m.uptimePercentage,
    response: m.lastResponseTimeMs,
    status: m.isUp,
  }));

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.375rem' }}>Analytics</h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 2rem', fontSize: '0.875rem' }}>
        Historical performance data for your monitors.
      </p>

      {monitors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Add monitors on the Dashboard to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Monitor selector */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select Monitor</label>
            <select
              className="input-field"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ maxWidth: 400 }}
            >
              {monitors.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.url}</option>
              ))}
            </select>
          </div>

          {/* Response time line chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>Response Time Trend (last 200 checks)</h2>
            {loadingChart ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} unit="ms" />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.8125rem' }} />
                  <Line type="monotone" dataKey="responseTime" stroke="#6366f1" strokeWidth={2} dot={false} name="Response (ms)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status bar chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1.25rem' }}>Uptime vs Downtime (sampled)</h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={history.slice(-50)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} interval={9} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} domain={[0, 1]} ticks={[0, 1]} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.8125rem' }} />
                <Bar dataKey="status" name="Status (1=Up)" fill="#22c55e" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary table */}
          <div className="card">
            <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>All Monitors Summary</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Monitor', 'Status', 'Uptime (24h)', 'Last Response'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((row) => (
                    <tr key={row.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}><StatusBadge isUp={row.status} /></td>
                      <td style={{ padding: '0.625rem 0.75rem', color: row.uptime >= 99 ? '#22c55e' : row.uptime >= 95 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                        {row.uptime != null ? `${row.uptime}%` : '—'}
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem', color: '#06b6d4', fontWeight: 600 }}>
                        {row.response != null ? `${row.response}ms` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
