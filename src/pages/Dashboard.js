import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

function Dashboard() {
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState('');

  const signOut = () => {
    googleLogout();
    navigate('/');
  };

  const createTest = () => {
    const testId = 'test_' + Math.random().toString(36).substr(2, 9);
    const newShareUrl = window.location.origin + '/take-test/' + testId;
    setShareUrl(newShareUrl);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Copied the link: ' + shareUrl);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome, User!</h2>
        <p className="mb-4">Create your TrueMBTI test and share it with friends and family.</p>
        <button onClick={createTest} className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700">
          Create New Test
        </button>
      </div>

      {shareUrl && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Share your test</h3>
          <p className="mb-2">Send this link to your friends and family:</p>
          <input type="text" value={shareUrl} readOnly className="w-full p-2 border rounded mb-2" />
          <button onClick={copyShareLink} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Copy Link
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Your TrueMBTI Results</h3>
        <p className="text-gray-600">No results yet. Share your test with others to get started!</p>
      </div>

      <button onClick={signOut} className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Sign Out
      </button>
    </div>
  );
}

export default Dashboard;