import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          background: 'var(--color-bg-base)',
          padding: '2rem',
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
