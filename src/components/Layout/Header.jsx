import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-12 bg-dark-800 border-b border-dark-600 flex items-center px-4 flex-shrink-0">
      <div className="text-sm font-semibold text-accent-blue tracking-tight">Calibra<span className="text-white">AI</span></div>
      <div className="w-px h-5 bg-dark-600 mx-3" />
      <div className="text-xs text-dark-400">Planta São Paulo</div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="text-dark-400 text-sm cursor-pointer">🔔</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full text-[10px] flex items-center justify-center font-bold">5</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent-blue-dark flex items-center justify-center text-xs font-bold text-blue-100">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button onClick={logout} className="text-dark-400 hover:text-white text-xs">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}