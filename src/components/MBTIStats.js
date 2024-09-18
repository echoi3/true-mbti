import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FormattedMessage } from 'react-intl';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MBTIStats = () => {
  const [totalTests, setTotalTests] = useState(0);
  const [distribution, setDistribution] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const mbtiResultsRef = collection(db, 'mbtiResults');
        const snapshot = await getDocs(mbtiResultsRef);
        let testCount = snapshot.size;
        const mbtiCounts = {};

        snapshot.forEach(doc => {
          const resultData = doc.data();
          if (resultData.result) {
            mbtiCounts[resultData.result] = (mbtiCounts[resultData.result] || 0) + 1;
          }
        });

        setTotalTests(testCount);
        setDistribution(mbtiCounts);
      } catch (error) {
        console.error('Error fetching MBTI stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  const sortedDistribution = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  const chartData = {
    labels: Object.keys(sortedDistribution),
    datasets: [
      {
        label: 'MBTI Distribution',
        data: Object.values(sortedDistribution),
        backgroundColor: 'rgba(99, 102, 241, 0.6)', // Indigo color
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        left: 15,
        right: 25,
        top: 10,
        bottom: 10
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.x} tests`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Number of Tests',
          font: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 14,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">
        <FormattedMessage id="home.mbtiStats.title" defaultMessage="MBTI Test Statistics" />
      </h2>
      <div className="bg-indigo-50 rounded-lg p-4 mb-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl font-bold text-indigo-600 mb-2">{totalTests}</p>
          <p className="text-sm text-indigo-800">
            <FormattedMessage id="home.mbtiStats.totalTests" defaultMessage="Total tests submitted" />
          </p>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-4 text-center">
        <FormattedMessage id="home.mbtiStats.distribution" defaultMessage="MBTI Distribution" />
      </h3>
      <div className="h-[500px] mb-4">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MBTIStats;