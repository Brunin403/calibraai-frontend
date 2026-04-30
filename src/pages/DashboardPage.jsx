import { useEffect, useState } from 'react';
import api from '../services/api';
import StatusCards from '../components/Dashboard/StatusCards';
import Charts from '../components/Dashboard/Charts';
import CriticalAlerts from '../components/Dashboard/CriticalAlerts';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error('Erro ao carregar dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Carregando dashboard...</p>;
  if (!summary) return <p className="p-4 text-red-500">Erro ao carregar dados.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Visão Geral</h2>
      <StatusCards data={summary} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Charts data={summary} />
        <CriticalAlerts />
      </div>
    </div>
  );
}