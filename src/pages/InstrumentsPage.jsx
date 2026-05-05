import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import InstrumentForm from '../components/Instruments/InstrumentForm';
import ImportModal from '../components/Instruments/ImportModal';
import EditInstrumentModal from '../components/Instruments/EditInstrumentModal';

export default function InstrumentsPage() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [showNewInstrument, setShowNewInstrument] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);

  const [filterTag, setFilterTag] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [sortField, setSortField] = useState('tag');
  const [sortOrder, setSortOrder] = useState('asc');

  const showActions = user?.role === 'admin' || user?.role === 'analyst';
  const colSpan = showActions ? 6 : 5;

  useEffect(() => { loadInstruments(); }, []);

  const loadInstruments = async () => {
    try {
      const res = await api.get('/instruments');
      setInstruments(res.data);
    } catch (err) {
      console.error('Erro ao carregar instrumentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstrumentCreated = (newInstrument) => {
    setInstruments(prev => [newInstrument, ...prev]);
    setShowNewInstrument(false);
  };

  const handleImportComplete = () => { loadInstruments(); };

  const handleInstrumentUpdated = (updated) => {
    setInstruments(prev => prev.map(i => i._id === updated._id ? updated : i));
  };

  const handleDelete = async (id, tag) => {
    if (!window.confirm(`Excluir ${tag}?`)) return;
    const reason = prompt('Motivo da exclusão (opcional):') || 'Não informado';
    try {
      await api.delete(`/instruments/${id}`, { data: { reason } });
      setInstruments(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.error || err.message));
    }
  };

  const getFilteredInstruments = () => {
    let filtered = [...instruments];
    if (filterTag) filtered = filtered.filter(i => i.tag.toLowerCase().includes(filterTag.toLowerCase()));
    if (filterDescription) filtered = filtered.filter(i => i.description.toLowerCase().includes(filterDescription.toLowerCase()));
    if (filterSector) filtered = filtered.filter(i => (i.sector || i.location || '').toLowerCase().includes(filterSector.toLowerCase()));
    if (filterStatus) filtered = filtered.filter(i => i.operationalStatus === filterStatus);
    if (filterType) filtered = filtered.filter(i => i.type === filterType);

    filtered.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    return filtered;
  };

  const clearFilters = () => {
    setFilterTag('');
    setFilterDescription('');
    setFilterSector('');
    setFilterStatus('');
    setFilterType('');
  };

  if (loading) return <div className="p-4 text-gray-500">Carregando...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Instrumentos</h2>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <button onClick={() => setShowNewInstrument(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                ➕ Novo
              </button>
              <button onClick={() => setShowImport(true)} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                📥 Importar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros compactos */}
      <button onClick={() => setShowFilters(!showFilters)} className="mb-2 text-sm text-blue-600 hover:underline">
        {showFilters ? '🔽 Ocultar filtros' : '🔍 Filtros'}
      </button>
      {showFilters && (
        <div className="bg-white border rounded-lg p-2 mb-2 grid grid-cols-2 md:grid-cols-5 gap-2">
          <input placeholder="TAG..." value={filterTag} onChange={e => setFilterTag(e.target.value)} className="px-2 py-1 border rounded text-sm" />
          <input placeholder="Descrição..." value={filterDescription} onChange={e => setFilterDescription(e.target.value)} className="px-2 py-1 border rounded text-sm" />
          <input placeholder="Setor..." value={filterSector} onChange={e => setFilterSector(e.target.value)} className="px-2 py-1 border rounded text-sm" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-2 py-1 border rounded text-sm">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="desativado">Desativado</option>
            <option value="backup">Backup</option>
            <option value="manutencao">Manutenção</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-2 py-1 border rounded text-sm">
            <option value="">Todos os tipos</option>
            <option value="equipamento">Equipamento</option>
            <option value="instrumento">Instrumento</option>
            <option value="utensilio">Utensílio</option>
          </select>
          <button onClick={clearFilters} className="text-xs text-red-600 hover:underline">Limpar</button>
        </div>
      )}

      {/* Tabela compacta */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-600">
              <th className="cursor-pointer px-3 py-1.5 font-medium" onClick={() => { setSortField('tag'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                TAG {sortField === 'tag' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="cursor-pointer px-3 py-1.5 font-medium" onClick={() => { setSortField('description'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                Descrição {sortField === 'description' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="cursor-pointer px-3 py-1.5 font-medium" onClick={() => { setSortField('sector'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                Setor {sortField === 'sector' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="cursor-pointer px-3 py-1.5 font-medium" onClick={() => { setSortField('type'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                Tipo {sortField === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="cursor-pointer px-3 py-1.5 font-medium" onClick={() => { setSortField('operationalStatus'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                Status {sortField === 'operationalStatus' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              {showActions && <th className="px-3 py-1.5 font-medium">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {getFilteredInstruments().length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-6 text-gray-400">Nenhum instrumento encontrado</td>
              </tr>
            ) : (
              getFilteredInstruments().map(instrument => (
                <tr key={instrument._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-1 font-mono text-xs whitespace-nowrap">{instrument.tag}</td>
                  <td className="px-3 py-1 text-xs">{instrument.description}</td>
                  <td className="px-3 py-1 text-xs">{instrument.sector || instrument.location || '-'}</td>
                  <td className="px-3 py-1 text-xs capitalize">{instrument.type}</td>
                  <td className="px-3 py-1">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      instrument.operationalStatus === 'ativo' ? 'bg-green-100 text-green-700' :
                      instrument.operationalStatus === 'desativado' ? 'bg-gray-200 text-gray-600' :
                      instrument.operationalStatus === 'backup' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {instrument.operationalStatus === 'manutencao' ? 'Manutenção' : (instrument.operationalStatus || 'ativo').charAt(0).toUpperCase() + (instrument.operationalStatus || 'ativo').slice(1)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-3 py-1">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingInstrument(instrument)} className="text-blue-600 hover:text-blue-800 text-xs">✏️</button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(instrument._id, instrument.tag)} className="text-red-500 hover:text-red-700 text-xs">🗑️</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNewInstrument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4">
            <InstrumentForm onInstrumentCreated={handleInstrumentCreated} onClose={() => setShowNewInstrument(false)} />
          </div>
        </div>
      )}

      {editingInstrument && (
        <EditInstrumentModal instrument={editingInstrument} onClose={() => setEditingInstrument(null)} onUpdated={handleInstrumentUpdated} />
      )}

      <ImportModal isOpen={showImport} onClose={() => setShowImport(false)} onImportComplete={handleImportComplete} />
    </div>
  );
}