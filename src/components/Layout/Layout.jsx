import { Outlet } from 'react-router-dom';  // ← precisa importar Outlet
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="ml-60 flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8 flex-1">
          <Outlet />   {/* ← ESSENCIAL: é aqui que o conteúdo das rotas filhas aparece */}
        </main>
      </div>
    </div>
  );
}