import React from 'react';
import { Helmet } from 'react-helmet';
import SignUpButton from '../components/SignUpButton';
import HowItWorks from '../components/HowItWorks';
import MBTIDistribution from '../components/MBTIDistribution';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { FormattedMessage, useIntl } from 'react-intl';

function Home() {
  const intl = useIntl();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100">
      <Helmet>
        <title>{intl.formatMessage({ id: 'home.title' })} | TrueMBTI</title>
        <meta name="description" content={intl.formatMessage({ id: 'home.description' })} />
        <link rel="canonical" href="https://www.truembti.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TrueMBTI",
            "url": "https://www.truembti.com",
            "description": "Discover your true MBTI personality type through the eyes of your friends and family",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.truembti.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-6 whitespace-pre-line">
            <FormattedMessage id="home.title" />
          </h1>
          <p className="mt-3 text-xl text-gray-600 sm:mt-5 sm:text-2xl max-w-2xl mx-auto">
            <FormattedMessage id="home.description" />
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <SignUpButton />
            </div>
          </div>
        </div>
        
        <HowItWorks />
      </div>
    </div>
  );
}

export default Home;