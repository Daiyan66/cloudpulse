import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Globe, ArrowRight } from 'lucide-react';
import { statusService } from '../services/api';

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStatus = () => {
    statusService.getPublic()
      .then((res) => {
        setData(res.data.data);
        setLastUpdated(new Date());
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load status');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 30000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (systemStatus) => {
    if (systemStatus === 'operational') {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
          padding: '1.25rem 1.5rem', borderRadius: '12px', color: '#22c55e'
        }}>
          <CheckCircle2 size={32} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>All Systems Operational</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              All monitored services are responding normally.
            </p>
          </div>
        </div>
      );
    }
    if (systemStatus === 'degraded') {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)',
          padding: '1.25rem 1.5rem', borderRadius: '12px', color: '#eab308'
        }}>
          <AlertTriangle size={32} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Partial System Degradation</h2>
            <p style={{ margin: '0.2rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              One or more services are experiencing disruptions.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '1.25rem 1.5rem', borderRadius: '12px', color: '#ef4444'
      }}>
        <XCircle size={32} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Major System Outage</h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Severe service disruptions detected across monitors.
          </p>
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Globe size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>CloudPulse</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Status Page</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
            <button onClick={fetchStatus} className="btn-ghost" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }} title="Refresh">
              <RefreshCw size={14} />
            </button>
            <Link to="/login" style={{ fontSize: '0.85rem', color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Global status banner */}
        <div style={{ marginBottom: '2rem' }}>
          {getStatusBadge(data?.systemStatus || 'operational')}
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Monitored Services</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0' }}>{data?.summary?.total ?? 0}</p>
          </div>
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Operational</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0', color: '#22c55e' }}>{data?.summary?.operationalCount ?? 0}</p>
          </div>
          <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Downtime Incidents</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0 0', color: data?.summary?.downCount > 0 ? '#ef4444' : 'var(--color-text-secondary)' }}>
              {data?.summary?.downCount ?? 0}
            </p>
          </div>
        </div>

        {/* Monitors listing */}
        <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Services</h3>

          {data?.monitors?.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>No public monitors configured.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data?.monitors?.map((m) => (
                <div key={m.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.name}</span>
                      <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{m.url}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {m.lastResponseTimeMs != null && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{m.lastResponseTimeMs}ms</span>
                      )}
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                        background: m.isUp ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: m.isUp ? '#22c55e' : '#ef4444',
                      }}>
                        {m.isUp ? 'Operational' : 'Disrupted'}
                      </span>
                    </div>
                  </div>

                  {/* 30-bar history sparkline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '4px', borderRadius: '6px' }}>
                    {m.recentPings?.slice(0, 30).reverse().map((p, idx) => (
                      <div
                        key={idx}
                        title={`Status: ${p.isUp ? 'UP' : 'DOWN'} | ${p.responseTimeMs}ms (${new Date(p.checkedAt).toLocaleTimeString()})`}
                        style={{
                          flex: 1,
                          height: '100%',
                          borderRadius: '2px',
                          background: p.isUp ? '#22c55e' : '#ef4444',
                          opacity: 0.85,
                        }}
                      />
                    ))}
                    {(!m.recentPings || m.recentPings.length === 0) && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>No history recorded yet</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                    <span>24 hours ago</span>
                    <span>{m.uptimePercentage != null ? `${m.uptimePercentage}% uptime` : '100%'}</span>
                    <span>Today</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
