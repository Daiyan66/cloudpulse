import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Clock, Plus, RefreshCw } from 'lucide-react';
import { useMonitors } from '../hooks/useMonitors';
import MonitorCard from '../components/monitors/MonitorCard';
import StatCard from '../components/ui/StatCard';

export default function DashboardPage() {
  const { monitors, loading, error, refetch, deleteMonitor, toggleMonitor } = useMonitors();
  const navigate = useNavigate();

  const upCount   = monitors.filter((m) => m.isActive && m.isUp === true).length;
  const downCount = monitors.filter((m) => m.isActive && m.isUp === false).length;
  const avgUptime = monitors.length
    ? (monitors.reduce((acc, m) => acc + (m.uptimePercentage ?? 0), 0) / monitors.length).toFixed(1)
    : null;
  const avgResponse = monitors.filter((m) => m.lastResponseTimeMs != null).length
    ? Math.round(monitors.filter((m) => m.lastResponseTimeMs != null)
        .reduce((acc, m) => acc + m.lastResponseTimeMs, 0) /
        monitors.filter((m) => m.lastResponseTimeMs != null).length)
    : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading monitors…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            {monitors.length} monitor{monitors.length !== 1 ? 's' : ''} · Auto-refreshes every 30s
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={refetch} title="Refresh">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => navigate('/monitors/new')}>
            <Plus size={16} /> Add Monitor
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={<Activity size={22} />} label="Total Monitors" value={monitors.length} subValue="Across all checks" color="#6366f1" />
        <StatCard icon={<CheckCircle size={22} />} label="Operational"   value={upCount}   subValue={`${monitors.filter(m=>m.isActive).length - upCount} paused/down`} color="#22c55e" />
        <StatCard icon={<XCircle size={22} />}    label="Down Now"       value={downCount} subValue="Needs attention" color="#ef4444" />
        <StatCard icon={<Clock size={22} />}       label="Avg Uptime"    value={avgUptime != null ? `${avgUptime}%` : '—'} subValue={avgResponse != null ? `${avgResponse}ms avg response` : 'No data yet'} color="#06b6d4" />
      </div>

      {/* Monitors grid */}
      {monitors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
          <h2 style={{ fontWeight: 700, margin: '0 0 0.5rem' }}>No monitors yet</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem', fontSize: '0.875rem' }}>
            Add your first URL to start monitoring uptime and response times.
          </p>
          <button className="btn-primary" onClick={() => navigate('/monitors/new')}>
            <Plus size={16} /> Add Your First Monitor
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {monitors.map((monitor) => (
            <MonitorCard
              key={monitor.id}
              monitor={monitor}
              onDelete={deleteMonitor}
              onToggle={toggleMonitor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
