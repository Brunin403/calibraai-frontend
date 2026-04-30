import { useState } from 'react';
import api from '../services/api';

export default function ReportsPage() {
  const [type, setType] = useState('instruments');
  const [format, setFormat] = useState('csv');
  const [filters, setFilters] = useState({
    calibrationStatus: '',
    criticity: '',
    operationalStatus: '',
    instrumentId: '',
    from: '',
    to: '',
  });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildParams = () => {
    const params = { format };
    if (type === 'instruments') {
      if (filters.calibrationStatus) params.calibrationStatus = filters.calibrationStatus;
      if (filters.criticity) params.criticity = filters.criticity;
      if (filters.operationalStatus) params.operationalStatus = filters.operationalStatus;
    } else {
      if (filters.instrumentId) params.instrumentId = filters.instrumentId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
    }
    return params;
  };

  const handleExport = async () => {
    const params = buildParams();
    try {
      const response = await api.get(`/reports/${type}`, {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao exportar:', err);
      alert('Erro ao gerar relatório');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Relatórios</h2>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        {/* Tipo de relatório */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Relatório</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="instruments">Instrumentos</option>
            <option value="calibrations">Calibrações</option>
          </select>
        </div>

        {/* Formato */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Formato</label>
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="csv">CSV (Excel)</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        {/* Filtros específicos */}
        {type === 'instruments' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Status Calibração</label>
              <select name="calibrationStatus" value={filters.calibrationStatus} onChange={handleFilterChange} className="border rounded-lg px-3 py-2 text-sm w-full">
                <option value="">Todos</option>
                <option value="ok">Em dia</option>
                <option value="attention">Atenção</option>
                <option value="overdue">Vencido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Criticidade</label>
              <select name="criticity" value={filters.criticity} onChange={handleFilterChange} className="border rounded-lg px-3 py-2 text-sm w-full">
                <option value="">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Status Operacional</label>
              <select name="operationalStatus" value={filters.operationalStatus} onChange={handleFilterChange} className="border rounded-lg px-3 py-2 text-sm w-full">
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="desativado">Desativado</option>
                <option value="backup">Backup</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Data Início</label>
              <input type="date" name="from" value={filters.from} onChange={handleFilterChange} className="border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Data Fim</label>
              <input type="date" name="to" value={filters.to} onChange={handleFilterChange} className="border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Instrumento (ID)</label>
              <input type="text" name="instrumentId" value={filters.instrumentId} onChange={handleFilterChange} placeholder="ID do instrumento" className="border rounded-lg px-3 py-2 text-sm w-full" />
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Exportar
        </button>
      </div>
    </div>
  );
}