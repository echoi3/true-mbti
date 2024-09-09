import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const generateUniqueUrl = async (userId) => {
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const uniqueUrl = `${window.location.origin}/mbti-test/${uniqueId}`;
  
  // Update the user's document with the unique URL
  await updateDoc(doc(db, 'users', userId), {
    uniqueUrl: uniqueUrl,
    uniqueId: uniqueId,
    urlCreatedAt: new Date().toISOString(),
  });

  return uniqueUrl;
};