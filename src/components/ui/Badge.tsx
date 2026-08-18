import React, { type HTMLAttributes } from 'react';
import type { TopicStatus, MasteryLevel } from '../../types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TopicStatus | 'neutral' | 'accent' | 'mastery';
  mastery?: MasteryLevel;
  size?: 'sm' | 'md';
}

const statusLabels: Record<TopicStatus, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  practicing: 'Practicing',
  review: 'In Review',
  mastered: 'Mastered',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  mastery,
  size = 'md',
  className = '',
  ...props
}) => {
  const isMastery = variant === 'mastery' || mastery !== undefined;
  const badgeClass = isMastery ? 'badge-mastery' : `badge-${variant}`;
  const sizeClass = `badge-${size}`;

  let content = children;
  if (!content) {
    if (isMastery && mastery !== undefined) {
      content = `M${mastery}`;
    } else if (variant in statusLabels) {
      content = statusLabels[variant as TopicStatus];
    }
  }

  return (
    <span className={`badge ${badgeClass} ${sizeClass} ${className}`} {...props}>
      {content}
    </span>
  );
};
