'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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

  return (
    ```chartjs
    {
      "type": "line",
      "data": {
        "labels": ${JSON.stringify(chartData.labels)},
        "datasets": [
          {
            "label": "Doanh thu",
            "data": ${JSON.stringify(chartData.datasets[0].data)},
            "borderColor": "#2563eb",
            "backgroundColor": "#2563eb",
            "fill": false
          },
          {
            "label": "Lợi nhuận",
            "data": ${JSON.stringify(chartData.datasets[1].data)},
            "borderColor": "#16a34a",
            "backgroundColor": "#16a34a",
            "fill": false
          }
        ]
      },
      "options": {
        "responsive": true,
        "scales": {
          "y": { "beginAtZero": true }
        }
      }
    }
    ```
  );
}