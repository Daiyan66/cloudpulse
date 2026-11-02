export default function StatCard({ icon, label, value, subValue, color = '#6366f1', gradient }) {
  return (
    <div className="card animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Gradient accent */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: gradient || `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        borderRadius: '0 12px 0 80px',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem', fontWeight: 500 }}>
            {label}
          </p>
          <p style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color, lineHeight: 1 }}>
            {value}
          </p>
          {subValue && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0.375rem 0 0' }}>
              {subValue}
            </p>
          )}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
