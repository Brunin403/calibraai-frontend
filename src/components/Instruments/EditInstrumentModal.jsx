import { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchableSelect from '../Common/SearchableSelect';
import { useAuth } from '../../context/AuthContext';

export default function EditInstrumentModal({ instrument, onClose, onUpdated }) {
  const { user } = useAuth();
  const [tag, setTag] = useState(instrument?.tag || '');
  const [description, setDescription] = useState(instrument?.description || '');
  const [sector, setSector] = useState(instrument?.sector || '');
  const [type, setType] = useState(instrument?.type || 'equipamento');
  const [operationalStatus, setOperationalStatus] = useState(instrument?.operationalStatus || 'ativo');
  const [sectors, setSectors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Faixas (opcionais)
  const [usageMin, setUsageMin] = useState(instrument?.usageRange?.min || '');
  const [usageMax, setUsageMax] = useState(instrument?.usageRange?.max || '');
  const [usageUnit, setUsageUnit] = useState(instrument?.usageRange?.unit || '');
  const [nominalMin, setNominalMin] = useState(instrument?.nominalRange?.min || '');
  const [nominalMax, setNominalMax] = useState(instrument?.nominalRange?.max || '');
  const [nominalUnit, setNominalUnit] = useState(instrument?.nominalRange?.unit || '');

  useEffect(() => { loadSectors(); }, []);

  const loadSectors = async () => {
    try {
      const res = await api.get('/instruments/sectors');
      setSectors(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updates = {
        description, sector, type, operationalStatus,
        usageRange: usageMin || usageMax ? { min: parseFloat(usageMin) || 0, max: parseFloat(usageMax) || 0, unit: usageUnit } : undefined,
        nominalRange: nominalMin || nominalMax ? { min: parseFloat(nominalMin) || 0, max: parseFloat(nominalMax) || 0, unit: nominalUnit } : undefined,
      };
      if (user?.role === 'admin' && tag !== instrument.tag) {
        updates.tag = tag;
      }
      const res = await api.patch(`/instruments/${instrument._id}`, updates);
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-lg text-white">
        <h2 className="text-xl font-bold mb-4">Editar Instrumento</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">TAG</label>
              <input type="text" value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                disabled={user?.role !== 'admin'} maxLength={8}
                className="w-full px-3 py-2 border rounded-lg bg-dark-700 border-dark-500 disabled:bg-dark-600" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg">
                <option value="equipamento">Equipamento</option>
                <option value="instrumento">Instrumento</option>
                <option value="utensilio">Utensílio</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Setor</label>
              <SearchableSelect options={sectors} value={sector} onChange={setSector} placeholder="Digite para buscar..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={operationalStatus} onChange={(e) => setOperationalStatus(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg">
                <option value="ativo">Ativo</option>
                <option value="desativado">Desativado</option>
                <option value="backup">Backup</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>

          {/* Faixa de Uso */}
          <div className="mb-2">
            <p className="text-sm font-medium mb-2">Faixa de Uso (opcional)</p>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" step="any" placeholder="Min" value={usageMin} onChange={e => setUsageMin(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-sm" />
              <input type="number" step="any" placeholder="Max" value={usageMax} onChange={e => setUsageMax(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-sm" />
              <input type="text" placeholder="Unidade" value={usageUnit} onChange={e => setUsageUnit(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-sm" />
            </div>
          </div>

          {/* Faixa Nominal */}
          <div className="mb-2">
            <p className="text-sm font-medium mb-2">Faixa Nominal (opcional)</p>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" step="any" placeholder="Min" value={nominalMin} onChange={e => setNominalMin(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-sm" />
              <input type="number" step="any" placeholder="Max" value={nominalMax} onChange={e => setNominalMax(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-sm" />
              <input type="text" placeholder="Unidade" value={nominalUnit} onChange={e => setNominalUnit(e.target.value)}
                className="bg-dark-700 border border-dark-500 rounded px-2 py-1 text-sm" />
            </div>
          </div>

          {error && <p className="text-red-400 mb-4">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 border border-dark-500 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}