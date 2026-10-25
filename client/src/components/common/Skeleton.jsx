import React from 'react';

export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style }) => {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="product-card" style={{ padding: 0 }}>
      <div className="skeleton" style={{ width: '100%', paddingTop: '100%' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SkeletonBox width="40%" height="14px" />
        <SkeletonBox width="85%" height="20px" />
        <SkeletonBox width="30%" height="16px" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <SkeletonBox width="45%" height="24px" />
          <SkeletonBox width="36px" height="36px" borderRadius="9999px" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonBox;
