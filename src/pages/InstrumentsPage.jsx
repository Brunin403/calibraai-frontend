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

  // Estados para filtros cumulativos
  const [filterTag, setFilterTag] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  // Estados para ordenação
  const [sortField, setSortField] = useState('tag');
  const [sortOrder, setSortOrder] = useState('asc');

  // Determina se a coluna Ações deve ser exibida
  const showActions = user?.role === 'admin' || user?.role === 'analyst';
  const colSpan = showActions ? 6 : 5;

  useEffect(() => {
    loadInstruments();
  }, []);

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

  const handleImportComplete = () => {
    loadInstruments();
  };

  const handleInstrumentUpdated = (updatedInstrument) => {
    setInstruments(prev => prev.map(i => i._id === updatedInstrument._id ? updatedInstrument : i));
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

    if (filterTag) {
      filtered = filtered.filter(i =>
        i.tag.toLowerCase().includes(filterTag.toLowerCase())
      );
    }
    if (filterDescription) {
      filtered = filtered.filter(i =>
        i.description.toLowerCase().includes(filterDescription.toLowerCase())
      );
    }
    if (filterSector) {
      filtered = filtered.filter(i =>
        (i.sector || i.location || '').toLowerCase().includes(filterSector.toLowerCase())
      );
    }
    if (filterStatus) {
      filtered = filtered.filter(i => i.operationalStatus === filterStatus);
    }
    if (filterType) {
      filtered = filtered.filter(i => i.type === filterType);
    }

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

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando instrumentos...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Instrumentos</h2>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setShowNewInstrument(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                ➕ Novo Instrumento
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📥 Importar Excel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Botão para mostrar/esconder filtros */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
      >
        {showFilters ? '🔽 Ocultar filtros' : '🔍 Filtros'}
      </button>

      {/* Painel de filtros cumulativos */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Filtrar TAG..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Filtrar descrição..."
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Filtrar setor..."
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="desativado">Desativado</option>
            <option value="backup">Backup</option>
            <option value="manutencao">Manutenção</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">Todos os tipos</option>
            <option value="equipamento">Equipamento</option>
            <option value="instrumento">Instrumento</option>
            <option value="utensilio">Utensílio</option>
          </select>
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th
                className="cursor-pointer hover:bg-gray-200 px-4 py-2 text-left font-medium text-gray-600"
                onClick={() => {
                  setSortField('tag');
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
              >
                TAG {sortField === 'tag' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="cursor-pointer hover:bg-gray-200 px-4 py-2 text-left font-medium text-gray-600"
                onClick={() => {
                  setSortField('description');
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
              >
                Descrição {sortField === 'description' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="cursor-pointer hover:bg-gray-200 px-4 py-2 text-left font-medium text-gray-600"
                onClick={() => {
                  setSortField('sector');
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
              >
                Setor {sortField === 'sector' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="cursor-pointer hover:bg-gray-200 px-4 py-2 text-left font-medium text-gray-600"
                onClick={() => {
                  setSortField('type');
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
              >
                Tipo {sortField === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="cursor-pointer hover:bg-gray-200 px-4 py-2 text-left font-medium text-gray-600"
                onClick={() => {
                  setSortField('operationalStatus');
                  setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
              >
                Status {sortField === 'operationalStatus' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              {showActions && (
                <th className="px-4 py-2 text-left font-medium text-gray-600">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {getFilteredInstruments().length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-8 text-gray-500">
                  Nenhum instrumento encontrado
                </td>
              </tr>
            ) : (
              getFilteredInstruments().map(instrument => (
                <tr key={instrument._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm whitespace-nowrap">
                    {instrument.tag}
                  </td>
                  <td className="px-4 py-2">{instrument.description}</td>
                  <td className="px-4 py-2 text-sm">
                    {instrument.sector || instrument.location || '-'}
                  </td>
                  <td className="px-4 py-2 text-sm capitalize">{instrument.type}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        instrument.operationalStatus === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : instrument.operationalStatus === 'desativado'
                          ? 'bg-gray-100 text-gray-800'
                          : instrument.operationalStatus === 'backup'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {instrument.operationalStatus === 'manutencao'
                        ? 'Manutenção'
                        : (instrument.operationalStatus || 'ativo').charAt(0).toUpperCase() +
                          (instrument.operationalStatus || 'ativo').slice(1)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-4 py-2">
                      {(user?.role === 'admin' || user?.role === 'analyst') && (
                        <button
                          onClick={() => setEditingInstrument(instrument)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          ✏️ Editar
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(instrument._id, instrument.tag)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️ Excluir
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para novo instrumento */}
      {showNewInstrument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full mx-4">
            <InstrumentForm
              onInstrumentCreated={handleInstrumentCreated}
              onClose={() => setShowNewInstrument(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editingInstrument && (
        <EditInstrumentModal
          instrument={editingInstrument}
          onClose={() => setEditingInstrument(null)}
          onUpdated={handleInstrumentUpdated}
        />
      )}

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}