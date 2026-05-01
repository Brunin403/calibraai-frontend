import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import InstrumentForm from '../components/Instruments/InstrumentForm';
import ImportModal from '../components/Instruments/ImportModal';

export default function InstrumentsPage() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para filtros e ordenação
  const [sortField, setSortField] = useState('tag');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

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
  };

  const handleImportComplete = () => {
    loadInstruments();
  };

  // Função para filtrar e ordenar a lista local
  const getFilteredInstruments = () => {
    let filtered = [...instruments];

    if (search) {
      filtered = filtered.filter(i =>
        i.tag.toLowerCase().includes(search.toLowerCase())
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
      if (sortOrder === 'asc') return valA.localeCompare(valB);
      else return valB.localeCompare(valA);
    });

    return filtered;
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Carregando instrumentos...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Instrumentos</h2>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            📥 Importar Excel
          </button>
        )}
      </div>

      {user?.role === 'admin' && (
        <InstrumentForm onInstrumentCreated={handleInstrumentCreated} />
      )}

      {/* Filtros */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar por TAG..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      </div>

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
            </tr>
          </thead>
          <tbody>
            {getFilteredInstruments().length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}