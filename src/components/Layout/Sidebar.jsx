import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/assets', icon: '🏷️', label: 'Ativos' },
  { to: '/instruments', icon: '🔧', label: 'Instrumentos' },
  { to: '/calibrations', icon: '📋', label: 'Calibração', roles: ['admin', 'analyst'] },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-14 bg-dark-800 border-r border-dark-600 flex flex-col items-center py-3 space-y-2 flex-shrink-0">
      <div className="text-accent-blue font-bold text-lg mb-4">C</div>
      {navItems.map(item => {
        if (item.roles && !item.roles.includes(user?.role)) return null;
        return (
          <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
        );
      })}
    </aside>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          isActive
            ? 'bg-accent-blue-dark text-blue-100'
            : 'text-dark-400 hover:bg-dark-700 hover:text-white'
        }`
      }
    >
      <span className="text-sm">{icon}</span>
    </NavLink>
  );
}