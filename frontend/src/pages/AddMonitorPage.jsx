import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Clock, ArrowLeft } from 'lucide-react';
import { useMonitors } from '../hooks/useMonitors';
import toast from 'react-hot-toast';

const INTERVALS = [
  { label: '30 seconds', value: 30 },
  { label: '1 minute',   value: 60 },
  { label: '2 minutes',  value: 120 },
  { label: '5 minutes',  value: 300 },
  { label: '10 minutes', value: 600 },
  { label: '30 minutes', value: 1800 },
];

export default function AddMonitorPage() {
  const { createMonitor } = useMonitors();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', url: '', intervalSeconds: 60 });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'intervalSeconds' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.startsWith('http://') && !form.url.startsWith('https://')) {
      toast.error('URL must start with http:// or https://');
      return;
    }
    setLoading(true);
    try {
      await createMonitor(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create monitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 600 }}>
      <button className="btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.375rem' }}>Add Monitor</h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 2rem', fontSize: '0.875rem' }}>
        We'll check your URL at the specified interval and alert you if it goes down.
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Monitor name */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Monitor Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input className="input-field" id="monitor-name" name="name" value={form.name} onChange={handleChange}
            placeholder="My Website" required maxLength={100} />
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
            A friendly name to identify this monitor.
          </p>
        </div>

        {/* URL */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            URL <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Globe size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input-field" id="monitor-url" name="url" value={form.url} onChange={handleChange}
              placeholder="https://example.com" required style={{ paddingLeft: '2.25rem' }} />
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
            Must start with https:// or http://
          </p>
        </div>

        {/* Interval */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Check Interval
          </label>
          <div style={{ position: 'relative' }}>
            <Clock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <select
              className="input-field"
              id="monitor-interval"
              name="intervalSeconds"
              value={form.intervalSeconds}
              onChange={handleChange}
              style={{ paddingLeft: '2.25rem', appearance: 'none' }}
            >
              {INTERVALS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview box */}
        <div style={{ background: 'var(--color-bg-surface)', borderRadius: 8, padding: '1rem', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{form.name || 'My Monitor'}</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {form.url || 'https://your-url.com'} · every {INTERVALS.find(i => i.value === form.intervalSeconds)?.label}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating…' : '✅ Create Monitor'}
          </button>
        </div>
      </form>
    </div>
  );
}
