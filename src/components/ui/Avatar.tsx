import React from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'learning' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Learner',
  size = 'md',
  status,
  className = '',
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return n.charAt(0).toUpperCase() || 'U';
  };

  const initials = getInitials(name);

  return (
    <div className={`avatar-container avatar-${size} ${className}`} title={name}>
      {src ? (
        <img src={src} alt={name} className="avatar-img" />
      ) : (
        <span className="avatar-initials" aria-label={name}>
          {initials}
        </span>
      )}
      {status && <span className={`avatar-status-badge status-${status}`} aria-hidden="true" />}
    </div>
  );
};
