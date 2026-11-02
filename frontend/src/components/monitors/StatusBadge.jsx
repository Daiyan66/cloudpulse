import { clsx } from 'clsx';

const STATUS = {
  up:      { label: 'Operational', dot: '#22c55e', badge: 'status-badge-up' },
  down:    { label: 'Down',        dot: '#ef4444', badge: 'status-badge-down' },
  unknown: { label: 'Pending',     dot: '#f59e0b', badge: 'status-badge-warn' },
};

export default function StatusBadge({ isUp }) {
  const key = isUp === true ? 'up' : isUp === false ? 'down' : 'unknown';
  const { label, dot, badge } = STATUS[key];

  return (
    <span className={clsx('status-badge', badge)}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: dot,
        display: 'inline-block',
        animation: key === 'up' ? 'pulse-scale 2s ease-in-out infinite' : 'none',
      }} />
      {label}
    </span>
  );
}
