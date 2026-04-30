export default function StatusCards({ data }) {
  const cards = [
    {
      label: 'Em dia',
      value: `${data.percentOk || 0}%`,
      count: data.ok || 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Atenção',
      value: `${data.percentAttention || 0}%`,
      count: data.attention || 0,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Vencidos',
      value: `${data.percentOverdue || 0}%`,
      count: data.overdue || 0,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-2xl p-6 shadow-sm ${card.bg}`}>
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          <p className="text-xs text-slate-400 mt-1">{card.count} instrumentos</p>
        </div>
      ))}
    </div>
  );
}