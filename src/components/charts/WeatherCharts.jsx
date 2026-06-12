import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

export function TemperatureChart({ labels, maxTemps, minTemps, unit = '°C' }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Max Temp',
        data: maxTemps,
        borderColor: '#F79009',
        backgroundColor: 'rgba(247, 144, 9, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#F79009',
      },
      {
        label: 'Min Temp',
        data: minTemps,
        borderColor: '#4DABF7',
        backgroundColor: 'rgba(77, 171, 247, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4DABF7',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Plus Jakarta Sans', size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#667085' },
      },
      y: {
        grid: { color: '#E7ECF5' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#667085' },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export function PrecipitationChart({ labels, values }) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Precipitation',
        data: values,
        backgroundColor: 'rgba(77, 171, 247, 0.6)',
        borderRadius: 6,
        barThickness: 32,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} mm`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#667085' },
      },
      y: {
        grid: { color: '#E7ECF5' },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#667085' },
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
}
