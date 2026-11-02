import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Shield, Key } from 'lucide-react';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
          <Icon size={16} />
        </div>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (e) => setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    try {
      // Endpoint to be wired in future — for now shows the pattern
      await authService.updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.375rem' }}>Settings</h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 2rem', fontSize: '0.875rem' }}>
        Manage your account and security preferences.
      </p>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.0625rem' }}>{user?.name}</p>
            <p style={{ margin: '0.125rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{user?.email}</p>
          </div>
        </div>
      </Section>

      {/* Change password */}
      <Section icon={Lock} title="Change Password">
        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Current Password', name: 'currentPassword', id: 'cp-current' },
            { label: 'New Password',     name: 'newPassword',     id: 'cp-new' },
            { label: 'Confirm New Password', name: 'confirmPassword', id: 'cp-confirm' },
          ].map(({ label, name, id }) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>{label}</label>
              <input className="input-field" id={id} type="password" name={name} value={pwForm[name]} onChange={handlePwChange} placeholder="••••••••" required={name === 'currentPassword'} />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Security info */}
      <Section icon={Shield} title="Security">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'JWT Auth',         value: 'Active',       color: '#22c55e' },
            { label: 'Password Hashing', value: 'bcrypt (12 rounds)', color: '#22c55e' },
            { label: 'Rate Limiting',    value: '200 req / 15min API | 20 req auth', color: '#22c55e' },
            { label: 'CORS',             value: 'Configured', color: '#22c55e' },
            { label: 'Security Headers', value: 'Helmet.js',  color: '#22c55e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{label}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <Section icon={Key} title="Danger Zone">
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Logging out will invalidate your current session token.
        </p>
        <button className="btn-ghost" onClick={logout} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
          Sign Out of All Sessions
        </button>
      </Section>
    </div>
  );
}
