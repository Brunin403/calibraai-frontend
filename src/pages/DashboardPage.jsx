import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  };

  // Dados mockados enquanto o backend não responde com dados reais
  const mockSummary = {
    total: 0,
    ok: 0,
    attention: 0,
    overdue: 0,
    conformity: 0,
    alerts: [],
  };

  const data = summary || mockSummary;

  return (
    <div className="p-6 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
        <p className="text-sm text-dark-400 mt-1">Planta São Paulo · atualizado agora</p>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="text-xs text-dark-400 uppercase tracking-wide mb-2">Em dia</div>
          <div className="text-3xl font-bold text-accent-green">{data.ok}</div>
          <div className="text-xs text-dark-400 mt-1">{data.ok} instrumentos</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="text-xs text-dark-400 uppercase tracking-wide mb-2">Atenção</div>
          <div className="text-3xl font-bold text-accent-amber">{data.attention}</div>
          <div className="text-xs text-dark-400 mt-1">{data.attention} instrumentos</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="text-xs text-dark-400 uppercase tracking-wide mb-2">Vencidos</div>
          <div className="text-3xl font-bold text-accent-red">{data.overdue}</div>
          <div className="text-xs text-dark-400 mt-1">{data.overdue} instrumentos</div>
        </div>
      </div>

      {/* Gráfico e alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Distribuição por Criticidade</h3>
          <div className="flex items-center justify-center h-32">
            {/* Gráfico placeholder */}
            <div className="text-dark-400 text-sm">Gráfico em breve</div>
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Alertas Críticos</h3>
          <div className="space-y-3">
            
            {data.alerts.length === 0 ? (
              <p className="text-dark-400 text-sm">Nenhum alerta no momento.</p>
            ) : (
              data.alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${alert.type === 'vencido' ? 'bg-accent-red' : 'bg-accent-amber'}`} />
                  <span className="text-dark-300">{alert.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}