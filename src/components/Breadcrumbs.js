import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const routes = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/signup', breadcrumb: 'Sign Up' },
  { path: '/dashboard', breadcrumb: 'Dashboard' },
  { path: '/mbti-test', breadcrumb: 'MBTI Test' },
];

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="text-sm text-gray-500 mb-4">
      <Link to="/"><FormattedMessage id="breadcrumb.Home" defaultMessage="Home" /></Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const route = routes.find(r => r.path === to);
        const isLast = index === pathnames.length - 1;

        return route ? (
          <span key={to}>
            <span className="mx-2">/</span>
            {isLast ? (
              <FormattedMessage id={`breadcrumb.${route.breadcrumb}`} defaultMessage={route.breadcrumb} />
            ) : (
              <Link to={to}>
                <FormattedMessage id={`breadcrumb.${route.breadcrumb}`} defaultMessage={route.breadcrumb} />
              </Link>
            )}
          </span>
        ) : null;
      })}
    </nav>
  );
};

export default Breadcrumbs;