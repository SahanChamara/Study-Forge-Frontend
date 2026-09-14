import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import type { LearningPath, MasteryLevel, Topic, TopicStatus } from '../types';

type ViewMode = 'board' | 'timeline' | 'list';

const boardColumns: { status: TopicStatus; title: string; color: string }[] = [
  { status: 'not_started', title: 'Not Started', color: 'var(--color-text-muted)' },
  { status: 'learning', title: 'Learning', color: 'var(--color-info)' },
  { status: 'practicing', title: 'Practicing', color: 'var(--color-primary)' },
  { status: 'mastered', title: 'Mastered', color: 'var(--color-success)' },
];

export const BoardPage: React.FC = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'planned' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    setError('');
    api<LearningPath[]>('/learning-paths')
      .then((data) => {
        setPaths(data);
        if (data.length > 0 && selectedPathId === 'all') {
          // Default to all or first path
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load learning board.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Collect all topics with their parent path info
  const allTopics = useMemo(() => {
    return paths.flatMap((p) =>
      (p.topics || []).map((t) => ({
        ...t,
        pathTitle: p.title,
        pathId: p.id,
        moduleTitle: p.modules?.find((m) => m.id === t.moduleId)?.title || 'Module',
      }))
    );
  }, [paths]);

  // Filter topics based on path, search, and timeline filter
  const filteredTopics = useMemo(() => {
    return allTopics.filter((t) => {
      const matchPath = selectedPathId === 'all' || t.pathId === selectedPathId;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.pathTitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchPath && matchSearch;
    });
  }, [allTopics, selectedPathId, searchQuery]);

  // Handle topic status move
  const handleMoveStatus = async (topic: Topic & { pathId: string }, newStatus: TopicStatus) => {
    try {
      const newMastery: MasteryLevel =
        newStatus === 'mastered' ? 4 : newStatus === 'not_started' ? 0 : topic.mastery;

      await api<Topic>(`/learning-paths/${topic.pathId}/topics/${topic.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, mastery: newMastery }),
      });

      // Update local state
      setPaths((prevPaths) =>
        prevPaths.map((p) => {
          if (p.id !== topic.pathId) return p;
          const updatedTopics = (p.topics || []).map((t) =>
            t.id === topic.id ? { ...t, status: newStatus, mastery: newMastery } : t
          );
          return { ...p, topics: updatedTopics };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic status.');
    }
  };

  // Timeline slots generation
  const timelineItems = useMemo(() => {
    const startTimeHours = 9;
    let accumulatedMinutes = 0;

    return filteredTopics
      .filter((t) => {
        if (timelineFilter === 'planned') return t.status === 'not_started';
        if (timelineFilter === 'active') return t.status === 'learning' || t.status === 'practicing' || t.status === 'review';
        if (timelineFilter === 'completed') return t.status === 'mastered';
        return true;
      })
      .map((t) => {
        const startTotalMins = startTimeHours * 60 + accumulatedMinutes;
        const endTotalMins = startTotalMins + (t.estimatedMinutes || 45);
        accumulatedMinutes += (t.estimatedMinutes || 45) + 15; // 15 min rest gap

        const formatTime = (totalMins: number) => {
          const h = Math.floor(totalMins / 60) % 24;
          const m = totalMins % 60;
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        return {
          ...t,
          timeSlot: `${formatTime(startTotalMins)} - ${formatTime(endTotalMins)}`,
        };
      });
  }, [filteredTopics, timelineFilter]);

  return (
    <div className="board-page-container animate-fade-in">
      <PageHeader
        eyebrow="ALTERNATE LEARNING VIEWS"
        title="Study Board &amp; Timeline"
        description="Visualize and transition your learning roadmap across kanban columns, time-based timelines, and module lists."
        actions={
          <div className="board-header-path-select">
            <Select
              label=""
              value={selectedPathId}
              onChange={(e) => setSelectedPathId(e.target.value)}
              options={[
                { value: 'all', label: 'All Curriculums' },
                ...paths.map((p) => ({ value: p.id, label: p.title })),
              ]}
            />
          </div>
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Shared Control Bar: List | Board | Timeline */}
      <div className="board-toolbar-strip mb-6">
        <div className="toolbar-view-switcher">
          <SegmentedControl
            options={[
              { id: 'board', label: 'Board View', icon: '📋' },
              { id: 'timeline', label: 'Timeline View', icon: '⏱️' },
              { id: 'list', label: 'List View', icon: '☰' },
            ]}
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            size="md"
          />
        </div>

        <div className="toolbar-search-box">
          <SearchInput
            placeholder="Search topics, outcomes, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            sizeVariant="md"
          />
        </div>
      </div>

      {loading ? (
        <div className="board-loading-skeleton">
          <div className="board-columns-grid">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="rectangular" height={160} />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ) : filteredTopics.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No topics match your filters"
          description="Try adjusting your search query or path selection."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedPathId('all');
          }}
        />
      ) : (
        <>
          {/* ========================================= */}
          {/* 1. Board View (Kanban 4 Columns) */}
          {/* ========================================= */}
          {viewMode === 'board' && (
            <div className="board-columns-grid">
              {boardColumns.map((col) => {
                const colTopics = filteredTopics.filter((t) => {
                  if (col.status === 'not_started') return t.status === 'not_started';
                  if (col.status === 'learning') return t.status === 'learning';
                  if (col.status === 'practicing') return t.status === 'practicing' || t.status === 'review';
                  if (col.status === 'mastered') return t.status === 'mastered';
                  return false;
                });

                return (
                  <div key={col.status} className="board-column-panel">
                    <div className="board-column-header">
                      <div className="column-header-title">
                        <span className={`column-status-dot dot-${col.status}`} />
                        <strong>{col.title}</strong>
                      </div>
                      <span className="column-count-badge">{colTopics.length}</span>
                    </div>

                    <div className="board-column-cards">
                      {colTopics.map((topic) => (
                        <Card key={topic.id} className="board-topic-card" padded={false}>
                          <CardHeader className="board-card-header">
                            <span className="board-card-module-tag" title={topic.moduleTitle}>
                              {topic.moduleTitle}
                            </span>
                            <Badge variant="mastery" mastery={topic.mastery} size="sm" />
                          </CardHeader>

                          <CardBody className="board-card-body">
                            <Link
                              to={`/paths/${topic.pathId}/topics/${topic.id}`}
                              className="board-card-title-link"
                            >
                              <h4>{topic.title}</h4>
                            </Link>
                            <p className="board-card-objective">{topic.objective}</p>

                            <div className="board-card-meta">
                              <span className="meta-duration">⏱️ ~{topic.estimatedMinutes}m</span>
                              <span className="meta-path" title={topic.pathTitle}>
                                {topic.pathTitle}
                              </span>
                            </div>

                            {/* Quick Status Movement Select */}
                            <div className="board-card-actions mt-3">
                              <select
                                className="board-status-select"
                                value={topic.status}
                                onChange={(e) =>
                                  handleMoveStatus(topic, e.target.value as TopicStatus)
                                }
                                aria-label={`Move status for ${topic.title}`}
                              >
                                <option value="not_started">Move: Not Started</option>
                                <option value="learning">Move: Learning</option>
                                <option value="practicing">Move: Practicing</option>
                                <option value="mastered">Move: Mastered</option>
                              </select>

                              <Link
                                to={`/paths/${topic.pathId}/topics/${topic.id}`}
                                className="btn btn-primary btn-sm board-study-btn"
                              >
                                Study →
                              </Link>
                            </div>
                          </CardBody>
                        </Card>
                      ))}

                      {colTopics.length === 0 && (
                        <div className="empty-column-dropzone">
                          <small>No topics in {col.title}</small>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================= */}
          {/* 2. Timeline View */}
          {/* ========================================= */}
          {viewMode === 'timeline' && (
            <div className="timeline-view-wrapper">
              <div className="timeline-controls-bar mb-6">
                <div className="timeline-filter-group">
                  <span className="timeline-filter-label">Filter Sessions:</span>
                  <SegmentedControl
                    size="sm"
                    options={[
                      { id: 'all', label: 'All Sessions' },
                      { id: 'active', label: 'Active (Learning)' },
                      { id: 'planned', label: 'Planned (Upcoming)' },
                      { id: 'completed', label: 'Completed (Mastered)' },
                    ]}
                    value={timelineFilter}
                    onChange={(v) => setTimelineFilter(v as typeof timelineFilter)}
                  />
                </div>
                <span className="timeline-total-count">
                  {timelineItems.length} Study Blocks Scheduled
                </span>
              </div>

              <div className="timeline-track-container">
                {timelineItems.map((item, idx) => {
                  const isCompleted = item.status === 'mastered';
                  const isActive = item.status === 'learning' || item.status === 'practicing';

                  return (
                    <div
                      key={item.id}
                      className={`timeline-event-row ${isCompleted ? 'is-completed' : ''} ${isActive ? 'is-active' : ''}`}
                    >
                      <div className="timeline-time-col">
                        <span className="time-range-text">{item.timeSlot}</span>
                        <small className="time-duration-text">~{item.estimatedMinutes}m</small>
                      </div>

                      <div className="timeline-spine-col">
                        <div className="timeline-spine-dot" />
                        {idx < timelineItems.length - 1 && <div className="timeline-spine-line" />}
                      </div>

                      <div className="timeline-content-col">
                        <Card interactive padded={false} className="timeline-event-card">
                          <CardBody>
                            <div className="timeline-card-header">
                              <div className="timeline-header-badges">
                                <span className="timeline-module-badge">{item.moduleTitle}</span>
                                <StatusPill status={item.status} size="sm" />
                                <Badge variant="mastery" mastery={item.mastery} size="sm" />
                              </div>
                              <span className="timeline-path-name">{item.pathTitle}</span>
                            </div>

                            <Link
                              to={`/paths/${item.pathId}/topics/${item.id}`}
                              className="timeline-topic-title-link"
                            >
                              <h3>{item.title}</h3>
                            </Link>
                            <p className="timeline-topic-desc">{item.objective}</p>

                            <div className="timeline-card-footer">
                              <Link
                                to={`/paths/${item.pathId}/topics/${item.id}`}
                                className="btn btn-secondary btn-sm"
                              >
                                Study Workspace →
                              </Link>
                            </div>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 3. List View */}
          {/* ========================================= */}
          {viewMode === 'list' && (
            <Card className="curriculum-list-view-card">
              <CardBody>
                <div className="curriculum-list-table">
                  {filteredTopics.map((topic, idx) => (
                    <div key={topic.id} className="curriculum-list-row">
                      <span className="list-row-idx">{idx + 1}.</span>
                      <div className="list-row-main">
                        <div className="list-row-title-line">
                          <Link
                            to={`/paths/${topic.pathId}/topics/${topic.id}`}
                            className="list-row-title-link"
                          >
                            <strong>{topic.title}</strong>
                          </Link>
                          <span className="list-row-module-tag">{topic.moduleTitle}</span>
                          <span className="list-row-time">⏱️ ~{topic.estimatedMinutes}m</span>
                        </div>
                        <p className="list-row-objective">{topic.objective}</p>
                      </div>

                      <div className="list-row-controls">
                        <StatusPill status={topic.status} size="sm" />
                        <Badge variant="mastery" mastery={topic.mastery} size="sm" />
                        <Link
                          to={`/paths/${topic.pathId}/topics/${topic.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Study →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
