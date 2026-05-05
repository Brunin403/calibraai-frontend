import { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchableSelect from '../Common/SearchableSelect';

export default function InstrumentForm({ onInstrumentCreated, onClose }) {
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [type, setType] = useState('equipamento');
  const [operationalStatus, setOperationalStatus] = useState('ativo');
  const [sectors, setSectors] = useState([]);
  const [tagError, setTagError] = useState('');
  const [tagValid, setTagValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Novos campos
  const [usageMin, setUsageMin] = useState('');
  const [usageMax, setUsageMax] = useState('');
  const [usageUnit, setUsageUnit] = useState('');
  const [nominalMin, setNominalMin] = useState('');
  const [nominalMax, setNominalMax] = useState('');
  const [nominalUnit, setNominalUnit] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');

  useEffect(() => { loadSectors(); }, []);

  const loadSectors = async () => {
    try {
      const res = await api.get('/instruments/sectors');
      setSectors(res.data);
    } catch (err) { console.error(err); }
  };

  const validateTag = async (value) => {
    const tagRegex = /^[A-Z]{3}-\d{4}$/;
    if (!tagRegex.test(value)) {
      setTagError('Formato: AAA-0000');
      setTagValid(false);
      return;
    }
    try {
      const res = await api.get(`/instruments?tag=${value}`);
      if (res.data.length > 0) {
        setTagError('TAG existente');
        setTagValid(false);
      } else {
        setTagError('');
        setTagValid(true);
      }
    } catch (err) { console.error(err); }
  };

  const handleTagChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setTag(value);
    if (value.length === 8) validateTag(value);
    else { setTagError(''); setTagValid(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!tagValid) { setError('Corrija a TAG antes de salvar'); return; }
    setLoading(true);
    try {
      const payload = {
        tag, description, sector, type, operationalStatus,
        usageRange: usageMin || usageMax ? { min: parseFloat(usageMin) || 0, max: parseFloat(usageMax) || 0, unit: usageUnit } : undefined,
        nominalRange: nominalMin || nominalMax ? { min: parseFloat(nominalMin) || 0, max: parseFloat(nominalMax) || 0, unit: nominalUnit } : undefined,
        acceptanceCriteria: acceptanceCriteria || undefined,
      };
      const res = await api.post('/instruments', payload);
      setTag(''); setDescription(''); setSector(''); setType('equipamento');
      setOperationalStatus('ativo'); setTagError(''); setTagValid(false);
      setUsageMin(''); setUsageMax(''); setUsageUnit('');
      setNominalMin(''); setNominalMax(''); setNominalUnit('');
      setAcceptanceCriteria('');
      if (onInstrumentCreated) onInstrumentCreated(res.data);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar instrumento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Novo Instrumento</h3>
        {onClose && <button type="button" onClick={onClose} className="text-dark-400 hover:text-white">✕</button>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">TAG *</label>
          <input type="text" value={tag} onChange={handleTagChange} placeholder="ABC-1234" maxLength={8}
            className={`w-full px-3 py-2 border rounded-lg bg-dark-700 border-dark-500 focus:outline-none focus:ring-2 ${
              tagError ? 'border-red-500 focus:ring-red-500' : tagValid ? 'border-green-500 focus:ring-green-500' : 'focus:ring-blue-500'
            }`} required />
          {tagError && <p className="text-red-400 text-xs mt-1">{tagError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="equipamento">Equipamento</option>
            <option value="instrumento">Instrumento</option>
            <option value="utensilio">Utensílio</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Descrição Completa *</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Setor *</label>
          <SearchableSelect options={sectors} value={sector} onChange={setSector} placeholder="Digite para buscar..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status Operacional *</label>
          <select value={operationalStatus} onChange={(e) => setOperationalStatus(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="ativo">Ativo</option>
            <option value="desativado">Desativado</option>
            <option value="backup">Backup</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
      </div>

      {/* Novos campos: Faixa de Uso */}
      <div className="mb-4">
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

      {/* Novos campos: Faixa Nominal */}
      <div className="mb-4">
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

      {/* Critério de Aceitação */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Critério de Aceitação (opcional)</label>
        <input type="text" value={acceptanceCriteria} onChange={e => setAcceptanceCriteria(e.target.value)}
          placeholder="Ex: Erro máximo ≤ 0,5% do fundo de escala"
          className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <button type="submit" disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}