import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

function NotFound() {
  const intl = useIntl();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Helmet>
        <title>{intl.formatMessage({ id: 'notFound.title' })} | TrueMBTI</title>
        <meta name="description" content={intl.formatMessage({ id: 'notFound.description' })} />
      </Helmet>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <p className="text-2xl mb-4"><FormattedMessage id="notFound.message" /></p>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800">
          <FormattedMessage id="notFound.goHome" />
        </Link>
      </div>
    </div>
  );
}

export default NotFound;