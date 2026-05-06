import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function InstrumentDetail({ instrument, onUpdate }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [quantities, setQuantities] = useState(instrument.quantities || []);

  const handleSave = async () => {
    try {
      await api.put(`/instruments/${instrument._id}`, { quantities });
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    }
  };

  const addQuantity = () => {
    setQuantities([
      ...quantities,
      {
        name: '',
        acceptanceCriteria: { type: 'maxError', value: '', maxError: null },
        calibrationPoints: [],
      },
    ]);
  };

  const updateQuantity = (index, field, value) => {
    const updated = [...quantities];
    updated[index][field] = value;
    setQuantities(updated);
  };

  const updateCriteria = (qIndex, field, value) => {
    const updated = [...quantities];
    updated[qIndex].acceptanceCriteria[field] = value;
    setQuantities(updated);
  };

  const addPoint = (qIndex) => {
    const updated = [...quantities];
    updated[qIndex].calibrationPoints.push({ applied: '', unit: '' });
    setQuantities(updated);
  };

  const removePoint = (qIndex, pIndex) => {
    const updated = [...quantities];
    updated[qIndex].calibrationPoints.splice(pIndex, 1);
    setQuantities(updated);
  };

  const updatePoint = (qIndex, pIndex, field, value) => {
    const updated = [...quantities];
    updated[qIndex].calibrationPoints[pIndex][field] = value;
    setQuantities(updated);
  };

  const removeQuantity = (index) => {
    if (quantities.length > 1) {
      setQuantities(quantities.filter((_, i) => i !== index));
    }
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

  const statusClass = {
    calibrado: 'bg-green-900 text-green-300',
    a_vencer: 'bg-yellow-900 text-yellow-300',
    vencido: 'bg-red-900 text-red-300',
    em_calibracao: 'bg-purple-900 text-purple-300',
    nao_calibrado: 'bg-gray-700 text-gray-400',
  }[instrument.calibrationStatus] || 'bg-gray-700 text-gray-400';

  const canEdit = user?.role === 'admin' || user?.role === 'analyst';

  return (
    <div className="text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono">{instrument.tag}</h2>
          <p className="text-dark-400 mt-1">{instrument.description}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-accent-blue-dark text-blue-100 rounded-lg hover:bg-accent-blue text-sm"
          >
            {editing ? 'Cancelar' : '✏️ Editar'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-xs text-dark-400 uppercase">Setor</div>
          <div className="text-sm">{instrument.sector || '—'}</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-xs text-dark-400 uppercase">Tipo</div>
          <div className="text-sm capitalize">{instrument.type}</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-xs text-dark-400 uppercase">Status Calibração</div>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {statusLabel(instrument.calibrationStatus)}
          </span>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-xs text-dark-400 uppercase">Última Calibração</div>
          <div className="text-sm">{instrument.lastCalibrationDate ? new Date(instrument.lastCalibrationDate).toLocaleDateString('pt-BR') : '—'}</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-xs text-dark-400 uppercase">Próxima Calibração</div>
          <div className="text-sm">{instrument.nextCalibrationDate ? new Date(instrument.nextCalibrationDate).toLocaleDateString('pt-BR') : '—'}</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-xs text-dark-400 uppercase">Frequência</div>
          <div className="text-sm">{instrument.calibrationFrequencyDays ? `${instrument.calibrationFrequencyDays} dias` : '—'}</div>
        </div>
      </div>

      {/* Grandezas e critérios */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold uppercase text-dark-400">📏 Critérios e Pontos de Calibração</h3>
          {editing && (
            <button onClick={addQuantity} className="text-xs bg-accent-blue-dark text-blue-100 px-2 py-1 rounded">
              + Adicionar Grandeza
            </button>
          )}
        </div>

        {quantities.map((q, qi) => (
          <div key={qi} className="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-4">
            {editing ? (
              <div className="flex gap-2 items-center mb-3">
                <input
                  type="text"
                  placeholder="Nome da grandeza"
                  value={q.name}
                  onChange={(e) => updateQuantity(qi, 'name', e.target.value)}
                  className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-sm flex-1"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="EMP (±)"
                  value={q.acceptanceCriteria.maxError || ''}
                  onChange={(e) => updateCriteria(qi, 'maxError', parseFloat(e.target.value) || null)}
                  className="bg-dark-700 border-dark-500 rounded px-2 py-1 text-sm w-24"
                />
                {quantities.length > 1 && (
                  <button onClick={() => removeQuantity(qi)} className="text-accent-red text-xs hover:underline">Remover</button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-3">
                <h4 className="text-base font-semibold">{q.name || 'Grandeza sem nome'}</h4>
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">EMP ±{q.acceptanceCriteria.maxError}</span>
                <span className="text-xs text-dark-400">{q.acceptanceCriteria.value || ''}</span>
              </div>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-400 uppercase text-xs">
                  <th className="text-left py-1">#</th>
                  <th className="text-left py-1">Valor Aplicado</th>
                  <th className="text-left py-1">Unidade</th>
                  {editing && <th className="text-left py-1"></th>}
                </tr>
              </thead>
              <tbody>
                {q.calibrationPoints.map((p, pi) => (
                  <tr key={pi} className="border-t border-dark-600">
                    <td className="py-1">{pi + 1}</td>
                    <td className="py-1">
                      {editing ? (
                        <input
                          type="number"
                          step="any"
                          value={p.applied}
                          onChange={(e) => updatePoint(qi, pi, 'applied', e.target.value)}
                          className="bg-dark-700 border-dark-500 rounded px-1 py-0.5 w-20 text-xs"
                        />
                      ) : (
                        p.applied
                      )}
                    </td>
                    <td className="py-1">
                      {editing ? (
                        <input
                          type="text"
                          value={p.unit}
                          onChange={(e) => updatePoint(qi, pi, 'unit', e.target.value)}
                          className="bg-dark-700 border-dark-500 rounded px-1 py-0.5 w-16 text-xs"
                        />
                      ) : (
                        p.unit
                      )}
                    </td>
                    {editing && (
                      <td className="py-1">
                        <button onClick={() => removePoint(qi, pi)} className="text-accent-red text-xs">X</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {editing && (
              <button onClick={() => addPoint(qi)} className="text-xs text-accent-blue hover:underline mt-2">
                + Adicionar Ponto
              </button>
            )}
          </div>
        ))}

        {editing && (
          <div className="flex justify-end mt-4">
            <button onClick={handleSave} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 text-sm">
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}