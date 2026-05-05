import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-56 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-700">
        <h2 className="text-lg font-bold">📐 CalibraAi</h2>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <NavItem to="/dashboard" icon="📊" label="Dashboard" />
        <NavItem to="/instruments" icon="🔧" label="Instrumentos" />
        
        {(user?.role === 'admin' || user?.role === 'analyst') && (
          <NavItem to="/calibrations" icon="📋" label="Calibração" />
        )}
        
        {/* Futuras páginas:
        <NavItem to="/reports" icon="📈" label="Relatórios" />
        {user?.role === 'admin' && (
          <NavItem to="/settings" icon="⚙️" label="Configurações" />
        )}
        */}
      </nav>
      <div className="p-3 border-t border-slate-700 text-xs text-slate-500">
        v1.0.0
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <span>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}