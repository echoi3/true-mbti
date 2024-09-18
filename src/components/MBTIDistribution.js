import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';
import { useMBTIContext } from '../contexts/MBTIContext';

const MBTIDistribution = () => {
  const [distribution, setDistribution] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { shouldRefetch } = useMBTIContext();

  const fetchDistribution = async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const mbtiCounts = {};
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.averageMBTI) {
          mbtiCounts[userData.averageMBTI] = (mbtiCounts[userData.averageMBTI] || 0) + 1;
        }
      });

      const total = Object.values(mbtiCounts).reduce((sum, count) => sum + count, 0);
      if (total > 0) {
        const distributionPercentages = Object.entries(mbtiCounts).reduce((acc, [mbti, count]) => {
          acc[mbti] = (count / total) * 100;
          return acc;
        }, {});
        setDistribution(distributionPercentages);
      } else {
        setError('No MBTI data available yet.');
      }
    } catch (error) {
      console.error('Error fetching MBTI distribution:', error);
      setError('Error fetching MBTI distribution. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistribution();
  }, [shouldRefetch]);

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">MBTI Distribution</h2>
        <p className="text-gray-600">Loading distribution data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">MBTI Distribution</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">Users' MBTI Distribution</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(distribution).map(([mbti, percentage]) => (
          <motion.div
            key={mbti}
            className="bg-indigo-50 rounded-lg p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-indigo-800">{mbti}</h3>
            <p className="text-2xl font-bold text-indigo-600">{percentage.toFixed(1)}%</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MBTIDistribution;