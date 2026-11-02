import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to CloudPulse 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, var(--color-bg-base) 70%)',
      padding: '1.5rem',
    }}>
      <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: '2.5rem', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>
            Cloud<span className="text-gradient">Pulse</span>
          </span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Create account</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.75rem', fontSize: '0.875rem' }}>
          Start monitoring your services for free
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Full Name', name: 'name', type: 'text',     id: 'reg-name',    placeholder: 'John Doe',          autoComplete: 'name' },
            { label: 'Email',     name: 'email',type: 'email',    id: 'reg-email',   placeholder: 'you@example.com',   autoComplete: 'email' },
            { label: 'Password',  name: 'password', type: 'password', id: 'reg-password', placeholder: 'Min 8 chars', autoComplete: 'new-password' },
            { label: 'Confirm Password', name: 'confirmPassword', type: 'password', id: 'reg-confirm', placeholder: '••••••••', autoComplete: 'new-password' },
          ].map(({ label, name, type, id, placeholder, autoComplete }) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</label>
              <input
                className="input-field"
                id={id}
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                autoComplete={autoComplete}
              />
            </div>
          ))}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
