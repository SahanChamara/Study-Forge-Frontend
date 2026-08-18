import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';

export const ReviewPage: React.FC = () => {
  return (
    <section>
      <header className="page-header">
        <div>
          <div className="eyebrow">RETENTION & MASTERY</div>
          <h1>Spaced Review</h1>
          <p>Active recall questions and weak-topic reinforcement to lock in mastery.</p>
        </div>
      </header>

      <EmptyState
        icon="🔄"
        title="All caught up on reviews"
        description="Topics with mastery level below 4 or scheduled recall items will appear here automatically for spaced repetition."
      />
    </section>
  );
};
