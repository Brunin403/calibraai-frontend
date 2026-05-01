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

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const res = await api.get('/instruments/sectors');
      setSectors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const updates = { description, sector, type, operationalStatus };
      // Admin pode editar TAG
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
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Instrumento</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">TAG</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                disabled={user?.role !== 'admin'}
                maxLength={8}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Setor</label>
              <SearchableSelect
                options={sectors}
                value={sector}
                onChange={setSector}
                placeholder="Digite para buscar..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status Operacional</label>
              <select value={operationalStatus} onChange={(e) => setOperationalStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ativo">Ativo</option>
                <option value="desativado">Desativado</option>
                <option value="backup">Backup</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}