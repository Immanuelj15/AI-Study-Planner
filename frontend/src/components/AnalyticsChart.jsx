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
  const hasData = Array.isArray(weeklyData) && weeklyData.length > 0;
  const labels = hasData ? weeklyData.map((d) => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const targets = hasData ? weeklyData.map((d) => d.target || 0) : [0, 0, 0, 0, 0, 0, 0];
  const completed = hasData ? weeklyData.map((d) => d.completed || 0) : [0, 0, 0, 0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Target Hours',
        data: targets,
        backgroundColor: 'rgba(219, 234, 254, 0.8)',
        borderColor: '#93C5FD',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Completed Hours',
        data: completed,
        backgroundColor: 'rgba(37, 99, 235, 0.9)',
        borderColor: '#2563EB',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
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
      y: { min: 0, ticks: { color: '#64748B', font: { family: 'Inter', size: 10 } }, grid: { color: 'rgba(226, 232, 240, 0.6)' } }
    }
  };

  return (
    <div className="w-full h-full relative min-h-[220px]">
      <Bar data={data} options={options} />
    </div>
  );
}

export function SubjectDoughnutChart({ masteryData }) {
  const hasData = Array.isArray(masteryData) && masteryData.length > 0;
  const labels = hasData ? masteryData.map((m) => m.subject) : ['No Subjects Yet'];
  const scores = hasData ? masteryData.map((m) => m.mastery_score || 0) : [0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Mastery %',
        data: scores,
        backgroundColor: hasData
          ? [
              'rgba(37, 99, 235, 0.85)',
              'rgba(239, 68, 68, 0.85)',
              'rgba(34, 197, 94, 0.85)',
              'rgba(56, 189, 248, 0.85)',
              'rgba(139, 92, 246, 0.85)',
            ]
          : ['rgba(226, 232, 240, 0.8)'],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#64748B', font: { size: 11, family: 'Inter' } }
      }
    }
  };

  return (
    <div className="w-full h-full relative min-h-[220px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function MonthlyProgressChart({ monthlyData }) {
  const hasData = Array.isArray(monthlyData) && monthlyData.length > 0;
  const labels = hasData ? monthlyData.map((m) => m.label) : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const dataPoints = hasData ? monthlyData.map((m) => m.accuracy || 0) : [0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Accuracy Trend %',
        data: dataPoints,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#38BDF8',
        pointRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#64748B', font: { size: 11, family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: 'rgba(226, 232, 240, 0.6)' } },
      y: { min: 0, max: 100, ticks: { color: '#64748B', font: { size: 10 } }, grid: { color: 'rgba(226, 232, 240, 0.6)' } }
    }
  };

  return (
    <div className="w-full h-full relative min-h-[220px] max-h-[250px] overflow-hidden">
      <Line data={data} options={options} />
    </div>
  );
}
