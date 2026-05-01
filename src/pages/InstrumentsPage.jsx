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

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">TAG</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Setor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {instruments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Nenhum instrumento cadastrado
                </td>
              </tr>
            ) : (
              instruments.map(instrument => (
                <tr key={instrument._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{instrument.tag}</td>
                  <td className="px-4 py-3">{instrument.description}</td>
                  <td className="px-4 py-3 text-sm">
                    {instrument.sector || instrument.location || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{instrument.type}</td>
                  <td className="px-4 py-3">
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