import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';

export const NotesPage: React.FC = () => {
  return (
    <section>
      <header className="page-header">
        <div>
          <div className="eyebrow">KNOWLEDGE BASE</div>
          <h1>Smart Notes</h1>
          <p>Structured 9-section Markdown notes tied directly to topic objectives.</p>
        </div>
      </header>

      <EmptyState
        icon="📝"
        title="No notes captured yet"
        description="Smart notes are authored inside individual topic study workspaces. Select a learning path and topic to start taking structured notes."
      />
    </section>
  );
};
