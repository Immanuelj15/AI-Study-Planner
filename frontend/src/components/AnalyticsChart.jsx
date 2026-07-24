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
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        borderColor: '#3B82F6',
        borderWidth: 1.5,
        borderRadius: 8,
      },
      {
        label: 'Completed Hours',
        data: completed,
        backgroundColor: 'rgba(6, 182, 212, 0.75)',
        borderColor: '#06B6D4',
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94A3B8', font: { size: 11, family: 'Inter' } }
      },
      tooltip: {
        backgroundColor: '#1E293B',
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 12,
      }
    },
    scales: {
      x: { ticks: { color: '#94A3B8', font: { family: 'Inter', size: 10 } }, grid: { color: 'rgba(51, 65, 85, 0.4)' } },
      y: { ticks: { color: '#94A3B8', font: { family: 'Inter', size: 10 } }, grid: { color: 'rgba(51, 65, 85, 0.4)' } }
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
          'rgba(59, 130, 246, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(139, 92, 246, 0.85)',
        ],
        borderColor: '#0F172A',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1500,
      animateRotate: true,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94A3B8', font: { size: 11, family: 'Inter' } }
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
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00E5FF',
        pointRadius: 5,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#94A3B8', font: { size: 11, family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } }
    }
  };

  return <Line data={data} options={options} />;
}
