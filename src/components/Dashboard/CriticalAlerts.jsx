import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function CriticalAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/alerts')
      .then(res => setAlerts(res.data))
      .catch(err => console.error('Erro ao carregar alertas:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400 p-4">Carregando alertas...</p>;

  const statusBadge = (status) => {
    if (status === 'overdue') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Vencido</span>;
    if (status === 'attention') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Atenção</span>;
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Alertas Críticos</h4>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum alerta no momento.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {alerts.map((item) => (
            <li key={item._id} className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.tag}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(item.status)}
                <span className="text-xs text-slate-400">{formatDate(item.nextCalibrationDate)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}