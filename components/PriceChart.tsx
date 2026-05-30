'use client';

import { useEffect, useRef } from 'react';
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
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PricePoint {
  recorded_at: string;
  price: number;
}

interface PriceChartProps {
  history: PricePoint[];
}

export default function PriceChart({ history }: PriceChartProps) {
  const minPrice = Math.min(...history.map((h) => h.price));

  const labels = history.map((h) =>
    new Date(h.recorded_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  );
  const prices = history.map((h) => h.price);

  const pointColors = prices.map((p) => (p === minPrice ? '#FF0000' : '#FF6B35'));
  const pointRadius = prices.map((p) => (p === minPrice ? 6 : 3));

  const data = {
    labels,
    datasets: [
      {
        label: '価格（円）',
        data: prices,
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        pointBackgroundColor: pointColors,
        pointRadius,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) => `¥${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val: number | string) => `¥${Number(val).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">過去30日間の価格推移</h3>
      <Line data={data} options={options} />
      <p className="text-xs text-gray-500 mt-2">● 赤い点が最安値</p>
    </div>
  );
}
