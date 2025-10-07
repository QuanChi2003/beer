'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ReportChartProps {
  range: 'day' | 'week' | 'month' | 'year';
}

export default function ReportChart({ range }: ReportChartProps) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/reports?range=${range}`)
      .then((res) => res.json())
      .then(setData);
  }, [range]);

  const chartData = {
    labels: data.map((d) => new Date(d.period).toLocaleDateString()),
    datasets: [
      {
        label: 'Doanh thu',
        data: data.map((d) => d.revenue),
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        fill: false,
      },
      {
        label: 'Lợi nhuận',
        data: data.map((d) => d.profit),
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Line data={chartData} options={options} />;
}