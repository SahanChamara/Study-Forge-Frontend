import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import type { LearningPath, StudyEventType, StudySessionEvent, TopicStatus } from '../types';

type CalendarViewMode = 'day' | 'week' | 'month';

// Date utility functions
const formatDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMondayOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  // Sunday is 0, we want Monday (1) as start of week
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const eventTypeConfig: Record<
  StudyEventType,
  { label: string; icon: string; badgeVariant: TopicStatus | 'accent' | 'neutral'; color: string }
> = {
  study_session: {
    label: 'Study Session',
    icon: '📖',
    badgeVariant: 'learning',
    color: 'var(--color-primary)',
  },
  practice_lab: {
    label: 'Practice Lab',
    icon: '⚡',
    badgeVariant: 'accent',
    color: 'var(--color-accent)',
  },
  review: {
    label: 'Spaced Review',
    icon: '🔄',
    badgeVariant: 'review',
    color: 'var(--color-success)',
  },
  milestone: {
    label: 'Milestone',
    icon: '🎯',
    badgeVariant: 'mastered',
    color: 'var(--color-warning)',
  },
};

const hoursList = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<StudySessionEvent[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [miniCalMonthDate, setMiniCalMonthDate] = useState<Date>(new Date());

  // Event Type filter state
  const [selectedTypes, setSelectedTypes] = useState<Set<StudyEventType>>(
    new Set<StudyEventType>(['study_session', 'practice_lab', 'review', 'milestone'])
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<StudySessionEvent | null>(null);

  // Create / Edit form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<StudyEventType>('study_session');
  const [formDate, setFormDate] = useState(formatDateKey(new Date()));
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formDuration, setFormDuration] = useState('60');
  const [formPathId, setFormPathId] = useState('');
  const [formTopicId, setFormTopicId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load calendar data
  const loadCalendarData = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventsData, pathsData] = await Promise.all([
        api<StudySessionEvent[]>('/calendar/events'),
        api<LearningPath[]>('/learning-paths'),
      ]);
      setEvents(eventsData);
      setPaths(pathsData);
      if (pathsData.length > 0 && !formPathId) {
        setFormPathId(pathsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load study calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // Filtered events based on active types
  const filteredEvents = useMemo(() => {
    return events.filter((e) => selectedTypes.has(e.type));
  }, [events, selectedTypes]);

  // Available topics for selected path in modal
  const availableTopicsForForm = useMemo(() => {
    if (!formPathId) return [];
    const selectedPath = paths.find((p) => p.id === formPathId);
    return selectedPath?.topics || [];
  }, [paths, formPathId]);

  // Set default topic when path changes
  useEffect(() => {
    if (availableTopicsForForm.length > 0 && (!formTopicId || !availableTopicsForForm.some((t) => t.id === formTopicId))) {
      setFormTopicId(availableTopicsForForm[0].id);
    }
  }, [availableTopicsForForm, formTopicId]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
      setSelectedDate(d);
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
      setSelectedDate(d);
    } else if (viewMode === 'month') {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      setCurrentDate(d);
      setMiniCalMonthDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
      setSelectedDate(d);
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
      setSelectedDate(d);
    } else if (viewMode === 'month') {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      setCurrentDate(d);
      setMiniCalMonthDate(d);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setMiniCalMonthDate(today);
  };

  // Toggle event type filter
  const handleToggleTypeFilter = (type: StudyEventType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) {
          next.delete(type);
        }
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Open create modal with prefilled date/time
  const handleOpenCreateModal = (dateStr?: string, timeStr?: string) => {
    setFormDate(dateStr || formatDateKey(selectedDate));
    setFormStartTime(timeStr || '09:00');
    setFormTitle('');
    setFormDuration('60');
    setFormNotes('');
    setFormType('study_session');
    if (paths.length > 0) {
      setFormPathId(paths[0].id);
      if (paths[0].topics && paths[0].topics.length > 0) {
        setFormTopicId(paths[0].topics[0].id);
      }
    }
    setIsCreateModalOpen(true);
  };

  // Submit create event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedPath = paths.find((p) => p.id === formPathId);
      const selectedTopic = selectedPath?.topics?.find((t) => t.id === formTopicId);

      const durationMinutes = Number(formDuration) || 60;
      const [startH, startM] = formStartTime.split(':').map(Number);
      const endTotalMins = (startH || 9) * 60 + (startM || 0) + durationMinutes;
      const endH = Math.floor(endTotalMins / 60) % 24;
      const endM = endTotalMins % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      const created = await api<StudySessionEvent>('/calendar/events', {
        method: 'POST',
        body: JSON.stringify({
          title: formTitle,
          type: formType,
          date: formDate,
          startTime: formStartTime,
          endTime,
          durationMinutes,
          pathId: formPathId,
          pathTitle: selectedPath?.title || 'Learning Path',
          topicId: formTopicId,
          topicTitle: selectedTopic?.title || 'Topic',
          notes: formNotes,
          completed: false,
        }),
      });

      setEvents((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule study session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle completed state
  const handleToggleEventCompleted = async (evt: StudySessionEvent) => {
    try {
      const updated = await api<StudySessionEvent>(`/calendar/events/${evt.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !evt.completed }),
      });
      setEvents((prev) => prev.map((e) => (e.id === evt.id ? updated : e)));
      if (activeEvent && activeEvent.id === evt.id) {
        setActiveEvent(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event status.');
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this scheduled session?')) return;
    try {
      await api(`/calendar/events/${eventId}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setIsDetailModalOpen(false);
      setActiveEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete study session.');
    }
  };

  // Compute Today's Goal stats
  const todayKey = formatDateKey(new Date());
  const todayEvents = useMemo(() => {
    return events.filter((e) => e.date === todayKey);
  }, [events, todayKey]);

  const todayGoalMetrics = useMemo(() => {
    const plannedMinutes = todayEvents.reduce((acc, e) => acc + (e.durationMinutes || 45), 0);
    const completedMinutes = todayEvents
      .filter((e) => e.completed)
      .reduce((acc, e) => acc + (e.durationMinutes || 45), 0);
    const percent = plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;
    const plannedHoursStr = (plannedMinutes / 60).toFixed(1);
    const completedHoursStr = (completedMinutes / 60).toFixed(1);

    return {
      plannedMinutes,
      completedMinutes,
      plannedHoursStr,
      completedHoursStr,
      percent,
      totalCount: todayEvents.length,
      completedCount: todayEvents.filter((e) => e.completed).length,
    };
  }, [todayEvents]);

  // Compute Spaced Review Queue for sidebar
  const upcomingReviews = useMemo(() => {
    return events
      .filter((e) => e.type === 'review' && !e.completed)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [events]);

  // Header display date label
  const headerDateLabel = useMemo(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (viewMode === 'day') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const monday = getMondayOfWeek(currentDate);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `${monthNames[monday.getMonth()].slice(0, 3)} ${monday.getDate()} – ${monthNames[sunday.getMonth()].slice(0, 3)} ${sunday.getDate()}, ${sunday.getFullYear()}`;
    }
    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [viewMode, currentDate]);

  // Compute 7 days of the week for Week View
  const weekDays = useMemo(() => {
    const monday = getMondayOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // Compute days for Month View
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Days in current month
    const totalDays = lastDay.getDate();

    // Monday-based offset (0 = Monday, 6 = Sunday)
    const startDayIndex = (firstDay.getDay() + 6) % 7;

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevPaddingDays = Array.from({ length: startDayIndex }, (_, i) => {
      const dayNum = prevMonthLastDay - startDayIndex + i + 1;
      return {
        date: new Date(year, month - 1, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateKey: formatDateKey(new Date(year, month - 1, dayNum)),
      };
    });

    // Current month days
    const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const d = new Date(year, month, dayNum);
      return {
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: true,
        dateKey: formatDateKey(d),
      };
    });

    // Next month padding days to complete a 35 or 42 grid
    const remainingCount = (7 - ((prevPaddingDays.length + currentMonthDays.length) % 7)) % 7;
    const nextPaddingDays = Array.from({ length: remainingCount }, (_, i) => {
      const dayNum = i + 1;
      const d = new Date(year, month + 1, dayNum);
      return {
        date: d,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateKey: formatDateKey(d),
      };
    });

    return [...prevPaddingDays, ...currentMonthDays, ...nextPaddingDays];
  }, [currentDate]);

  // Compute days for Mini Calendar
  const miniCalendarDays = useMemo(() => {
    const year = miniCalMonthDate.getFullYear();
    const month = miniCalMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startDayIndex = (firstDay.getDay() + 6) % 7;

    const days: { date: Date; dayNumber: number; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Leading padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDayIndex; i++) {
      const dNum = prevMonthLastDay - startDayIndex + i + 1;
      const d = new Date(year, month - 1, dNum);
      days.push({ date: d, dayNumber: dNum, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    // Days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, dayNumber: i, isCurrentMonth: true, dateKey: formatDateKey(d) });
    }

    // Trailing padding to fill complete weeks
    const extra = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= extra; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, dayNumber: i, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    return days;
  }, [miniCalMonthDate]);

  return (
    <div className="study-calendar-page animate-fade-in">
      {/* Top Header */}
      <PageHeader
        eyebrow="DELIBERATE PRACTICE SCHEDULE"
        title="Study Calendar"
        description="Plan, track, and execute focused technical learning sessions, practice labs, and spaced reviews."
        actions={
          <div className="calendar-header-actions-group">
            {/* View Mode Selector: Day | Week | Month */}
            <SegmentedControl
              options={[
                { id: 'day', label: 'Day' },
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
              ]}
              value={viewMode}
              onChange={(v) => setViewMode(v as CalendarViewMode)}
              size="sm"
            />

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="sm"
              leftIcon="➕"
              onClick={() => handleOpenCreateModal()}
            >
              Schedule Session
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Calendar Workspace Grid Layout: Left Sidebar Tools + Right Schedule Grid */}
      <div className="calendar-workspace-layout">
        {/* ================================================================= */}
        {/* Left Column: Mini Calendar, Today's Goal, Event Types, Review Queue */}
        {/* ================================================================= */}
        <div className="calendar-sidebar-col">
          {/* Mini Calendar Card */}
          <Card className="calendar-mini-card" padded={false}>
            <CardHeader className="mini-card-header">
              <span className="mini-card-month-title">
                {miniCalMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <div className="mini-card-nav-buttons">
                <button
                  type="button"
                  className="mini-nav-btn"
                  onClick={() =>
                    setMiniCalMonthDate(new Date(miniCalMonthDate.getFullYear(), miniCalMonthDate.getMonth() - 1, 1))
                  }
                  aria-label="Previous Month"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="mini-nav-btn"
                  onClick={() =>
                    setMiniCalMonthDate(new Date(miniCalMonthDate.getFullYear(), miniCalMonthDate.getMonth() + 1, 1))
                  }
                  aria-label="Next Month"
                >
                  ›
                </button>
              </div>
            </CardHeader>
            <CardBody className="mini-card-body">
              <div className="mini-weekdays-row">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((wd, i) => (
                  <span key={i} className="mini-weekday-label">
                    {wd}
                  </span>
                ))}
              </div>
              <div className="mini-days-grid">
                {miniCalendarDays.map((cell) => {
                  const isToday = cell.dateKey === todayKey;
                  const isSelected = cell.dateKey === formatDateKey(selectedDate);
                  const dayEvents = events.filter((e) => e.date === cell.dateKey);
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      className={`mini-day-button ${!cell.isCurrentMonth ? 'is-outside-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setSelectedDate(cell.date);
                        setCurrentDate(cell.date);
                      }}
                      title={`${cell.dateKey} (${dayEvents.length} sessions)`}
                    >
                      <span className="mini-day-num">{cell.dayNumber}</span>
                      {hasEvents && (
                        <div className="mini-day-dots">
                          {dayEvents.slice(0, 3).map((e, idx) => (
                            <span
                              key={idx}
                              className={`mini-event-dot dot-${e.type}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Today's Goal Progress Card */}
          <Card className="calendar-goal-card">
            <CardHeader className="goal-card-header">
              <div className="goal-title-wrap">
                <span className="goal-eyebrow">DAILY FOCUS PACER</span>
                <h4 className="goal-heading">Today&apos;s Study Goal</h4>
              </div>
              <span className="streak-badge" title="Consecutive learning days">
                🔥 7d Streak
              </span>
            </CardHeader>
            <CardBody>
              <div className="goal-stats-row">
                <div className="goal-stat-item">
                  <span className="goal-stat-value">{todayGoalMetrics.completedHoursStr}h</span>
                  <span className="goal-stat-label">Completed</span>
                </div>
                <div className="goal-stat-separator">/</div>
                <div className="goal-stat-item">
                  <span className="goal-stat-value">{todayGoalMetrics.plannedHoursStr}h</span>
                  <span className="goal-stat-label">Planned</span>
                </div>
                <div className="goal-stat-item ml-auto">
                  <span className="goal-stat-percent">{todayGoalMetrics.percent}%</span>
                  <span className="goal-stat-label">Rate</span>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar
                  value={todayGoalMetrics.percent}
                  size="md"
                  variant={todayGoalMetrics.percent >= 100 ? 'success' : 'primary'}
                />
              </div>

              <div className="goal-footer-text mt-2">
                <small>
                  {todayGoalMetrics.completedCount} of {todayGoalMetrics.totalCount} sessions executed today
                </small>
              </div>
            </CardBody>
          </Card>

          {/* Event Types Legend & Active Filter Toggles */}
          <Card className="calendar-filter-card">
            <CardHeader className="filter-card-header">
              <h4>Event Categories</h4>
              <small className="filter-hint">Filter schedule</small>
            </CardHeader>
            <CardBody>
              <div className="event-type-filter-list">
                {(['study_session', 'practice_lab', 'review', 'milestone'] as StudyEventType[]).map((type) => {
                  const cfg = eventTypeConfig[type];
                  const isChecked = selectedTypes.has(type);
                  const count = events.filter((e) => e.type === type).length;

                  return (
                    <button
                      key={type}
                      type="button"
                      className={`event-type-filter-item ${isChecked ? 'is-active' : 'is-inactive'}`}
                      onClick={() => handleToggleTypeFilter(type)}
                      aria-pressed={isChecked}
                    >
                      <span className={`event-type-check-dot dot-${type}`} />
                      <span className="event-type-label">{cfg.label}</span>
                      <span className="event-type-count-badge">{count}</span>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Upcoming Spaced Reviews Widget */}
          {upcomingReviews.length > 0 && (
            <Card className="calendar-reviews-card">
              <CardHeader className="reviews-card-header">
                <h4>Upcoming Reviews</h4>
                <Link to="/review" className="reviews-view-all-link">
                  View All →
                </Link>
              </CardHeader>
              <CardBody>
                <div className="reviews-widget-list">
                  {upcomingReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="review-widget-item"
                      onClick={() => {
                        setActiveEvent(rev);
                        setIsDetailModalOpen(true);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="review-widget-top">
                        <span className="review-time-text">⏱️ {rev.date} · {rev.startTime}</span>
                        <Badge variant="review" size="sm">Review</Badge>
                      </div>
                      <strong className="review-widget-title">{rev.title}</strong>
                      <span className="review-widget-path">{rev.pathTitle || 'Linux for DevOps'}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* ================================================================= */}
        {/* Right Column: Date Navigation Bar & Main Schedule Views */}
        {/* ================================================================= */}
        <div className="calendar-main-col">
          {/* Calendar Controls Toolbar */}
          <div className="calendar-controls-toolbar">
            <div className="calendar-nav-controls">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToday}
                className="btn-today"
              >
                Today
              </Button>
              <div className="nav-arrow-group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  aria-label="Previous Period"
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  aria-label="Next Period"
                >
                  ›
                </Button>
              </div>
              <h2 className="current-period-label">{headerDateLabel}</h2>
            </div>

            <div className="calendar-toolbar-right">
              <span className="events-count-pill">
                {filteredEvents.length} Active Sessions
              </span>
            </div>
          </div>

          {loading ? (
            <Card className="calendar-loading-card">
              <CardBody>
                <p className="text-muted">Loading study schedule...</p>
              </CardBody>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No study sessions match your filters"
              description="Adjust category filters or schedule a new focused learning block."
              actionLabel="Schedule Session"
              onAction={() => handleOpenCreateModal()}
            />
          ) : (
            <>
              {/* ------------------------------------------------------------- */}
              {/* 1. Day View */}
              {/* ------------------------------------------------------------- */}
              {viewMode === 'day' && (
                <div className="calendar-day-view-container">
                  <div className="day-view-timeline-grid">
                    {hoursList.map((hour) => {
                      const hourStr = `${String(hour).padStart(2, '0')}:00`;
                      const dayKey = formatDateKey(currentDate);

                      // Find events that start in this hour slot
                      const slotEvents = filteredEvents.filter((e) => {
                        if (e.date !== dayKey) return false;
                        const startH = Number(e.startTime.split(':')[0]);
                        return startH === hour;
                      });

                      return (
                        <div key={hour} className="day-timeline-hour-row">
                          <div className="hour-label-cell">
                            <span className="hour-text">{hourStr}</span>
                          </div>

                          <div
                            className="hour-content-slot"
                            onClick={() => handleOpenCreateModal(dayKey, hourStr)}
                            role="region"
                            aria-label={`Slot ${hourStr}`}
                          >
                            {slotEvents.map((evt) => {
                              const cfg = eventTypeConfig[evt.type];

                              return (
                                <div
                                  key={evt.id}
                                  className={`calendar-event-block block-${evt.type} ${evt.completed ? 'is-completed' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveEvent(evt);
                                    setIsDetailModalOpen(true);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <div className="event-block-header">
                                    <div className="event-block-badges">
                                      <span className="event-type-badge-pill">
                                        {cfg.icon} {cfg.label}
                                      </span>
                                      <span className="event-time-range">
                                        ⏱️ {evt.startTime} - {evt.endTime} ({evt.durationMinutes}m)
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className={`event-complete-toggle-btn ${evt.completed ? 'is-checked' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleEventCompleted(evt);
                                      }}
                                      title={evt.completed ? 'Mark pending' : 'Mark completed'}
                                    >
                                      {evt.completed ? '✓ Done' : '○ Mark Done'}
                                    </button>
                                  </div>

                                  <h4 className="event-block-title">{evt.title}</h4>

                                  <div className="event-block-footer">
                                    <span className="event-path-tag">
                                      {evt.pathTitle || 'Linux for DevOps'}
                                    </span>
                                    {evt.topicTitle && (
                                      <span className="event-topic-tag">
                                        🎯 {evt.topicTitle}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 2. Week View */}
              {/* ------------------------------------------------------------- */}
              {viewMode === 'week' && (
                <div className="calendar-week-view-container">
                  {/* 7-Day Header */}
                  <div className="week-header-grid">
                    <div className="week-header-time-gutter" />
                    {weekDays.map((day) => {
                      const dayKey = formatDateKey(day);
                      const isToday = dayKey === todayKey;
                      const isSelected = dayKey === formatDateKey(selectedDate);
                      const dayName = day.toLocaleDateString(undefined, { weekday: 'short' });

                      return (
                        <div
                          key={dayKey}
                          className={`week-header-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <span className="week-day-name">{dayName}</span>
                          <span className="week-day-number">{day.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Week Time Grid */}
                  <div className="week-body-grid">
                    {hoursList.map((hour) => {
                      const hourStr = `${String(hour).padStart(2, '0')}:00`;

                      return (
                        <div key={hour} className="week-hour-row">
                          <div className="week-time-label-col">
                            <span>{hourStr}</span>
                          </div>

                          {weekDays.map((day) => {
                            const dayKey = formatDateKey(day);
                            const slotEvents = filteredEvents.filter((e) => {
                              if (e.date !== dayKey) return false;
                              const startH = Number(e.startTime.split(':')[0]);
                              return startH === hour;
                            });

                            return (
                              <div
                                key={dayKey}
                                className="week-day-slot-cell"
                                onClick={() => handleOpenCreateModal(dayKey, hourStr)}
                              >
                                {slotEvents.map((evt) => {
                                  const cfg = eventTypeConfig[evt.type];

                                  return (
                                    <div
                                      key={evt.id}
                                      className={`week-event-card card-${evt.type} ${evt.completed ? 'is-completed' : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveEvent(evt);
                                        setIsDetailModalOpen(true);
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      title={`${evt.title} (${evt.startTime} - ${evt.endTime})`}
                                    >
                                      <div className="week-event-top-line">
                                        <span className="week-event-icon">{cfg.icon}</span>
                                        <span className="week-event-time">{evt.startTime}</span>
                                      </div>
                                      <strong className="week-event-title">{evt.title}</strong>
                                      <div className="week-event-bottom">
                                        <span className="week-event-dur">{evt.durationMinutes}m</span>
                                        {evt.completed && <span className="week-done-check">✓</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 3. Month View */}
              {/* ------------------------------------------------------------- */}
              {viewMode === 'month' && (
                <div className="calendar-month-view-container">
                  {/* Month Weekdays Row */}
                  <div className="month-weekdays-header">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((wd) => (
                      <div key={wd} className="month-weekday-cell">
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Month 35/42 Cell Grid */}
                  <div className="month-cells-grid">
                    {monthDays.map((cell) => {
                      const isToday = cell.dateKey === todayKey;
                      const isSelected = cell.dateKey === formatDateKey(selectedDate);
                      const dayEvents = filteredEvents.filter((e) => e.date === cell.dateKey);

                      return (
                        <div
                          key={cell.dateKey}
                          className={`month-cell ${!cell.isCurrentMonth ? 'is-outside-month' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSelectedDate(cell.date);
                            handleOpenCreateModal(cell.dateKey);
                          }}
                        >
                          <div className="month-cell-top">
                            <span className="month-cell-day-num">{cell.dayNumber}</span>
                            {dayEvents.length > 0 && (
                              <span className="month-cell-events-count">
                                {dayEvents.length}
                              </span>
                            )}
                          </div>

                          <div className="month-cell-events-list">
                            {dayEvents.slice(0, 3).map((evt) => {
                              const cfg = eventTypeConfig[evt.type];

                              return (
                                <div
                                  key={evt.id}
                                  className={`month-event-chip chip-${evt.type} ${evt.completed ? 'is-completed' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveEvent(evt);
                                    setIsDetailModalOpen(true);
                                  }}
                                  title={`${evt.startTime} - ${evt.title}`}
                                  role="button"
                                  tabIndex={0}
                                >
                                  <span className="chip-time">{evt.startTime}</span>
                                  <span className="chip-title">{cfg.icon} {evt.title}</span>
                                </div>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <button
                                type="button"
                                className="month-more-events-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentDate(cell.date);
                                  setSelectedDate(cell.date);
                                  setViewMode('day');
                                }}
                              >
                                +{dayEvents.length - 3} more
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* Create / Schedule Study Session Modal */}
      {/* =================================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Study Session"
      >
        <form onSubmit={handleSaveEvent} className="calendar-event-form">
          <Input
            label="Session Title"
            placeholder="e.g. Linux Kernel Subsystems &amp; Syscalls"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="form-grid-2col">
            <Select
              label="Session Type"
              value={formType}
              onChange={(e) => setFormType(e.target.value as StudyEventType)}
              options={[
                { value: 'study_session', label: '📖 Study Session (Deep Work)' },
                { value: 'practice_lab', label: '⚡ Practice Lab (Terminal Hands-on)' },
                { value: 'review', label: '🔄 Spaced Active Recall' },
                { value: 'milestone', label: '🎯 Roadmap Milestone Assessment' },
              ]}
            />

            <Select
              label="Estimated Duration"
              value={formDuration}
              onChange={(e) => setFormDuration(e.target.value)}
              options={[
                { value: '15', label: '15 Minutes (Micro Recall)' },
                { value: '30', label: '30 Minutes (Focused Sprint)' },
                { value: '45', label: '45 Minutes (Standard Paced)' },
                { value: '60', label: '60 Minutes (Deliberate Practice)' },
                { value: '75', label: '75 Minutes (Extended Deep Work)' },
                { value: '90', label: '90 Minutes (Comprehensive Lab)' },
                { value: '120', label: '120 Minutes (Milestone Exam)' },
              ]}
            />
          </div>

          <div className="form-grid-2col">
            <Input
              label="Scheduled Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />

            <Input
              label="Start Time"
              type="time"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-2col">
            <Select
              label="Learning Path Curriculum"
              value={formPathId}
              onChange={(e) => setFormPathId(e.target.value)}
              options={paths.map((p) => ({ value: p.id, label: p.title }))}
            />

            <Select
              label="Topic (Workspace Target)"
              value={formTopicId}
              onChange={(e) => setFormTopicId(e.target.value)}
              options={availableTopicsForForm.map((t) => ({ value: t.id, label: t.title }))}
              disabled={availableTopicsForForm.length === 0}
            />
          </div>

          <Textarea
            label="Focus Area &amp; Session Notes"
            rows={3}
            placeholder="Key concepts to master, commands to execute, or recall questions to verify..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
          />

          <div className="modal-actions-bar mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Save &amp; Schedule Session'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* Event Details Modal */}
      {/* =================================================================== */}
      {activeEvent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Study Session Details"
        >
          <div className="event-detail-content">
            <div className="event-detail-header-strip">
              <div className="detail-badges-row">
                <span className={`event-type-badge-pill block-${activeEvent.type}`}>
                  {eventTypeConfig[activeEvent.type].icon} {eventTypeConfig[activeEvent.type].label}
                </span>
                <StatusPill
                  status={activeEvent.completed ? 'mastered' : 'learning'}
                  label={activeEvent.completed ? 'Completed' : 'Scheduled'}
                  size="sm"
                />
              </div>

              <div className="detail-time-range-box">
                <strong>📅 {activeEvent.date}</strong>
                <span>⏱️ {activeEvent.startTime} - {activeEvent.endTime} ({activeEvent.durationMinutes} min)</span>
              </div>
            </div>

            <h3 className="event-detail-heading mt-4">{activeEvent.title}</h3>

            <div className="event-detail-metadata-card mt-3">
              <div className="meta-field">
                <span className="meta-label">Curriculum:</span>
                <span className="meta-val">{activeEvent.pathTitle || 'Linux for DevOps'}</span>
              </div>
              {activeEvent.topicTitle && (
                <div className="meta-field mt-1">
                  <span className="meta-label">Topic:</span>
                  <span className="meta-val">{activeEvent.topicTitle}</span>
                </div>
              )}
            </div>

            {activeEvent.notes && (
              <div className="event-detail-notes-box mt-3">
                <span className="notes-heading">Session Objectives &amp; Focus:</span>
                <p className="notes-body">{activeEvent.notes}</p>
              </div>
            )}

            <div className="event-detail-actions-footer mt-6">
              <div className="detail-left-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleEventCompleted(activeEvent)}
                  leftIcon={activeEvent.completed ? '↩️' : '✓'}
                >
                  {activeEvent.completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEvent(activeEvent.id)}
                  className="text-danger"
                >
                  Delete
                </Button>
              </div>

              <div className="detail-right-actions">
                {activeEvent.pathId && activeEvent.topicId ? (
                  <Link
                    to={`/paths/${activeEvent.pathId}/topics/${activeEvent.topicId}`}
                    className="btn btn-primary btn-sm"
                  >
                    Open Workspace →
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
