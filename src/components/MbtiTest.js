import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion } from 'framer-motion';

const questions = [
  { id: 1, text: "[FIRST_NAME] prefers to spend time in large groups rather than one-on-one.", category: "E" },
  { id: 2, text: "[FIRST_NAME] often thinks about abstract concepts and theories.", category: "N" },
  { id: 3, text: "[FIRST_NAME] makes decisions based on logic rather than emotions.", category: "T" },
  { id: 4, text: "[FIRST_NAME] prefers to have a structured and planned approach to life.", category: "J" },
  { id: 5, text: "[FIRST_NAME] enjoys being the center of attention.", category: "E" },
  { id: 6, text: "[FIRST_NAME] is more interested in future possibilities than present realities.", category: "N" },
  { id: 7, text: "[FIRST_NAME] values objectivity over personal feelings when making decisions.", category: "T" },
  { id: 8, text: "[FIRST_NAME] likes to have a detailed plan before starting a project.", category: "J" },
  { id: 9, text: "[FIRST_NAME] prefers to recharge by spending time alone.", category: "I" },
  { id: 10, text: "[FIRST_NAME] focuses more on details and facts than on big picture concepts.", category: "S" },
  { id: 11, text: "[FIRST_NAME] considers how decisions will affect others' feelings.", category: "F" },
  { id: 12, text: "[FIRST_NAME] prefers to keep options open and be flexible.", category: "P" },
  { id: 13, text: "[FIRST_NAME] is usually quiet and reserved in social situations.", category: "I" },
  { id: 14, text: "[FIRST_NAME] prefers practical, hands-on experiences over theoretical discussions.", category: "S" },
  { id: 15, text: "[FIRST_NAME] values harmony and avoiding conflict in relationships.", category: "F" },
  { id: 16, text: "[FIRST_NAME] prefers to go with the flow rather than stick to a rigid schedule.", category: "P" },
  { id: 17, text: "[FIRST_NAME] initiates conversations with strangers easily.", category: "E" },
  { id: 18, text: "[FIRST_NAME] enjoys exploring new ideas and possibilities.", category: "N" },
  { id: 19, text: "[FIRST_NAME] prefers to analyze problems logically.", category: "T" },
  { id: 20, text: "[FIRST_NAME] likes to have things settled and decided.", category: "J" },
  { id: 21, text: "[FIRST_NAME] finds it draining to be in social situations for extended periods.", category: "I" },
  { id: 22, text: "[FIRST_NAME] prefers to focus on concrete facts and details.", category: "S" },
  { id: 23, text: "[FIRST_NAME] often makes decisions based on gut feelings.", category: "F" },
  { id: 24, text: "[FIRST_NAME] enjoys spontaneity and last-minute plans.", category: "P" },
  { id: 25, text: "[FIRST_NAME] prefers written communication over verbal.", category: "I" },
  { id: 26, text: "[FIRST_NAME] is often described as a practical and down-to-earth person.", category: "S" },
  { id: 27, text: "[FIRST_NAME] tends to be empathetic and sensitive to others' emotions.", category: "F" },
  { id: 28, text: "[FIRST_NAME] prefers to finish one project before starting another.", category: "J" },
  { id: 29, text: "[FIRST_NAME] enjoys engaging in deep, meaningful conversations.", category: "N" },
  { id: 30, text: "[FIRST_NAME] prefers to work in teams rather than independently.", category: "E" }
];

function MbtiTest() {
  const { uniqueId } = useParams();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [mbtiDistribution, setMbtiDistribution] = useState(null);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user with uniqueId:', uniqueId);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uniqueId', '==', uniqueId), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          console.log('User data:', userData);
          setUserId(userDoc.id);
          setUserName(userData.name ? userData.name.split(' ')[0] : 'User'); // Set the user's first name
        } else {
          console.error('No user found with uniqueId:', uniqueId);
          setError('Invalid or expired test link. Please request a new link.');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        console.error('Error details:', error.code, error.message);
        setError('An error occurred while loading the test. Please try again later.');
      }
    };
    fetchUserData();
  }, [uniqueId]);

  if (error) {
    return <div>{error}</div>;
  }

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMBTI();
    }
  };

  const calculateMBTI = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    questions.forEach(q => {
      const answer = answers[q.id];
      const category = q.category;
      const oppositeCategory = category === 'E' ? 'I' : category === 'S' ? 'N' : category === 'T' ? 'F' : 'P';
      
      if (answer > 4) {
        scores[category] += 2;
      } else if (answer > 3) {
        scores[category] += 1;
      } else if (answer < 3) {
        scores[oppositeCategory] += 1;
      } else if (answer < 4) {
        scores[oppositeCategory] += 2;
      }
    });

    const calculatePreference = (a, b) => {
      const totalQuestions = scores[a] + scores[b];
      const preference = scores[a] > scores[b] ? a : b;
      const strength = Math.round((Math.max(scores[a], scores[b]) / totalQuestions) * 100);
      return { preference, strength };
    };

    const ei = calculatePreference('E', 'I');
    const sn = calculatePreference('S', 'N');
    const tf = calculatePreference('T', 'F');
    const jp = calculatePreference('J', 'P');

    const result = `${ei.preference}${sn.preference}${tf.preference}${jp.preference}`;
    const distribution = {
      EI: ei.preference === 'E' ? ei.strength : 100 - ei.strength,
      SN: sn.preference === 'N' ? sn.strength : 100 - sn.strength,
      TF: tf.preference === 'T' ? tf.strength : 100 - tf.strength,
      JP: jp.preference === 'J' ? jp.strength : 100 - jp.strength
    };

    setMbtiResult(result);
    setMbtiDistribution(distribution);
    updateUserMBTI(result, distribution);
  };

  const updateUserMBTI = async (result, distribution) => {
    if (userId) {
      const testResult = {
        result: result,
        distribution: distribution,
        takenAt: new Date().toISOString(),
        takenBy: uniqueId
      };

      await updateDoc(doc(db, 'users', userId), {
        mbtiResults: arrayUnion(testResult)
      });
      setTestCompleted(true);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (!testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-8 max-w-md w-full"
        >
          <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1} of {questions.length}</h2>
          <p className="mb-6">{questions[currentQuestion].text.replace('[FIRST_NAME]', userName)}</p>
          <div className="flex justify-between items-center">
            <span>Strongly Disagree</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  className={`w-8 h-8 rounded-full ${
                    answers[questions[currentQuestion].id] === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 hover:bg-indigo-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <span>Strongly Agree</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-8 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-center mb-6">{userName}'s Results</h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-4xl">🧠</span>
            </div>
            <h2 className="text-2xl font-semibold text-teal-600">{getMbtiName(mbtiResult)}</h2>
            <p className="text-xl font-bold">{mbtiResult}</p>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            {renderDistributionBar('Extroverted', 'Introverted', mbtiDistribution.EI, 'E', 'I')}
            {renderDistributionBar('Intuitive', 'Observant', mbtiDistribution.SN, 'N', 'S')}
            {renderDistributionBar('Thinking', 'Feeling', mbtiDistribution.TF, 'T', 'F')}
            {renderDistributionBar('Judging', 'Prospecting', mbtiDistribution.JP, 'J', 'P')}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  function getMbtiName(result) {
    const names = {
      'INFJ': 'Advocate',
      'INTJ': 'Architect',
      'INFP': 'Mediator',
      'INTP': 'Logician',
      'ENFJ': 'Protagonist',
      'ENTJ': 'Commander',
      'ENFP': 'Campaigner',
      'ENTP': 'Debater',
      'ISFJ': 'Defender',
      'ISTJ': 'Logistician',
      'ISFP': 'Adventurer',
      'ISTP': 'Virtuoso',
      'ESFJ': 'Consul',
      'ESTJ': 'Executive',
      'ESFP': 'Entertainer',
      'ESTP': 'Entrepreneur'
    };
    return names[result] || 'Unknown';
  }

  function renderDistributionBar(leftLabel, rightLabel, percentage, leftLetter, rightLetter) {
    const leftPercentage = percentage;
    const rightPercentage = 100 - percentage;
    const dominantSide = leftPercentage > rightPercentage ? 'left' : 'right';

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className={dominantSide === 'left' ? 'font-bold' : ''}>{leftPercentage}%</span>
          <span className={dominantSide === 'right' ? 'font-bold' : ''}>{rightPercentage}%</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div 
            className="bg-yellow-400" 
            style={{width: `${leftPercentage}%`}}
          ></div>
          <div 
            className="bg-gray-300" 
            style={{width: `${rightPercentage}%`}}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-600">
          <span>{leftLetter} - {leftLabel}</span>
          <span>{rightLetter} - {rightLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">MBTI Test for {userName}</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <p className="mb-4 text-lg">{questions[currentQuestion].text.replace('[FIRST_NAME]', userName)}</p>
        <div className="flex justify-between items-center">
          <span>Strongly Disagree</span>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(value)}
                className={`w-8 h-8 rounded-full ${
                  answers[questions[currentQuestion].id] === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 hover:bg-indigo-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <span>Strongly Agree</span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>
    </div>
  );
}

export default MbtiTest;