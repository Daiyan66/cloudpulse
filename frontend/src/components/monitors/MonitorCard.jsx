import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Trash2, ChevronRight, RefreshCw, PauseCircle, PlayCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function MonitorCard({ monitor, onDelete, onToggle }) {
  const navigate = useNavigate();
  const [deleting, setDeleting]  = useState(false);
  const [toggling, setToggling]  = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${monitor.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try { await onDelete(monitor.id, monitor.name); }
    finally { setDeleting(false); }
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    setToggling(true);
    try { await onToggle(monitor.id, !monitor.isActive); }
    finally { setToggling(false); }
  };

  const uptimeColor = monitor.uptimePercentage >= 99
    ? '#22c55e' : monitor.uptimePercentage >= 95
    ? '#f59e0b' : '#ef4444';

  return (
    <div
      className="card animate-fade-in"
      onClick={() => navigate(`/monitors/${monitor.id}`)}
      style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)';   e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(6,182,212,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Globe size={18} color="#6366f1" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {monitor.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {monitor.url}
            </p>
          </div>
        </div>
        <StatusBadge isUp={monitor.isActive ? monitor.isUp : null} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Uptime',     value: monitor.uptimePercentage != null ? `${monitor.uptimePercentage}%` : '—', color: uptimeColor },
          { label: 'Response',  value: monitor.lastResponseTimeMs != null ? `${monitor.lastResponseTimeMs}ms` : '—', color: 'var(--color-text-primary)' },
          { label: 'Status',    value: monitor.lastStatusCode ?? '—', color: 'var(--color-text-primary)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--color-bg-surface)', borderRadius: 8, padding: '0.625rem',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>{label}</p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          {monitor.lastCheckedAt
            ? `Last checked ${new Date(monitor.lastCheckedAt).toLocaleTimeString()}`
            : 'Not checked yet'}
          {' · '}{monitor.intervalSeconds}s interval
        </p>
        <div style={{ display: 'flex', gap: '0.375rem' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={monitor.isActive ? 'Pause' : 'Resume'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
          >
            {monitor.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete monitor"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
          >
            {deleting ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
          </button>
          <ChevronRight size={16} color="var(--color-text-muted)" style={{ alignSelf: 'center' }} />
        </div>
      </div>
    </div>
  );
}
