import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const columns = [
  { key: 'tag', label: 'TAG' },
  { key: 'description', label: 'Descrição' },
  { key: 'sector', label: 'Setor' },
  { key: 'type', label: 'Tipo' },
  { key: 'operationalStatus', label: 'Status Oper.' },
  { key: 'calibrationStatus', label: 'Status Calib.' },
  { key: 'nextCalibrationDate', label: 'Próxima Calib.' },
];

const statusColors = {
  ok: 'bg-green-100 text-green-800',
  attention: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

const operationalLabels = {
  ativo: 'Ativo',
  desativado: 'Desativado',
  backup: 'Backup',
};

export default function InstrumentsPage() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCalStatus, setFilterCalStatus] = useState('');
  const [filterOpStatus, setFilterOpStatus] = useState('');

  const fetchInstruments = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterCalStatus) params.calibrationStatus = filterCalStatus;
    if (filterOpStatus) params.operationalStatus = filterOpStatus;

    api.get('/instruments', { params })
      .then(res => setInstruments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInstruments();
    // eslint-disable-next-line
  }, [search, filterCalStatus, filterOpStatus]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Instrumentos</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por TAG ou descrição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-64"
        />
        <select
          value={filterCalStatus}
          onChange={e => setFilterCalStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="">Todos status calib.</option>
          <option value="ok">Em dia</option>
          <option value="attention">Atenção</option>
          <option value="overdue">Vencido</option>
        </select>
        <select
          value={filterOpStatus}
          onChange={e => setFilterOpStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="">Todos status oper.</option>
          <option value="ativo">Ativo</option>
          <option value="desativado">Desativado</option>
          <option value="backup">Backup</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-6 py-3 font-semibold text-slate-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-400">Carregando...</td></tr>
            )}
            {!loading && instruments.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-400">Nenhum instrumento encontrado.</td></tr>
            )}
            {!loading && instruments.map(instr => (
              <tr key={instr._id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"onClick={() => navigate(`/instruments/${instr._id}`)}>
                <td className="px-6 py-4 font-medium text-slate-800">{instr.tag}</td>
                <td className="px-6 py-4">{instr.description || '-'}</td>
                <td className="px-6 py-4">{instr.sector || '-'}</td>
                <td className="px-6 py-4">{instr.type || '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {operationalLabels[instr.operationalStatus] || instr.operationalStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[instr.calibrationStatus] || 'bg-slate-100 text-slate-700'}`}>
                    {instr.calibrationStatus === 'ok' ? 'Em dia' :
                     instr.calibrationStatus === 'attention' ? 'Atenção' :
                     instr.calibrationStatus === 'overdue' ? 'Vencido' : instr.calibrationStatus}
                  </span>
                </td>
                <td className="px-6 py-4">{formatDate(instr.nextCalibrationDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}