import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const statusColors = {
  ok: 'bg-green-100 text-green-800',
  attention: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

export default function InstrumentDetailPage() {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    nextDate: '',
    result: 'approved',
    notes: '',
    failureDetected: false,
    certificate: null,
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/instruments/${id}`),
      api.get(`/instruments/${id}/calibrations`),
    ])
      .then(([instRes, calRes]) => {
        setInstrument(instRes.data);
        setCalibrations(calRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, certificate: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('date', formData.date);
      payload.append('nextDate', formData.nextDate);
      payload.append('result', formData.result);
      payload.append('notes', formData.notes);
      payload.append('failureDetected', formData.failureDetected);
      if (formData.certificate) {
        payload.append('certificate', formData.certificate);
      }
      await api.post(`/instruments/${id}/calibrations`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowForm(false);
      setFormData({
        date: '',
        nextDate: '',
        result: 'approved',
        notes: '',
        failureDetected: false,
        certificate: null,
      });
      fetchData(); // recarrega os dados
    } catch (err) {
      console.error('Erro ao registrar calibração:', err);
      alert('Erro ao registrar calibração');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!instrument) return <div className="p-8 text-red-500">Instrumento não encontrado.</div>;

  return (
    <div className="space-y-6">
      {/* Cabeçalho do instrumento */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{instrument.tag}</h2>
            <p className="text-slate-500">{instrument.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[instrument.calibrationStatus]}`}>
            {instrument.calibrationStatus === 'ok' ? 'Em dia' :
             instrument.calibrationStatus === 'attention' ? 'Atenção' : 'Vencido'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <div><span className="text-slate-500">Setor:</span> {instrument.sector || '-'}</div>
          <div><span className="text-slate-500">Tipo:</span> {instrument.type || '-'}</div>
          <div><span className="text-slate-500">Criticidade:</span> {instrument.criticity || '-'}</div>
          <div><span className="text-slate-500">Faixa:</span> {instrument.measurementRange?.min} ~ {instrument.measurementRange?.max} {instrument.measurementRange?.unit || ''}</div>
          <div><span className="text-slate-500">Local Calib.:</span> {instrument.calibrationLocation === 'in_loco' ? 'In Loco' : 'Externa'}</div>
          <div><span className="text-slate-500">Frequência:</span> {instrument.calibrationFrequencyDays ? `${instrument.calibrationFrequencyDays} dias` : '-'}</div>
          <div><span className="text-slate-500">Próx. Calib.:</span> {instrument.nextCalibrationDate ? new Date(instrument.nextCalibrationDate).toLocaleDateString('pt-BR') : '-'}</div>
        </div>
      </div>

      {/* Histórico de Calibrações */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Histórico de Calibrações</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Nova Calibração'}
          </button>
        </div>

        {/* Formulário (oculto/exibido) */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-slate-200 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Data da Calibração</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Próxima Calibração</label>
                <input type="date" name="nextDate" value={formData.nextDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Resultado</label>
                <select name="result" value={formData.result} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Reprovado</option>
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="failureDetected" checked={formData.failureDetected} onChange={handleChange} />
                  Falha detectada
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700">Certificado (PDF)</label>
                <input type="file" accept="application/pdf" onChange={handleChange} className="text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700">Observações</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full border rounded-lg px-3 py-2 text-sm"></textarea>
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Registrar</button>
          </form>
        )}

        {/* Timeline */}
        {calibrations.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhuma calibração registrada.</p>
        ) : (
          <div className="space-y-3">
            {calibrations.map(cal => (
              <div key={cal._id} className="flex items-start gap-4 border-l-2 border-slate-200 pl-4 py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(cal.date).toLocaleDateString('pt-BR')} → {new Date(cal.nextDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {cal.result === 'approved' ? '✅ Aprovado' : '❌ Reprovado'}
                    {cal.failureDetected && ' - Falha detectada'}
                  </p>
                  {cal.notes && <p className="text-xs text-slate-500 mt-1">{cal.notes}</p>}
                  {cal.certificateFile && (
                    <a href={`http://localhost:5000/${cal.certificateFile}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                      📄 Ver certificado
                    </a>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {cal.performedBy?.name || 'Técnico'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}