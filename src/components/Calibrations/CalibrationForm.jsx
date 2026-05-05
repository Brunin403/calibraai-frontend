import { useState } from 'react';
import api from '../../services/api';

export default function CalibrationForm({ instrument, onClose, onCreated }) {
  const [form, setForm] = useState({
    date: '',
    result: 'aprovado',
    supplier: '',
    certificateNumber: '',
    error: '',
    uncertainty: '',
    instrumentError: '',
    emp: '',
    unit: '',
    notes: '',
    status: 'concluido',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        instrumentId: instrument._id,
        date: form.date,
        result: form.result,
        supplier: form.supplier,
        certificateNumber: form.certificateNumber,
        error: parseFloat(form.error) || 0,
        uncertainty: parseFloat(form.uncertainty) || 0,
        instrumentError: parseFloat(form.instrumentError) || 0,
        emp: parseFloat(form.emp) || 0,
        unit: form.unit,
        notes: form.notes,
        status: form.status,
      };
      await api.post('/calibrations', data);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 w-full max-w-md text-white">
        <h2 className="text-lg font-bold mb-3">Nova Calibração – {instrument.tag}</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-dark-400 mb-1">Data da calibração *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-dark-400 mb-1">Resultado</label>
              <select name="result" value={form.result} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white">
                <option value="aprovado">Aprovado</option>
                <option value="reprovado">Reprovado</option>
                <option value="aprovado_com_restricao">Aprovado c/ restrição</option>
              </select>
            </div>
            <div>
              <label className="block text-dark-400 mb-1">Fornecedor</label>
              <input type="text" name="supplier" value={form.supplier} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-dark-400 mb-1">Nº Certificado</label>
            <input type="text" name="certificateNumber" value={form.certificateNumber} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-dark-400 mb-1">Erro</label>
              <input type="number" step="any" name="error" value={form.error} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-dark-400 mb-1">Incerteza</label>
              <input type="number" step="any" name="uncertainty" value={form.uncertainty} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-dark-400 mb-1">Erro Instrumento</label>
              <input type="number" step="any" name="instrumentError" value={form.instrumentError} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
            </div>
            <div>
              <label className="block text-dark-400 mb-1">EMP</label>
              <input type="number" step="any" name="emp" value={form.emp} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-dark-400 mb-1">Unidade</label>
            <input type="text" name="unit" value={form.unit} onChange={handleChange} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
          </div>
          <div>
            <label className="block text-dark-400 mb-1">Observações</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1 text-white" />
          </div>
          {error && <p className="text-accent-red text-xs">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 border border-dark-500 rounded text-dark-300 text-xs">Cancelar</button>
            <button type="submit" disabled={loading} className="px-3 py-1.5 bg-accent-blue-dark text-blue-100 rounded text-xs hover:bg-accent-blue">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}