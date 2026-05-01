import { useState } from 'react';
import api from '../../services/api';

export default function ImportModal({ isOpen, onClose, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/instruments/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
        if (onImportComplete) onImportComplete();
        onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao importar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Importar Equipamentos (Excel)</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="mb-4"
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {result && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm">
              <p className="font-semibold mb-2">Resultado:</p>
              <p>✅ Criados: {result.created}</p>
              <p>⏭️ Pulados (iguais): {result.skipped}</p>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-red-600">⚠️ Erros ({result.errors.length}):</p>
                  <ul className="list-disc pl-4">
                    {result.errors.map((err, i) => (
                      <li key={i} className="text-red-500">
                        <strong>{err.tag}</strong>: {err.error}
                        {err.details && (
                          <ul className="pl-4">
                            {err.details.map((d, j) => <li key={j}>{d}</li>)}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}