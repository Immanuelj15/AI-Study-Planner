import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function WeeklyBarChart({ weeklyData }) {
  const labels = weeklyData ? weeklyData.map((d) => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const targets = weeklyData ? weeklyData.map((d) => d.target) : [3, 4, 3.5, 4, 3, 2.5, 3];
  const completed = weeklyData ? weeklyData.map((d) => d.completed) : [2.5, 3.8, 3.0, 4.0, 2.0, 2.5, 1.5];

  const data = {
    labels,
    datasets: [
      {
        label: 'Target Hours',
        data: targets,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Completed Hours',
        data: completed,
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderColor: '#06b6d4',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  return <Bar data={data} options={options} />;
}

export function SubjectDoughnutChart({ masteryData }) {
  const labels = masteryData ? masteryData.map((m) => m.subject) : ['Data Structures', 'DBMS', 'OS', 'Networks'];
  const scores = masteryData ? masteryData.map((m) => m.mastery_score) : [88, 52, 92, 78];

  const data = {
    labels,
    datasets: [
      {
        label: 'Mastery %',
        data: scores,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}
