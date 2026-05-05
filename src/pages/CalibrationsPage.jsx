import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CalibrationForm from '../components/Calibrations/CalibrationForm';
import StatusBadge from '../components/Common/StatusBadge';

export default function CalibrationsPage() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros
  const [filterTag, setFilterTag] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterType, setFilterType] = useState('');

  // Ordenação
  const [sortBy, setSortBy] = useState('tag'); // 'tag' ou 'nextDate'

  const loadCalibratableInstruments = async () => {
    try {
      const res = await api.get('/instruments?calibratable=true');
      setInstruments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCalibrations = async (instrumentId) => {
    try {
      const res = await api.get(`/calibrations?instrumentId=${instrumentId}`);
      setCalibrations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCalibratableInstruments();
  }, []);

  const handleSelectInstrument = (instrument) => {
    setSelectedInstrument(instrument);
    loadCalibrations(instrument._id);
  };

  const handleCalibrationCreated = () => {
    if (selectedInstrument) loadCalibrations(selectedInstrument._id);
    setShowForm(false);
    loadCalibratableInstruments();
  };

  const handleChangeStatus = async (instrumentId, newStatus) => {
    const confirmMsg = {
      'em_calibracao': 'Enviar instrumento para calibração externa?',
      'aguardando_laudo': 'Marcar como aguardando laudo?',
    };
    if (!window.confirm(confirmMsg[newStatus] || 'Alterar status?')) return;

    try {
      await api.patch(`/instruments/${instrumentId}/calibration-status`, { calibrationStatus: newStatus });
      loadCalibratableInstruments();
      if (selectedInstrument?._id === instrumentId) {
        loadCalibrations(instrumentId);
      }
    } catch (err) {
      alert('Erro ao alterar status: ' + (err.response?.data?.error || err.message));
    }
  };

  // Aplicar filtros e ordenação
  const filteredInstruments = instruments
    .filter(inst => {
      if (filterTag && !inst.tag.toLowerCase().includes(filterTag.toLowerCase())) return false;
      if (filterDescription && !inst.description.toLowerCase().includes(filterDescription.toLowerCase())) return false;
      if (filterSector && !(inst.sector || '').toLowerCase().includes(filterSector.toLowerCase())) return false;
      if (filterType && inst.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'tag') {
        return (a.tag || '').localeCompare(b.tag || '');
      } else { // sortBy === 'nextDate'
        if (!a.nextCalibrationDate && !b.nextCalibrationDate) return 0;
        if (!a.nextCalibrationDate) return 1;
        if (!b.nextCalibrationDate) return -1;
        return new Date(a.nextCalibrationDate) - new Date(b.nextCalibrationDate);
      }
    });

  if (loading) return <div className="p-4 text-dark-400">Carregando...</div>;

  return (
    <div className="p-4 flex gap-4 h-full">
      {/* Painel esquerdo */}
      <div className="w-1/3 bg-dark-800 border border-dark-600 rounded-lg p-3 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-white">Calibráveis</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-accent-blue hover:underline"
          >
            {showFilters ? '🔽 Ocultar' : '🔍 Filtros'}
          </button>
        </div>

        {/* Ordenação */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setSortBy('tag')}
            className={`text-[10px] px-2 py-1 rounded ${sortBy === 'tag' ? 'bg-accent-blue-dark text-blue-100' : 'bg-dark-700 text-dark-400'}`}
          >
            A-Z
          </button>
          <button
            onClick={() => setSortBy('nextDate')}
            className={`text-[10px] px-2 py-1 rounded ${sortBy === 'nextDate' ? 'bg-accent-blue-dark text-blue-100' : 'bg-dark-700 text-dark-400'}`}
          >
            Vencimento
          </button>
        </div>

        {/* Filtros ocultos */}
        {showFilters && (
          <div className="space-y-2 mb-3">
            <input
              type="text"
              placeholder="Filtrar TAG..."
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded px-2 py-1 text-xs text-white placeholder-dark-400"
            />
            <input
              type="text"
              placeholder="Filtrar descrição..."
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded px-2 py-1 text-xs text-white placeholder-dark-400"
            />
            <input
              type="text"
              placeholder="Filtrar setor..."
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded px-2 py-1 text-xs text-white placeholder-dark-400"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded px-2 py-1 text-xs text-white"
            >
              <option value="">Todos os tipos</option>
              <option value="equipamento">Equipamento</option>
              <option value="instrumento">Instrumento</option>
              <option value="utensilio">Utensílio</option>
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-1">
          {filteredInstruments.map(inst => (
            <div
              key={inst._id}
              onClick={() => handleSelectInstrument(inst)}
              className={`p-2 rounded cursor-pointer text-xs flex justify-between items-center ${
                selectedInstrument?._id === inst._id ? 'bg-accent-blue-dark text-blue-100' : 'hover:bg-dark-700 text-dark-300'
              }`}
            >
              <div>
                <span className="font-mono font-medium">{inst.tag}</span>
                {inst.nextCalibrationDate && (
                  <div className="text-[10px] text-dark-400">
                    {new Date(inst.nextCalibrationDate).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              <StatusBadge status={inst.calibrationStatus || inst.status} />
            </div>
          ))}
          {filteredInstruments.length === 0 && (
            <p className="text-xs text-dark-400">Nenhum instrumento encontrado.</p>
          )}
        </div>
      </div>

      {/* Detalhes e histórico */}
      <div className="flex-1 bg-dark-800 border border-dark-600 rounded-lg p-3 overflow-y-auto">
        {!selectedInstrument ? (
          <div className="flex items-center justify-center h-full text-dark-400 text-sm">
            Selecione um instrumento à esquerda
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedInstrument.tag}</h3>
                <p className="text-xs text-dark-400">{selectedInstrument.description}</p>
                <p className="text-xs text-dark-400">Setor: {selectedInstrument.sector || '-'} | Tipo: {selectedInstrument.type}</p>
                <div className="mt-1 flex gap-2 items-center flex-wrap">
                  <span className="text-xs text-dark-400">Status:</span>
                  <StatusBadge status={selectedInstrument.calibrationStatus || selectedInstrument.status} />
                  {user?.role === 'admin' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleChangeStatus(selectedInstrument._id, 'em_calibracao')}
                        className="text-[10px] bg-purple-800 hover:bg-purple-700 text-purple-200 px-1.5 py-0.5 rounded"
                      >
                        Enviar p/ calib.
                      </button>
                      <button
                        onClick={() => handleChangeStatus(selectedInstrument._id, 'aguardando_laudo')}
                        className="text-[10px] bg-yellow-800 hover:bg-yellow-700 text-yellow-200 px-1.5 py-0.5 rounded"
                      >
                        Aguardando laudo
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-1.5 bg-accent-blue-dark text-blue-100 rounded text-xs hover:bg-accent-blue"
              >
                + Nova Calibração
              </button>
            </div>

            {/* Histórico */}
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-dark-400 uppercase mb-2">Histórico de calibrações</h4>
              {calibrations.length === 0 ? (
                <p className="text-xs text-dark-400">Nenhuma calibração registrada.</p>
              ) : (
                <div className="space-y-2">
                  {calibrations.map(cal => (
                    <div key={cal._id} className="bg-dark-700 border border-dark-500 rounded p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-medium text-white">
                          {new Date(cal.date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          cal.result === 'aprovado'
                            ? 'bg-green-900 text-green-300'
                            : cal.result === 'aprovado_com_restricao'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {cal.result === 'aprovado'
                            ? 'Aprovado'
                            : cal.result === 'aprovado_com_restricao'
                            ? 'Aprov. c/ restrição'
                            : 'Reprovado'}
                        </span>
                      </div>
                      <div className="text-dark-400 mt-1">
                        Fornecedor: {cal.supplier || 'Interno'} | Certificado: {cal.certificateNumber || '-'}
                      </div>
                      {cal.nextDate && (
                        <div className="text-dark-400">
                          Próxima: {new Date(cal.nextDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showForm && selectedInstrument && (
        <CalibrationForm
          instrument={selectedInstrument}
          onClose={() => setShowForm(false)}
          onCreated={handleCalibrationCreated}
        />
      )}
    </div>
  );
}
