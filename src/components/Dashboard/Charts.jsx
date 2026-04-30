import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = { high: '#dc2626', medium: '#eab308', low: '#16a34a' };

export default function Charts({ data }) {
  const chartData = [
    { name: 'Alta', value: data.high || 0, color: COLORS.high },
    { name: 'Média', value: (data.total - (data.high || 0) - (data.low || 0)) || 0, color: COLORS.medium },
    { name: 'Baixa', value: data.low || 0, color: COLORS.low },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-700 mb-4">Distribuição por Criticidade</h4>
      {chartData.length === 0 ? (
        <p className="text-slate-400 text-sm">Nenhum instrumento cadastrado.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}