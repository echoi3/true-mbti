import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit, doc, updateDoc, arrayUnion, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useIntl, FormattedMessage } from 'react-intl';

const questions = [
  // E/I questions
  { id: 1, text: { en: "When attending a party, [FIRST_NAME] typically spends more time talking to new people than chatting with close friends.", ko: "파티에 참석할 때, [FIRST_NAME]님은 보통 친한 친구들과 대화하는 것보다 새로운 사람들과 대화하는 데 더 많은 시간을 보냅니다." }, category: "E" },
  { id: 2, text: { en: "In group discussions, [FIRST_NAME] is often one of the first to speak up and share ideas.", ko: "그룹 토론에서 [FIRST_NAME]님은 종종 가장 먼저 의견을 내고 아이디어를 공유하는 사람 중 하나입니다." }, category: "E" },
  { id: 3, text: { en: "When traveling, [FIRST_NAME] prefers to strike up conversations with strangers rather than keep to themselves.", ko: "여행할 때, [FIRST_NAME]님은 혼자 있기보다는 낯선 사람들과 대화 하는 것을 선호합니다." }, category: "E" },
  { id: 4, text: { en: "[FIRST_NAME] feels more productive when working in a bustling office environment compared to a quiet, private space.", ko: "[FIRST_NAME]님은 조용하고 개인적인 공간보다 팀원들이 모여있는 사무실 환경에서 일할 때 더 생산적이라고 느낍니다." }, category: "E" },
  { id: 5, text: { en: "After a long day of social interactions, [FIRST_NAME] feels energized rather than drained.", ko: "하루 종일 사교적인 활동을 한 후, [FIRST_NAME]님은 지치기보다는 오히려 활력을 느낍니다." }, category: "E" },
  { id: 6, text: { en: "[FIRST_NAME] prefers to spend weekends engaged in solitary activities rather than attending social events.", ko: "[FIRST_NAME]님은 주말에 사교 모임에 참석하기보다는 혼자 하는 활동에 참여하는 것을 선호합니다." }, category: "I" },
  { id: 7, text: { en: "In meetings, [FIRST_NAME] tends to listen and observe more than actively participate in discussions.", ko: "회의에서 [FIRST_NAME]님은 적극적으로 토론에 참여하기보다는 듣고 관찰하는 경향이 있습니다." }, category: "I" },
  { id: 8, text: { en: "[FIRST_NAME] finds it more comfortable to express thoughts and feelings through writing rather than verbal communication.", ko: "[FIRST_NAME]님은 말로 의사소통하는 것보다 글로 생각과 감정을 표현하는 것이 더 편합니다." }, category: "I" },
  { id: 9, text: { en: "When faced with a problem, [FIRST_NAME] prefers to think it through alone before discussing it with others.", ko: "문제에 직면했을 때, [FIRST_NAME]님은 다른 사람들과 논의하기 전에 혼자 생각을 정리하는 것을 선호합니다." }, category: "I" },
  { id: 10, text: { en: "[FIRST_NAME] feels more recharged after spending an evening alone rather than at a social gathering.", ko: "[FIRST_NAME]님은 사교 모임에 참석한 후보다 혼자 보낸 저녁 시간 후에 더 재충전된 느낌을 받습니다." }, category: "I" },

  // N/S questions
  { id: 11, text: { en: "[FIRST_NAME] often comes up with creative solutions that others might consider unconventional or 'out of the box'.", ko: "[FIRST_NAME]님은 종종 다른 사람들이 비정통적이거나 '틀에서 벗어난' 것으로 여길 수 있는 창의적인 해결책을 제시합니다." }, category: "N" },
  { id: 12, text: { en: "When planning for the future, [FIRST_NAME] focuses more on potential opportunities than on practical realities.", ko: "미래를 계획할 때, [FIRST_NAME]님은 실제적인 현실보다는 잠재적인 기회에 더 집중합니다." }, category: "N" },
  { id: 13, text: { en: "[FIRST_NAME] enjoys discussing abstract concepts and theories more than talking about concrete facts and experiences.", ko: "[FIRST_NAME]님은 구체적인 사실과 경험에 대해 이야기하는 것보다 추상적인 개념과 이론에 대해 토론하는 것을 더 즐깁니다." }, category: "N" },
  { id: 14, text: { en: "When reading a story, [FIRST_NAME] is more likely to imagine plot twists beyond what's written than focus on explicitly described events.", ko: "이야기를 읽을 때, [FIRST_NAME]님은 명시적으로 묘사된 사건에 집중하기보다는 글에 쓰여진 것 이상의 스토리 반전을 상상하는 경향이 있습니다." }, category: "N" },
  { id: 15, text: { en: "[FIRST_NAME] is more interested in exploring new, innovative ideas than perfecting existing methods.", ko: "[FIRST_NAME]님은 기존 방법을 완벽하게 하는 것보다 새롭고 혁신적인 아이디어를 탐구하는 데에 더 관심이 있습니다." }, category: "N" },
  { id: 16, text: { en: "When explaining a concept, [FIRST_NAME] prefers to use specific examples and facts rather than metaphors or analogies.", ko: "개념을 설명할 때, [FIRST_NAME]님은 은유나 비유보다는 구체적인 예시와 사실을 사용하는 것을 선호합니다." }, category: "S" },
  { id: 17, text: { en: "[FIRST_NAME] tends to trust information from personal experience more than theoretical possibilities.", ko: "[FIRST_NAME]님은 이론적 가능성보다 개인적 경험에서 얻은 정보를 더 신뢰하는 경향이 있습니다." }, category: "S" },
  { id: 18, text: { en: "When working on a project, [FIRST_NAME] focuses more on the immediate, practical steps than the overall concept or vision.", ko: "프로젝트를 진행할 때, [FIRST_NAME]님은 전체인 개념이나 비전보다 즉각적이고 실용적인 단계에 더 집중합니다." }, category: "S" },
  { id: 19, text: { en: "[FIRST_NAME] prefers jobs and hobbies that produce tangible results over those that involve abstract thinking.", ko: "[FIRST_NAME]님은 추상적 사고를 필요로 하는 일보다 실체적인 결과를 만들어내는 직업과 취미를 선호합니다." }, category: "S" },
  { id: 20, text: { en: "When learning a new skill, [FIRST_NAME] prefers hands-on practice to reading about theories and concepts.", ko: "새로운 기술을 배울 때, [FIRST_NAME]님은 이론과 개념에 대해 읽는 것보다 직접 실습하는 것을 선호합니다." }, category: "S" },

  // T/F questions
  { id: 21, text: { en: "When making important decisions, [FIRST_NAME] prioritizes logical analysis over personal feelings or values.", ko: "중요한 결정을 내릴 때, [FIRST_NAME]님은 개인적인 감정이나 가치보다 논리적 분석을 우선시합니다." }, category: "T" },
  { id: 22, text: { en: "In a debate, [FIRST_NAME] is more concerned with finding the objective truth than maintaining harmony in the group.", ko: "토론에서 [FIRST_NAME]님은 그룹의 조화를 유지하는 것보다 객관적 진실을 찾는 것에 더 관심이 있습니다." }, category: "T" },
  { id: 23, text: { en: "[FIRST_NAME] tends to give more weight to statistical data than personal testimonials when forming opinions.", ko: "[FIRST_NAME]님은 의견을 형성할 때 개인적인 증언보다 통계 데이터에 더 큰 비중을 두는 경향이 있습니다." }, category: "T" },
  { id: 24, text: { en: "When giving feedback, [FIRST_NAME] focuses more on pointing out logical inconsistencies than on how the person might feel.", ko: "상대에게 피드백을 줄 때, [FIRST_NAME]님은 상대방의 감정보다는 논리적인 모순을 언급하는 데에 더 집중합니다." }, category: "T" },
  { id: 25, text: { en: "[FIRST_NAME] believes that the most fair way to make decisions is to remove all personal biases and emotions.", ko: "[FIRST_NAME]님은 결정을 내리는 가장 공정한 방법은 모든 개인적 편견과 감정을 제거하는 것이라고 믿습니다." }, category: "T" },
  { id: 26, text: { en: "When a friend is upset, [FIRST_NAME]'s first instinct is to offer emotional support rather than solutions to the problem.", ko: "친구가 화가 났을 때, [FIRST_NAME]님의 첫 번째 본능은 문제에 대한 해결책을 제시하기보다는 정서적 지지를 제공하는 것입니다." }, category: "F" },
  { id: 27, text: { en: "[FIRST_NAME] often makes decisions based on what feels right, even if it contradicts logical analysis.", ko: "[FIRST_NAME]님은 논리적 분석과 모순되더라도 종종 옳다고 느껴지는 것에 기반하여 결정을 내립니다." }, category: "F" },
  { id: 28, text: { en: "In conflicts, [FIRST_NAME] is more concerned about maintaining good relationships than determining who is objectively right.", ko: "갈등 상황에서 [FIRST_NAME]님은 누가 객관적으로 옳은지 판단하는 것보다 좋은 관계를 유지하는 것에 더 관심이 있습니다." }, category: "F" },
  { id: 29, text: { en: "[FIRST_NAME] is often described by others as empathetic and in tune with people's emotions.", ko: "[FIRST_NAME]님은 종종 다른 사람들에 의해 공감적이고 사람들의 감정에 잘 맞춰준다고 묘사됩니다." }, category: "F" },
  { id: 30, text: { en: "When evaluating a situation, [FIRST_NAME] considers how it will affect people's feelings as much as the practical outcomes.", ko: "상황을 평가할 때, [FIRST_NAME]님은 실용적인 결과만큼이나 사람들의 감정에 어떤 영향을 미칠지 고려합니다." }, category: "F" },

  // J/P questions
  { id: 31, text: { en: "[FIRST_NAME] prefers to have a detailed plan before starting a project, rather than figuring things out along the way.", ko: "[FIRST_NAME]님은 일을 진행하면서 상황을 파악하기보다는 프로젝트를 시작하기 전에 상세한 계획을 세우는 것을 선호합니다." }, category: "J" },
  { id: 32, text: { en: "[FIRST_NAME] feels stressed when deadlines are not clearly defined or when schedules are too flexible.", ko: "[FIRST_NAME]님은 마감일이 명확하게 정해지지 않거나 일정이 너무 유연할 때 스트레스를 받습니다." }, category: "J" },
  { id: 33, text: { en: "When packing for a trip, [FIRST_NAME] prepares well in advance and follows a checklist.", ko: "여행을 위해 짐을 쌀 때, [FIRST_NAME]님은 미리 잘 준비하고 체크리스트를 작성합니다." }, category: "J" },
  { id: 34, text: { en: "[FIRST_NAME] prefers to have a structured daily routine rather than deciding what to do spontaneously.", ko: "[FIRST_NAME]님은 즉흥적으로 무엇을 할지 결정하기보다는 구조화된 일상 루틴을 갖는 것을 선호합니다." }, category: "J" },
  { id: 35, text: { en: "In group projects, [FIRST_NAME] often takes on the role of organizer, creating timelines and assigning tasks.", ko: "그룹 프로젝트에서 [FIRST_NAME]님은 종종 일정을 만들고 멤버들에게 업무를 할당하는 역할을 맡습니다." }, category: "J" },
  { id: 36, text: { en: "[FIRST_NAME] enjoys leaving room in their schedule for unexpected opportunities or last-minute plans.", ko: "[FIRST_NAME]님은 예상치 못한 기회나 즉흥적인 계획을 위해 일정에 여유를 두는 것을 즐깁니다." }, category: "P" },
  { id: 37, text: { en: "When working on a project, [FIRST_NAME] prefers to keep options open and make changes as new information comes in.", ko: "프로젝트를 진행할 때, [FIRST_NAME]님은 옵션을 열어두고 새로운 정보가 들어오면 변경을 하는 것을 선호합니다." }, category: "P" },
  { id: 38, text: { en: "[FIRST_NAME] finds strict deadlines and detailed schedules to be more constraining than helpful.", ko: "[FIRST_NAME]님은 엄격한 마감일과 상세한 일정이 도움이 되기보다는 제약이 된다고 생각합니다." }, category: "P" },
  { id: 39, text: { en: "When faced with a decision, [FIRST_NAME] prefers to keep exploring options rather than settling on a choice quickly.", ko: "결정을 내려야 할 때, [FIRST_NAME]님은 빠르게 결정을 하기보다는 계속해서 옵션을 탐색하는 것을 선호합니다." }, category: "P" },
  { id: 40, text: { en: "[FIRST_NAME] is comfortable starting a project without knowing exactly how it will turn out.", ko: "[FIRST_NAME]님은 정확히 어떻게 될지 모르더라도 프로젝트를 시작하는 것에 편안함을 느낍니다." }, category: "P" }
];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function MbtiTest() {
  const intl = useIntl();
  const { uniqueId } = useParams();
  const [userId, setUserId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [mbtiResult, setMbtiResult] = useState('');
  const [mbtiDistribution, setMbtiDistribution] = useState(null);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('User');
  const [direction, setDirection] = useState(1);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const TOTAL_QUESTIONS = questions.length;

  const getAnswerLabel = (value) => {
    switch (value) {
      case 1: return 'test.stronglyDisagree';
      case 2: return 'test.disagree';
      case 3: return 'test.slightlyDisagree';
      case 4: return 'test.neutral';
      case 5: return 'test.slightlyAgree';
      case 6: return 'test.agree';
      case 7: return 'test.stronglyAgree';
      default: return 'test.neutral';
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uniqueId', '==', uniqueId), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserId(userDoc.id);
          setUserName(userData.name ? userData.name.split(' ')[0] : 'User');
        } else {
          setError('Invalid or expired test link. Please request a new link.');
        }
      } catch (error) {
        setError('An error occurred while loading the test. Please try again later.');
      }
    };
    fetchUserData();
  }, [uniqueId]);

  useEffect(() => {
    setShuffledQuestions(shuffleArray([...questions]));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const handleAnswer = async (value) => {
    const newAnswers = { ...answers, [shuffledQuestions[currentQuestion].id]: value };
    setAnswers(newAnswers);

    if (currentQuestion === shuffledQuestions.length - 1) {
      await calculateMBTI(newAnswers);
    } else {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateMBTI();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateMBTI = async (finalAnswers) => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    shuffledQuestions.forEach(q => {
      const answer = finalAnswers[q.id];
      const category = q.category;
      const oppositeCategory = category === 'E' ? 'I' : category === 'S' ? 'N' : category === 'T' ? 'F' : 'P';
      
      if (answer === 7) scores[category] += 3;
      else if (answer === 6) scores[category] += 2;
      else if (answer === 5) scores[category] += 1;
      else if (answer === 3) scores[oppositeCategory] += 1;
      else if (answer === 2) scores[oppositeCategory] += 2;
      else if (answer === 1) scores[oppositeCategory] += 3;
    });

    const calculatePreference = (a, b) => {
      const totalPoints = scores[a] + scores[b];
      const aPercentage = Math.round((scores[a] / totalPoints) * 100);
      return { preference: aPercentage >= 50 ? a : b, aPercentage };
    };
    
    const ei = calculatePreference('E', 'I');
    const sn = calculatePreference('N', 'S');
    const tf = calculatePreference('T', 'F');
    const jp = calculatePreference('J', 'P');
    
    const result = ei.preference + sn.preference + tf.preference + jp.preference;
    const distribution = {
      EI: ei.aPercentage,
      NS: sn.aPercentage,
      TF: tf.aPercentage,
      JP: jp.aPercentage
    };

    setMbtiResult(result);
    setMbtiDistribution(distribution);
    setTestCompleted(true);

    try {
      const updateSuccess = await updateUserMBTI(result, distribution);
      if (updateSuccess) {
        await sendEmailNotification(userId, userName);
      } else {
        setError('An error occurred while saving your results. Please try again later or contact support.');
      }
    } catch (error) {
      setError('An error occurred while processing your results. Please try again later or contact support.');
    }
  };

  const updateUserMBTI = async (result, distribution) => {
    if (!userId) {
      return false;
    }

    const testResult = {
      result: result,
      distribution: distribution,
      takenAt: new Date().toISOString(),
      takenBy: uniqueId,
      userId: userId
    };

    const mbtiResultsRef = collection(db, 'mbtiResults');
    
    try {
      // Add the result to the mbtiResults collection
      await addDoc(mbtiResultsRef, testResult);

      // Try to update the user document
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          let newAverageMBTI = result;
          let newAverageDistribution = { ...distribution };

          if (userData.mbtiResults && userData.mbtiResults.length > 0) {
            const totalTests = userData.mbtiResults.length + 1;
            const oldAverage = userData.averageDistribution || distribution;
            
            for (let key in newAverageDistribution) {
              newAverageDistribution[key] = (oldAverage[key] * (totalTests - 1) + distribution[key]) / totalTests;
            }

            newAverageMBTI = 
              (newAverageDistribution.EI > 50 ? 'E' : 'I') +
              (newAverageDistribution.NS > 50 ? 'N' : 'S') +
              (newAverageDistribution.TF > 50 ? 'T' : 'F') +
              (newAverageDistribution.JP > 50 ? 'J' : 'P');
          }

          const updateData = {
            mbtiResults: arrayUnion(testResult),
            averageMBTI: newAverageMBTI,
            averageDistribution: newAverageDistribution
          };

          await updateDoc(userRef, updateData);
        } else {
          console.log('User document not found, but MBTI result was saved');
        }
      } catch (userUpdateError) {
        console.error('Error updating user document:', userUpdateError);
        console.log('MBTI result was saved, but user document could not be updated');
      }

      return true;
    } catch (error) {
      console.error('Error saving MBTI result:', error);
      return false;
    }
  };

  const sendEmailNotification = async (userId, testTakerName) => {
    try {
      const functions = getFunctions();
      const sendEmail = httpsCallable(functions, 'sendEmailNotification');
      await sendEmail({ userId, testTakerName });
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (!testCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-xl md:text-3xl font-bold text-indigo-600 mb-6 text-center">
          <FormattedMessage id="test.title" values={{ firstName: userName }} />
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <FormattedMessage
              id="test.question"
              values={{ number: currentQuestion + 1, total: TOTAL_QUESTIONS }}
            />
            <span>
              {Math.round(((currentQuestion + 1) / TOTAL_QUESTIONS) * 100)}% complete
            </span>
          </div>
          <div className="mb-4 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${((currentQuestion + 1) / TOTAL_QUESTIONS) * 100}%` }}
            ></div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="bg-indigo-50 rounded-lg p-6 mb-8">
                <p className="text-xl font-semibold text-indigo-800 mb-6">
                  {shuffledQuestions[currentQuestion].text[intl.locale].replace('[FIRST_NAME]', userName)}
                </p>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      className={`w-full py-3 px-4 rounded-lg text-lg transition-colors duration-200 flex justify-between items-center ${
                        answers[shuffledQuestions[currentQuestion].id] === value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-800 hover:bg-indigo-100'
                      }`}
                      title={intl.formatMessage({ id: getAnswerLabel(value) })}
                    >
                      <FormattedMessage id={getAnswerLabel(value)} />
                      <span className="text-sm opacity-70">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-6">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 rounded-lg ${
                currentQuestion === 0 ? 'bg-gray-300 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Previous
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-indigo-100 to-purple-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-center mb-6">
            <FormattedMessage id="result.title1" values={{ name: userName }} />
          </h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center mb-6"
          >
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-6xl">🧠</span>
            </div>
            <h2 className="text-3xl font-semibold text-teal-600 mb-2">
              <FormattedMessage id={`result.type.${mbtiResult.toLowerCase()}`} />
            </h2>
            <p className="text-2xl font-bold">
              <FormattedMessage id={`result.code.${mbtiResult.toLowerCase()}`} />
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4 mb-8"
          >
            {renderDistributionBar('result.extroverted', 'result.introverted', mbtiDistribution.EI, 'E', 'I')}
            {renderDistributionBar('result.intuitive', 'result.observant', mbtiDistribution.NS, 'N', 'S')}
            {renderDistributionBar('result.thinking', 'result.feeling', mbtiDistribution.TF, 'T', 'F')}
            {renderDistributionBar('result.judging', 'result.prospecting', mbtiDistribution.JP, 'J', 'P')}
          </motion.div>
          <p className="text-center text-gray-600 mb-6">
            <FormattedMessage id="result.thankYou" values={{ name: userName }} />
          </p>
          <div className="flex justify-center">
            <a
              href="/signup"
              className="bg-indigo-600 text-white rounded-md px-6 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <FormattedMessage id="result.signUp" />
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  function renderDistributionBar(leftLabelId, rightLabelId, percentage, leftLetter, rightLetter) {
    const leftPercentage = parseFloat(percentage).toFixed(1);
    const rightPercentage = (100 - parseFloat(percentage)).toFixed(1);
    const isLeftDominant = parseFloat(leftPercentage) > 50;
    const dominantPercentage = isLeftDominant ? leftPercentage : rightPercentage;

    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold">
            <FormattedMessage id={leftLabelId} />
          </span>
          <span className="font-semibold">
            <FormattedMessage id={rightLabelId} />
          </span>
        </div>
        <div className="flex h-8 rounded-full overflow-hidden relative">
          <div 
            className="bg-indigo-400 transition-all duration-500 ease-out flex items-center justify-center"
            style={{width: `${leftPercentage}%`}}
          >
            {isLeftDominant && (
              <span className="absolute text-xs font-bold text-white z-10">{dominantPercentage}%</span>
            )}
          </div>
          <div 
            className="bg-purple-400 transition-all duration-500 ease-out flex items-center justify-center"
            style={{width: `${rightPercentage}%`}}
          >
            {!isLeftDominant && (
              <span className="absolute text-xs font-bold text-white z-10">{dominantPercentage}%</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">MBTI Test for {userName}</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <p className="mb-4 text-lg">{shuffledQuestions[currentQuestion].text[intl.locale].replace('[FIRST_NAME]', userName)}</p>
        <div className="flex justify-between items-center">
          <span><FormattedMessage id="test.stronglyDisagree" /></span>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                onClick={() => handleAnswer(value)}
                className={`w-8 h-8 rounded-full ${
                  answers[shuffledQuestions[currentQuestion].id] === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 hover:bg-indigo-200'
                }`}
                title={intl.formatMessage({ id: getAnswerLabel(value) })}
              >
                <FormattedMessage id={getAnswerLabel(value)} />
              </button>
            ))}
          </div>
          <span><FormattedMessage id="test.stronglyAgree" /></span>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <FormattedMessage
            id="test.question"
            values={{ number: currentQuestion + 1, total: shuffledQuestions.length }}
          />
          <span>.</span>
          <span>
            {Math.round(((currentQuestion + 1) / shuffledQuestions.length) * 100)}% complete
          </span>
        </div>
      </div>
    </div>
  );
}

export default MbtiTest;