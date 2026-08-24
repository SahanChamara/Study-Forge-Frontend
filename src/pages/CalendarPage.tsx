import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';

interface StudyEvent {
  id: string;
  time: string;
  duration: string;
  title: string;
  path: string;
  type: 'learning' | 'practicing' | 'review_due' | 'mastered';
}

const mockEvents: StudyEvent[] = [
  {
    id: 'evt-1',
    time: '09:00 - 10:00 AM',
    duration: '60 min',
    title: 'Linux Kernel Subsystems & Syscalls',
    path: 'Linux for DevOps',
    type: 'learning',
  },
  {
    id: 'evt-2',
    time: '11:30 - 12:15 PM',
    duration: '45 min',
    title: 'File Permissions & ACLs Terminal Lab',
    path: 'Linux for DevOps',
    type: 'practicing',
  },
  {
    id: 'evt-3',
    time: '03:00 - 03:30 PM',
    duration: '30 min',
    title: 'Spaced Recall Review: File Descriptors',
    path: 'Linux for DevOps',
    type: 'review_due',
  },
];

export const CalendarPage: React.FC = () => {
  const [viewMode, setViewMode] = useState('week');

  return (
    <div className="study-calendar-view animate-fade-in">
      <PageHeader
        eyebrow="STUDY SCHEDULE"
        title="Study Calendar"
        description="Plan and structure your focused technical learning blocks, practice labs, and spaced reviews."
        actions={
          <div className="calendar-header-actions">
            <SegmentedControl
              options={[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
              ]}
              value={viewMode}
              onChange={setViewMode}
              size="sm"
            />
            <Button variant="primary" size="sm" leftIcon="➕">
              Schedule Session
            </Button>
          </div>
        }
      />

      <div className="calendar-schedule-grid">
        <div className="calendar-upcoming-column">
          <h3>Today&apos;s Planned Sessions</h3>
          <div className="calendar-events-stack">
            {mockEvents.map((evt) => (
              <Card key={evt.id} className="calendar-event-card" interactive>
                <CardBody>
                  <div className="event-card-top">
                    <span className="event-time-badge">⏱️ {evt.time}</span>
                    <StatusPill status={evt.type} size="sm" />
                  </div>
                  <strong className="event-title">{evt.title}</strong>
                  <span className="event-path-name">{evt.path}</span>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="calendar-overview-card">
          <Card>
            <CardBody>
              <div className="calendar-mini-month">
                <h3>August 2026</h3>
                <div className="mini-month-grid">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i} className="mini-day-header">{d}</span>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const isToday = day === 24;
                    const hasEvent = [20, 21, 24, 25, 28].includes(day);
                    return (
                      <div
                        key={day}
                        className={`mini-day-cell ${isToday ? 'is-today' : ''} ${hasEvent ? 'has-event' : ''}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
