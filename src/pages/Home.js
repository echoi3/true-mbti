import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';

function Home() {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${codeResponse.access_token}` },
        });

        // Store user data in Supabase
        const { data: userData, error } = await supabase
          .from('users')
          .upsert({
            google_id: data.sub,
            email: data.email,
            name: data.name,
            avatar_url: data.picture,
            created_at: new Date().toISOString(),
          }, { onConflict: 'google_id' });

        if (error) {
          console.error('Error storing user data:', error);
        } else {
          console.log('User data stored successfully:', userData);
        }

        navigate('/dashboard');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    onError: (error) => console.log('Login Failed:', error),
    flow: 'implicit',
  });

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to TrueMBTI</h2>
        <p className="mb-6 text-center">Sign in with Google to get started:</p>
        <button
          onClick={() => login()}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Home;