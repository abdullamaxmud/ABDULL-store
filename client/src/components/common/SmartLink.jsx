import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Router <Link> for pages on this site ("/shop"), a normal new-tab <a> for
 * outside addresses ("https://..."). Admin-entered links can be either.
 */
const SmartLink = ({ to, children, ...rest }) =>
  /^https?:\/\//i.test(to || '') ? (
    <a href={to} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  ) : (
    <Link to={to || '/'} {...rest}>
      {children}
    </Link>
  );

export default SmartLink;
