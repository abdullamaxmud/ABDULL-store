import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = '🛍️',
  title = 'Nothing here yet',
  description = 'Explore our catalog and find something extraordinary.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-active)',
        margin: '24px 0',
      }}
    >
      <div
        style={{
          fontSize: '3.5rem',
          marginBottom: '16px',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          maxWidth: '420px',
          marginBottom: '24px',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
