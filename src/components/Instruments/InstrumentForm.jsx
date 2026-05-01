import { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchableSelect from '../Common/SearchableSelect';

export default function InstrumentForm({ onInstrumentCreated }) {
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

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const res = await api.get('/instruments/sectors');
      setSectors(res.data);
    } catch (err) {
      console.error('Erro ao carregar setores:', err);
    }
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
    } catch (err) {
      console.error('Erro ao verificar TAG:', err);
    }
  };

  const handleTagChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setTag(value);
    if (value.length === 8) {
      validateTag(value);
    } else {
      setTagError('');
      setTagValid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tagValid) {
      setError('Corrija a TAG antes de salvar');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/instruments', {
        tag,
        description,
        sector,
        type,
        operationalStatus
      });
      setTag('');
      setDescription('');
      setSector('');
      setType('equipamento');
      setOperationalStatus('ativo');
      setTagError('');
      setTagValid(false);
      if (onInstrumentCreated) onInstrumentCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar instrumento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border mb-6">
      <h3 className="text-lg font-semibold mb-4">Novo Instrumento</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">TAG *</label>
          <input
            type="text"
            value={tag}
            onChange={handleTagChange}
            placeholder="ABC-1234"
            maxLength={8}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              tagError
                ? 'border-red-500 focus:ring-red-500 bg-red-50'
                : tagValid
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {tagError && <p className="text-red-500 text-xs mt-1">{tagError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="equipamento">Equipamento</option>
            <option value="instrumento">Instrumento</option>
            <option value="utensilio">Utensílio</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Descrição Completa *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Setor *</label>
          <SearchableSelect
            options={sectors}
            value={sector}
            onChange={setSector}
            placeholder="Digite para buscar..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status Operacional *</label>
          <select
            value={operationalStatus}
            onChange={(e) => setOperationalStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="ativo">Ativo</option>
            <option value="desativado">Desativado</option>
            <option value="backup">Backup</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}