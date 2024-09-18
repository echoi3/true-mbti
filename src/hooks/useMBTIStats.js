import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const useMBTIStats = () => {
  const [totalTests, setTotalTests] = useState(0);
  const [distribution, setDistribution] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchStats();
  }, []);

  return { totalTests, distribution, isLoading, refetchStats: fetchStats };
};

export default useMBTIStats;