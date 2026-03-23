import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { formatDate } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const HealthChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-400 text-lg mb-2">📊 No trend data yet</p>
        <p className="text-slate-400 text-sm">Run your first analysis to see health trends</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => formatDate(d.date)),
    datasets: [
      {
        label: 'Heart Risk %', data: data.map((d) => d.heartRisk ?? null),
        borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.05)', fill: true, tension: 0.4,
        pointBackgroundColor: '#EF4444', pointBorderColor: '#FFFFFF', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2,
      },
      {
        label: 'Diabetes Risk %', data: data.map((d) => d.diabetesRisk ?? null),
        borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.05)', fill: true, tension: 0.4,
        pointBackgroundColor: '#3B82F6', pointBorderColor: '#FFFFFF', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#64748B', font: { size: 12, family: 'Inter' }, usePointStyle: true, padding: 20 } },
      tooltip: { backgroundColor: '#FFFFFF', titleColor: '#1E293B', bodyColor: '#64748B', borderColor: '#E2E8F0', borderWidth: 1, padding: 12, cornerRadius: 8, boxPadding: 4 },
    },
    scales: {
      x: { grid: { color: '#F1F5F9', drawBorder: false }, ticks: { color: '#94A3B8', font: { size: 11, family: 'Inter' } } },
      y: { min: 0, max: 100, grid: { color: '#F1F5F9', drawBorder: false }, ticks: { color: '#94A3B8', font: { size: 11, family: 'Inter' }, callback: (val) => val + '%' } },
    },
  };

  return <div className="h-64 md:h-80"><Line data={chartData} options={options} /></div>;
};

export default HealthChart;
