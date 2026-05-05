export default function StatusBadge({ status }) {
  const styles = {
    calibrado: 'bg-green-900 text-green-300',
    a_vencer: 'bg-yellow-900 text-yellow-300',
    vencido: 'bg-red-900 text-red-300',
    aguardando_laudo: 'bg-orange-900 text-orange-300',
    em_calibracao: 'bg-purple-900 text-purple-300',
    nao_calibrado: 'bg-gray-700 text-gray-400',
    ok: 'bg-green-900 text-green-300',
    attention: 'bg-yellow-900 text-yellow-300',
    overdue: 'bg-red-900 text-red-300',
  };

  const label = {
    calibrado: 'Calibrado',
    a_vencer: 'A vencer',
    vencido: 'Vencido',
    aguardando_laudo: 'Aguardando laudo',
    em_calibracao: 'Em calibração',
    nao_calibrado: 'Não calibrado',
    ok: 'OK',
    attention: 'Atenção',
    overdue: 'Vencido',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-700 text-gray-400'}`}>
      {label[status] || status}
    </span>
  );
}