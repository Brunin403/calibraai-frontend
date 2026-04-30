import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/instruments', label: 'Instrumentos', icon: '🔧' },
  { to: '/calibrations', label: 'Calibrações', icon: '📋' },
  { to: '/reports', label: 'Relatórios', icon: '📈' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col p-6 fixed top-0 left-0 bottom-0 z-10">
      <h2 className="text-xl font-bold mb-10 flex items-center gap-2">📐 CalibraAi</h2>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto text-xs text-slate-600">v1.0.0</div>
    </aside>
  );
}