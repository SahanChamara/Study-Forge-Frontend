import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';

export const PracticePage: React.FC = () => {
  return (
    <section>
      <header className="page-header">
        <div>
          <div className="eyebrow">HANDS-ON LABS</div>
          <h1>Practice Queue</h1>
          <p>Executable lab tasks with command verification and proof submission.</p>
        </div>
      </header>

      <EmptyState
        icon="⚡"
        title="Practice queue is clear"
        description="Hands-on practice tasks are associated with specific topics. Open an active topic workspace to add and execute lab exercises."
      />
    </section>
  );
};
