import { useState } from 'react';
import api from '../../services/api';

export default function CalibrationForm({ instrument, onClose, onCreated }) {
  const [date, setDate] = useState('');
  const [result, setResult] = useState('aprovado');
  const [supplier, setSupplier] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptanceType, setAcceptanceType] = useState('text');
  const [acceptanceValue, setAcceptanceValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [groups, setGroups] = useState([
    {
      quantity: '',
      unit: '',
      points: [{ applied: '', read: '', error: '', uncertainty: '', ok: true }]
    }
  ]);

  const addGroup = () => {
    setGroups([...groups, {
      quantity: '',
      unit: '',
      points: [{ applied: '', read: '', error: '', uncertainty: '', ok: true }]
    }]);
  };

  const removeGroup = (index) => {
    if (groups.length > 1) setGroups(groups.filter((_, i) => i !== index));
  };

  const updateGroup = (index, field, value) => {
    const updated = [...groups];
    updated[index][field] = value;
    setGroups(updated);
  };

  const addPoint = (groupIndex) => {
    const updated = [...groups];
    updated[groupIndex].points.push({ applied: '', read: '', error: '', uncertainty: '', ok: true });
    setGroups(updated);
  };

  const removePoint = (groupIndex, pointIndex) => {
    const updated = [...groups];
    if (updated[groupIndex].points.length > 1) {
      updated[groupIndex].points = updated[groupIndex].points.filter((_, i) => i !== pointIndex);
      setGroups(updated);
    }
  };

  const updatePoint = (groupIndex, pointIndex, field, value) => {
    const updated = [...groups];
    const point = updated[groupIndex].points[pointIndex];
    point[field] = value;

    // Calcular erro automaticamente se aplicado e lido estiverem preenchidos
    if (field === 'applied' || field === 'read') {
      const applied = parseFloat(point.applied);
      const read = parseFloat(point.read);
      if (!isNaN(applied) && !isNaN(read)) {
        point.error = (read - applied).toFixed(4);
      }
    }

    setGroups(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        instrumentId: instrument._id,
        date,
        result,
        supplier,
        certificateNumber,
        notes,
        acceptanceCriteria: {
          type: acceptanceType,
          value: acceptanceValue,
        },
        measurementGroups: groups.map(group => ({
          quantity: group.quantity,
          unit: group.unit,
          points: group.points.map(p => ({
            applied: parseFloat(p.applied) || 0,
            read: parseFloat(p.read) || 0,
            error: parseFloat(p.error) || 0,
            uncertainty: parseFloat(p.uncertainty) || 0,
            ok: p.ok === true || p.ok === 'true' || p.ok === 1
          }))
        }))
      };
      await api.post('/calibrations', payload);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar calibração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 w-full max-w-2xl text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Nova Calibração – {instrument.tag}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-dark-400 mb-1">Data *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1" required />
            </div>
            <div>
              <label className="block text-dark-400 mb-1">Resultado</label>
              <select value={result} onChange={e => setResult(e.target.value)}
                className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1">
                <option value="aprovado">Aprovado</option>
                <option value="reprovado">Reprovado</option>
                <option value="aprovado_com_restricao">Aprovado c/ restrição</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-dark-400 mb-1">Fornecedor</label>
              <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)}
                className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-dark-400 mb-1">Nº Certificado</label>
              <input type="text" value={certificateNumber} onChange={e => setCertificateNumber(e.target.value)}
                className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1" />
            </div>
          </div>
          <div>
            <label className="block text-dark-400 mb-1">Observações</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1" />
          </div>

          {/* Critério de Aceitação (híbrido) */}
          <div className="border-t border-dark-600 pt-3">
            <h4 className="text-sm font-semibold mb-2">Critério de Aceitação</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-dark-400 mb-1">Tipo</label>
                <select value={acceptanceType} onChange={e => setAcceptanceType(e.target.value)}
                  className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1">
                  <option value="text">Texto livre</option>
                  <option value="maxError" disabled>Erro máximo (futuro)</option>
                  <option value="percentage" disabled>Percentual (futuro)</option>
                </select>
              </div>
              <div>
                <label className="block text-dark-400 mb-1">Valor / Descrição</label>
                <input type="text" value={acceptanceValue}
                  onChange={e => setAcceptanceValue(e.target.value)}
                  placeholder="Ex: Erro ≤ 1,5%"
                  className="w-full bg-dark-700 border-dark-500 rounded px-2 py-1" />
              </div>
            </div>
          </div>

          {/* Pontos de Calibração */}
          <div className="border-t border-dark-600 pt-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-semibold">Pontos de Calibração</h4>
              <button type="button" onClick={addGroup}
                className="text-xs bg-accent-blue-dark text-blue-100 px-2 py-1 rounded hover:bg-accent-blue">
                + Adicionar Grandeza
              </button>
            </div>

            {groups.map((group, gi) => (
              <div key={gi} className="mb-4 border border-dark-600 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Grandeza (ex: Temperatura)"
                      value={group.quantity}
                      onChange={e => updateGroup(gi, 'quantity', e.target.value)}
                      className="flex-1 bg-dark-700 border-dark-500 rounded px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Unidade (ex: °C)"
                      value={group.unit}
                      onChange={e => updateGroup(gi, 'unit', e.target.value)}
                      className="w-24 bg-dark-700 border-dark-500 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  {groups.length > 1 && (
                    <button type="button" onClick={() => removeGroup(gi)}
                      className="ml-2 text-xs text-accent-red hover:underline">Remover</button>
                  )}
                </div>

                <table className="w-full text-xs mb-2">
                  <thead>
                    <tr className="text-dark-400 uppercase">
                      <th className="text-left py-1">Aplicado</th>
                      <th className="text-left py-1">Lido</th>
                      <th className="text-left py-1">Erro (auto)</th>
                      <th className="text-left py-1">Incerteza</th>
                      <th className="text-left py-1">OK</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.points.map((point, pi) => (
                      <tr key={pi}>
                        <td className="py-1">
                          <input type="number" step="any" value={point.applied}
                            onChange={e => updatePoint(gi, pi, 'applied', e.target.value)}
                            className="w-16 bg-dark-700 border-dark-500 rounded px-1 py-0.5" />
                        </td>
                        <td className="py-1">
                          <input type="number" step="any" value={point.read}
                            onChange={e => updatePoint(gi, pi, 'read', e.target.value)}
                            className="w-16 bg-dark-700 border-dark-500 rounded px-1 py-0.5" />
                        </td>
                        <td className="py-1">
                          <input type="number" step="any" value={point.error}
                            onChange={e => updatePoint(gi, pi, 'error', e.target.value)}
                            className="w-20 bg-dark-700 border-dark-500 rounded px-1 py-0.5" />
                        </td>
                        <td className="py-1">
                          <input type="number" step="any" value={point.uncertainty}
                            onChange={e => updatePoint(gi, pi, 'uncertainty', e.target.value)}
                            className="w-20 bg-dark-700 border-dark-500 rounded px-1 py-0.5" />
                        </td>
                        <td className="py-1">
                          <input type="checkbox" checked={point.ok === true || point.ok === 'true'}
                            onChange={e => updatePoint(gi, pi, 'ok', e.target.checked)}
                            className="form-checkbox h-4 w-4 text-accent-blue bg-dark-700 border-dark-500 rounded" />
                        </td>
                        <td className="py-1">
                          {group.points.length > 1 && (
                            <button type="button" onClick={() => removePoint(gi, pi)}
                              className="text-accent-red text-xs hover:underline">X</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => addPoint(gi)}
                  className="text-xs text-accent-blue hover:underline">+ Adicionar Ponto</button>
              </div>
            ))}
          </div>

          {error && <p className="text-accent-red text-xs">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 border border-dark-500 rounded text-dark-300 text-xs">Cancelar</button>
            <button type="submit" disabled={loading}
              className="px-3 py-1.5 bg-accent-blue-dark text-blue-100 rounded text-xs hover:bg-accent-blue">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}