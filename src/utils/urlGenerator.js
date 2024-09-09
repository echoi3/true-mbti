import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const generateUniqueUrl = async (userId) => {
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const uniqueUrl = `${window.location.origin}/mbti-test/${uniqueId}`;
  
  // Store the mapping of uniqueId to userId in Firestore
  await setDoc(doc(db, 'uniqueUrls', uniqueId), {
    userId: userId,
    createdAt: new Date().toISOString(),
  });

  // Update the user's document with the unique URL
  await updateDoc(doc(db, 'users', userId), {
    uniqueUrl: uniqueUrl
  });

  return uniqueUrl;
};