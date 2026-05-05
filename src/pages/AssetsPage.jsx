import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import InstrumentForm from '../components/Instruments/InstrumentForm';
import ImportModal from '../components/Instruments/ImportModal';
import EditInstrumentModal from '../components/Instruments/EditInstrumentModal';

export default function AssetsPage() {
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
      const res = await api.get('/instruments'); // sem filtro, traz todos (ativos e inativos)
      setInstruments(res.data);
    } catch (err) {
      console.error(err);
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
      alert('Erro ao excluir');
    }
  };

  const getFilteredInstruments = () => {
    let filtered = [...instruments];
    if (filterTag) filtered = filtered.filter(i => i.tag.toLowerCase().includes(filterTag.toLowerCase()));
    if (filterDescription) filtered = filtered.filter(i => i.description.toLowerCase().includes(filterDescription.toLowerCase()));
    if (filterSector) filtered = filtered.filter(i => (i.sector || '').toLowerCase().includes(filterSector.toLowerCase()));
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
    setFilterTag(''); setFilterDescription(''); setFilterSector('');
    setFilterStatus(''); setFilterType('');
  };

  if (loading) return <div className="p-4 text-dark-400">Carregando...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Ativos</h2>
          <p className="text-xs text-dark-400">{instruments.length} ativos cadastrados</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <button onClick={() => setShowNewInstrument(true)} className="px-3 py-1.5 bg-accent-blue-dark text-blue-100 rounded text-xs hover:bg-accent-blue">
                ➕ Novo
              </button>
              <button onClick={() => setShowImport(true)} className="px-3 py-1.5 bg-emerald-700 text-emerald-100 rounded text-xs hover:bg-emerald-600">
                📥 Importar
              </button>
            </>
          )}
        </div>
      </div>

      <button onClick={() => setShowFilters(!showFilters)} className="text-xs text-accent-blue hover:underline mb-2">
        {showFilters ? '🔽 Ocultar filtros' : '🔍 Filtros'}
      </button>
      {showFilters && (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-2 mb-2 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <input placeholder="TAG..." value={filterTag} onChange={e => setFilterTag(e.target.value)} className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
          <input placeholder="Descrição..." value={filterDescription} onChange={e => setFilterDescription(e.target.value)} className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
          <input placeholder="Setor..." value={filterSector} onChange={e => setFilterSector(e.target.value)} className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-white">
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="desativado">Desativado</option>
            <option value="backup">Backup</option>
            <option value="manutencao">Manutenção</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-white">
            <option value="">Todos os tipos</option>
            <option value="equipamento">Equipamento</option>
            <option value="instrumento">Instrumento</option>
            <option value="utensilio">Utensílio</option>
          </select>
          <button onClick={clearFilters} className="text-accent-red hover:underline">Limpar</button>
        </div>
      )}

      <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-dark-700 text-dark-400 uppercase tracking-wider">
              <th className="cursor-pointer px-3 py-2 text-left" onClick={() => { setSortField('tag'); setSortOrder(v => v === 'asc' ? 'desc' : 'asc'); }}>
                TAG {sortField === 'tag' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="cursor-pointer px-3 py-2 text-left" onClick={() => { setSortField('description'); setSortOrder(v => v === 'asc' ? 'desc' : 'asc'); }}>
                Descrição
              </th>
              <th className="cursor-pointer px-3 py-2 text-left" onClick={() => { setSortField('sector'); setSortOrder(v => v === 'asc' ? 'desc' : 'asc'); }}>
                Setor
              </th>
              <th className="cursor-pointer px-3 py-2 text-left" onClick={() => { setSortField('type'); setSortOrder(v => v === 'asc' ? 'desc' : 'asc'); }}>
                Tipo
              </th>
              <th className="cursor-pointer px-3 py-2 text-left" onClick={() => { setSortField('operationalStatus'); setSortOrder(v => v === 'asc' ? 'desc' : 'asc'); }}>
                Status
              </th>
              {showActions && <th className="px-3 py-2 text-left">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {getFilteredInstruments().length === 0 ? (
              <tr><td colSpan={colSpan} className="text-center py-8 text-dark-400">Nenhum ativo encontrado</td></tr>
            ) : (
              getFilteredInstruments().map(instrument => (
                <tr key={instrument._id} className="border-t border-dark-600 hover:bg-dark-700">
                  <td className="px-3 py-1.5 font-mono text-white font-bold cursor-pointer hover:underline">{instrument.tag}</td>
                  <td className="px-3 py-1.5 text-dark-300">{instrument.description}</td>
                  <td className="px-3 py-1.5 text-dark-400">{instrument.sector || '-'}</td>
                  <td className="px-3 py-1.5 text-dark-400 capitalize">{instrument.type}</td>
                  <td className="px-3 py-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      instrument.operationalStatus === 'ativo' ? 'bg-green-900 text-green-300' :
                      instrument.operationalStatus === 'desativado' ? 'bg-gray-700 text-gray-400' :
                      instrument.operationalStatus === 'backup' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {instrument.operationalStatus === 'manutencao' ? 'Manutenção' : (instrument.operationalStatus || 'ativo').charAt(0).toUpperCase() + (instrument.operationalStatus || 'ativo').slice(1)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-3 py-1.5">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingInstrument(instrument)} className="text-accent-blue hover:text-blue-300">✏️</button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(instrument._id, instrument.tag)} className="text-accent-red hover:text-red-400">🗑️</button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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