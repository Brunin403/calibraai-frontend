import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InstrumentDetail from '../components/Instruments/InstrumentDetail';

export default function InstrumentsPage() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchDesc, setSearchDesc] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    try {
      const res = await api.get('/instruments?calibratable=true'); // apenas calibráveis
      setInstruments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (nextDate) => {
    if (!nextDate) return null;
    const today = new Date();
    const next = new Date(nextDate);
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  };

  const statusLabel = (status) => {
    const map = {
      calibrado: 'Calibrado',
      a_vencer: 'A vencer',
      vencido: 'Vencido',
      em_calibracao: 'Em calibração',
      aguardando_laudo: 'Aguardando laudo',
      nao_calibrado: 'Não calibrado',
    };
    return map[status] || status;
  };

  const filtered = instruments.filter((inst) => {
    if (searchDesc && !inst.description.toLowerCase().includes(searchDesc.toLowerCase())) return false;
    if (filterSector && inst.sector !== filterSector) return false;
    if (filterStatus && inst.calibrationStatus !== filterStatus) return false;
    return true;
  });

  const sectors = [...new Set(instruments.map((i) => i.sector).filter(Boolean))];

  if (loading) return <div className="p-4 text-dark-400">Carregando...</div>;

  return (
    <div className="flex h-full">
      {/* Painel esquerdo – lista de instrumentos */}
      <div className="w-80 bg-dark-800 border-r border-dark-600 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-dark-600 space-y-2">
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={searchDesc}
            onChange={(e) => setSearchDesc(e.target.value)}
            className="w-full bg-dark-700 border-dark-500 rounded px-3 py-1.5 text-sm text-white placeholder-dark-400"
          />
          <div className="flex gap-2">
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="flex-1 bg-dark-700 border-dark-500 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="">Todos os setores</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 bg-dark-700 border-dark-500 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="">Status de calibração</option>
              <option value="calibrado">Calibrado</option>
              <option value="a_vencer">A vencer</option>
              <option value="vencido">Vencido</option>
              <option value="em_calibracao">Em calibração</option>
              <option value="aguardando_laudo">Aguardando laudo</option>
              <option value="nao_calibrado">Não calibrado</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((inst) => {
            const days = getDaysRemaining(inst.nextCalibrationDate);
            let dayClass = '';
            if (days !== null && days < 0) dayClass = 'text-accent-red';
            else if (days !== null && days <= 90) dayClass = 'text-accent-amber';
            const daysText = days === null ? '—' : days < 0 ? `${Math.abs(days)}d atraso` : `${days}d`;

            return (
              <div
                key={inst._id}
                onClick={() => setSelected(inst)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selected?._id === inst._id ? 'bg-accent-blue-dark text-white' : 'hover:bg-dark-700 text-dark-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono font-bold text-sm">{inst.tag}</div>
                    <div className="text-xs text-dark-400 truncate max-w-[180px]">{inst.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${dayClass}`}>{daysText}</div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-dark-600 mt-1">{statusLabel(inst.calibrationStatus)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel direito – detalhes */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <InstrumentDetail instrument={selected} onUpdate={loadInstruments} />
        ) : (
          <div className="flex items-center justify-center h-full text-dark-400">
            Selecione um instrumento à esquerda
          </div>
        )}
      </div>
    </div>
  );
}