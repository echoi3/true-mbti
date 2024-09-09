import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function MbtiTest() {
  const { uniqueId } = useParams();
  const [userId, setUserId] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uniqueId', '==', uniqueId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUserId(querySnapshot.docs[0].id);
      }
    };
    fetchUserId();
  }, [uniqueId]);

  const handleTestSubmit = async (testResult) => {
    if (userId) {
      await updateDoc(doc(db, 'users', userId), {
        mbtiResults: testResult,
        // You can add more fields or logic here to update the user's MBTI
      });
      setTestCompleted(true);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  if (testCompleted) {
    return <div>Thank you for completing the test!</div>;
  }

  return (
    <div>
      <h1>MBTI Test</h1>
      {/* Add your MBTI test questions and logic here */}
      <button onClick={() => handleTestSubmit('INTJ')}>Submit Test</button>
    </div>
  );
}

export default MbtiTest;