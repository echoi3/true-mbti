import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const generateUniqueUrl = async (userId) => {
  const uniqueId = Math.random().toString(36).substring(2, 15);
  const uniqueUrl = `${window.location.origin}/mbti-test/${uniqueId}`;
  
  console.log('Generating unique URL for userId:', userId);
  console.log('Generated uniqueId:', uniqueId);
  
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      uniqueUrl: uniqueUrl,
      uniqueId: uniqueId,
      urlCreatedAt: new Date().toISOString(),
    });
    console.log('User document updated successfully');
    
    // Verify the update
    const updatedDoc = await getDoc(userRef);
    console.log('Updated user document:', updatedDoc.data());
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }

  return uniqueUrl;
};