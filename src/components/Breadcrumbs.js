import React from 'react';
import { Link } from 'react-router-dom';
import withBreadcrumbs from 'react-router-breadcrumbs-hoc';
import { FormattedMessage } from 'react-intl';

const routes = [
  { path: '/', breadcrumb: 'Home' },
  { path: '/signup', breadcrumb: 'Sign Up' },
  { path: '/dashboard', breadcrumb: 'Dashboard' },
  { path: '/mbti-test/:uniqueId', breadcrumb: 'MBTI Test' },
];

const Breadcrumbs = ({ breadcrumbs }) => (
  <nav className="text-sm text-gray-500 mb-4">
    {breadcrumbs.map(({ breadcrumb, match }, index) => (
      <span key={match.url}>
        <Link to={match.url}>
          <FormattedMessage id={`breadcrumb.${breadcrumb}`} defaultMessage={breadcrumb} />
        </Link>
        {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
      </span>
    ))}
  </nav>
);

export default withBreadcrumbs(routes)(Breadcrumbs);