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
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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
        backgroundColor: 'rgba(219, 234, 254, 0.7)',
        borderColor: '#93C5FD',
        borderWidth: 1.5,
        borderRadius: 8,
      },
      {
        label: 'Completed Hours',
        data: completed,
        backgroundColor: 'rgba(37, 99, 235, 0.85)',
        borderColor: '#2563EB',
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#64748B', font: { size: 11, family: 'Inter' } }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1E293B',
        bodyColor: '#64748B',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12,
      }
    },
    scales: {
      x: { ticks: { color: '#64748B', font: { family: 'Inter', size: 10 } }, grid: { color: 'rgba(226, 232, 240, 0.6)' } },
      y: { ticks: { color: '#64748B', font: { family: 'Inter', size: 10 } }, grid: { color: 'rgba(226, 232, 240, 0.6)' } }
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
          'rgba(37, 99, 235, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(34, 197, 94, 0.85)',
          'rgba(56, 189, 248, 0.85)',
        ],
        borderColor: '#FFFFFF',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1200,
      animateRotate: true,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#64748B', font: { size: 11, family: 'Inter' } }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}

export function MonthlyProgressChart() {
  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Monthly Accuracy Trend %',
        data: [65, 74, 82, 88],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#38BDF8',
        pointRadius: 5,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#64748B', font: { size: 11, family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#64748B' }, grid: { color: 'rgba(226, 232, 240, 0.6)' } },
      y: { ticks: { color: '#64748B' }, grid: { color: 'rgba(226, 232, 240, 0.6)' } }
    }
  };

  return <Line data={data} options={options} />;
}
