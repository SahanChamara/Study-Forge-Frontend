import React, { type HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="card skeleton-card">
    <Skeleton variant="text" width="30%" height={14} style={{ marginBottom: 12 }} />
    <Skeleton variant="text" width="70%" height={24} style={{ marginBottom: 10 }} />
    <Skeleton variant="text" width="90%" height={16} style={{ marginBottom: 6 }} />
    <Skeleton variant="text" width="50%" height={16} />
  </div>
);
