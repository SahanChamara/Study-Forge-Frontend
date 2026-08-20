import React from 'react';

export type LearningStatusType =
  | 'not_started'
  | 'learning'
  | 'practicing'
  | 'review_due'
  | 'review'
  | 'mastered'
  | 'blocked';

export interface StatusPillProps {
  status: LearningStatusType;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const defaultStatusLabels: Record<LearningStatusType, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  practicing: 'Practicing',
  review_due: 'Review Due',
  review: 'In Review',
  mastered: 'Mastered',
  blocked: 'Blocked',
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const displayLabel = label || defaultStatusLabels[status] || status;
  const statusKey = status === 'review' ? 'review_due' : status;

  return (
    <span className={`status-pill status-${statusKey} status-pill-${size} ${className}`}>
      {showDot && <span className="status-dot" aria-hidden="true" />}
      <span className="status-label">{displayLabel}</span>
    </span>
  );
};
