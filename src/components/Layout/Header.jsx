import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-5">
      <h3 className="text-lg font-semibold text-slate-800">CalibraAi</h3>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200" title="Notificações">
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <span className="text-sm text-slate-600">👤 {user?.name || 'Usuário'}</span>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Sair
        </button>
      </div>
    </header>
  );
}