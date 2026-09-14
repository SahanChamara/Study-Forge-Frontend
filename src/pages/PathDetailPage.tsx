import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import type { LearningPath, MasteryLevel, ModuleItem, Topic, TopicStatus } from '../types';

export const PathDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isEditPathModalOpen, setIsEditPathModalOpen] = useState(false);
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [activeModuleIdForTopic, setActiveModuleIdForTopic] = useState<string>('');

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetLevel, setEditTargetLevel] = useState('job-ready');

  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  const [topicTitle, setTopicTitle] = useState('');
  const [topicObjective, setTopicObjective] = useState('');
  const [topicDuration, setTopicDuration] = useState('45');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPath = () => {
    setLoading(true);
    setError('');
    api<LearningPath>(`/learning-paths/${id}`)
      .then((data) => {
        setPath(data);
        setEditTitle(data.title);
        setEditGoal(data.goal);
        setEditDescription(data.description);
        setEditTargetLevel(data.targetLevel);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load path details.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPath();
  }, [id]);

  const moduleGroups = useMemo(() => {
    if (!path?.modules) return [];
    return path.modules.map((m) => {
      const topics = path.topics?.filter((t) => t.moduleId === m.id) || [];
      const masteredInModule = topics.filter((t) => t.status === 'mastered').length;
      return {
        ...m,
        topics,
        masteredCount: masteredInModule,
      };
    });
  }, [path]);

  // Compute Next Action topic within this path
  const nextActionTopic = useMemo(() => {
    if (!path?.topics || path.topics.length === 0) return null;
    const inProgress = path.topics.find((t) => ['learning', 'practicing', 'review'].includes(t.status));
    if (inProgress) return inProgress;
    return path.topics.find((t) => t.status === 'not_started') || path.topics[0] || null;
  }, [path?.topics]);

  // Next action module name
  const nextActionModule = useMemo(() => {
    if (!nextActionTopic || !path?.modules) return null;
    return path.modules.find((m) => m.id === nextActionTopic.moduleId);
  }, [nextActionTopic, path?.modules]);

  // Total curriculum duration
  const totalCurriculumHours = useMemo(() => {
    if (!path?.topics) return '0';
    const totalMinutes = path.topics.reduce((acc, t) => acc + (t.estimatedMinutes || 45), 0);
    return (totalMinutes / 60).toFixed(1);
  }, [path?.topics]);

  const handleSeedRoadmap = async () => {
    try {
      setLoading(true);
      await api(`/learning-paths/${id}/seed/linux-devops`, { method: 'POST' });
      loadPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed roadmap.');
      setLoading(false);
    }
  };

  const handleUpdateTopic = async (
    t: Topic,
    newStatus: TopicStatus,
    newMastery: MasteryLevel
  ) => {
    try {
      await api<Topic>(`/learning-paths/${id}/topics/${t.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, mastery: newMastery }),
      });
      // Optimistic update locally
      if (path && path.topics) {
        const updatedTopics = path.topics.map((item) =>
          item.id === t.id ? { ...item, status: newStatus, mastery: newMastery } : item
        );
        const mastered = updatedTopics.filter((x) => x.status === 'mastered').length;
        const inProgress = updatedTopics.filter((x) => ['learning', 'practicing', 'review'].includes(x.status)).length;
        const progressPercent = Math.round(((mastered * 1.0 + inProgress * 0.5) / updatedTopics.length) * 100);

        setPath({ ...path, topics: updatedTopics, progressPercent });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic status.');
    }
  };

  const handleSavePathMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await api<LearningPath>(`/learning-paths/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle,
          goal: editGoal,
          description: editDescription,
          targetLevel: editTargetLevel,
        }),
      });
      setPath((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditPathModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update path.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await api<ModuleItem>(`/learning-paths/${id}/modules`, {
        method: 'POST',
        body: JSON.stringify({
          title: moduleTitle,
          description: moduleDescription,
        }),
      });
      setModuleTitle('');
      setModuleDescription('');
      setIsAddModuleModalOpen(false);
      loadPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add module.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !activeModuleIdForTopic) return;

    setIsSubmitting(true);
    try {
      await api<Topic>(`/learning-paths/${id}/topics`, {
        method: 'POST',
        body: JSON.stringify({
          moduleId: activeModuleIdForTopic,
          title: topicTitle,
          objective: topicObjective,
          estimatedMinutes: Number(topicDuration) || 45,
        }),
      });
      setTopicTitle('');
      setTopicObjective('');
      setTopicDuration('45');
      setIsAddTopicModalOpen(false);
      loadPath();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add topic.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePath = async () => {
    if (!window.confirm('Are you sure you want to delete this learning path?')) return;
    try {
      await api(`/learning-paths/${id}`, { method: 'DELETE' });
      navigate('/paths');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete path.');
    }
  };

  if (loading) {
    return (
      <div className="path-detail-page-container">
        <Skeleton variant="rectangular" height={180} />
        <div className="mt-6">
          <Skeleton variant="rectangular" height={120} />
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="path-detail-page-container">
        <Alert variant="error" message={error || 'Learning path not found.'} onRetry={loadPath} />
        <Link to="/paths" className="btn btn-secondary">
          ← Return to Paths Directory
        </Link>
      </div>
    );
  }

  const topicCount = path.topics?.length || 0;
  const masteredCount = path.topics?.filter((t) => t.status === 'mastered').length || 0;
  const inProgressCount =
    path.topics?.filter((t) => ['learning', 'practicing', 'review'].includes(t.status)).length || 0;
  const notStartedCount = topicCount - masteredCount - inProgressCount;

  return (
    <div className="path-detail-page-container animate-fade-in">
      <PageHeader
        breadcrumbs={[
          { label: 'Learning Paths', href: '/paths' },
          { label: path.title },
        ]}
        title={path.title}
        description={path.goal}
        actions={
          <div className="path-detail-header-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditPathModalOpen(true)}
              leftIcon="✏️"
            >
              Edit Path
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDeletePath}
              className="text-danger"
              leftIcon="🗑️"
            >
              Delete
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error" message={error} onRetry={loadPath} />}

      {/* Next Action Immediate Workspace Hero */}
      {nextActionTopic && (
        <Card className="path-next-action-hero mb-6" padded={false}>
          <CardHeader className="next-action-hero-header">
            <div className="next-action-badge-row">
              <span className="next-action-indicator-pill">🎯 NEXT ACTION</span>
              {nextActionModule && (
                <span className="next-action-module-tag">
                  {nextActionModule.title}
                </span>
              )}
            </div>
            <div className="next-action-status-group">
              <StatusPill status={nextActionTopic.status} size="sm" />
              <Badge variant="mastery" mastery={nextActionTopic.mastery} size="sm" />
            </div>
          </CardHeader>
          <CardBody className="next-action-hero-body">
            <div className="next-action-hero-text">
              <h2 className="next-action-topic-heading">{nextActionTopic.title}</h2>
              <p className="next-action-objective-text">{nextActionTopic.objective}</p>
            </div>
            <div className="next-action-hero-cta">
              <span className="next-action-duration">⏱️ ~{nextActionTopic.estimatedMinutes} min</span>
              <Link
                to={`/paths/${path.id}/topics/${nextActionTopic.id}`}
                className="btn btn-primary btn-md"
              >
                Resume Study Workspace →
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Path Summary & Mastery Hero Card */}
      <Card className="path-summary-hero-card mb-6" padded={false}>
        <CardHeader>
          <div className="path-hero-eyebrow">
            <Badge variant="neutral">{path.targetLevel}</Badge>
            <span className="path-counts-tag">
              {path.modules?.length || 0} Modules · {topicCount} Topics · ~{totalCurriculumHours} Hours
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {path.description && <p className="path-hero-desc">{path.description}</p>}

          <div className="path-hero-progress-section">
            <div className="path-progress-stats">
              <div className="stat-pill-group">
                <span className="stat-num-badge success">{masteredCount}</span>
                <span className="stat-num-label">Mastered (M4/M5)</span>
              </div>
              <div className="stat-pill-group">
                <span className="stat-num-badge primary">{inProgressCount}</span>
                <span className="stat-num-label">In Progress</span>
              </div>
              <div className="stat-pill-group">
                <span className="stat-num-badge neutral">{notStartedCount}</span>
                <span className="stat-num-label">Not Started</span>
              </div>
            </div>
            <ProgressBar
              value={path.progressPercent || 0}
              label={`Curriculum Progress (${path.progressPercent || 0}%)`}
              variant={path.progressPercent && path.progressPercent >= 80 ? 'success' : 'primary'}
              size="lg"
            />
          </div>
        </CardBody>
      </Card>

      {/* Module Hierarchy Section Header */}
      <div className="module-section-header">
        <div>
          <span className="eyebrow">CURRICULUM HIERARCHY</span>
          <h2>Ordered Modules &amp; Hands-on Topics</h2>
        </div>
        <div className="module-actions">
          {(!path.modules || path.modules.length === 0) && (
            <Button variant="accent" size="sm" onClick={handleSeedRoadmap}>
              ⚡ Seed Linux DevOps Roadmap
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModuleModalOpen(true)}
            leftIcon="＋"
          >
            Add Module
          </Button>
        </div>
      </div>

      {/* Module List */}
      {moduleGroups.length > 0 ? (
        <div className="module-list-stack">
          {moduleGroups.map((m, mIndex) => (
            <Card key={m.id} className="module-card-block" padded={false}>
              <CardHeader className="module-heading-bar">
                <div className="module-heading-left">
                  <span className="module-number-pill">Module {mIndex + 1}</span>
                  <div>
                    <h3 className="module-title-text">{m.title}</h3>
                    {m.description && <p className="module-subtext">{m.description}</p>}
                  </div>
                </div>
                <div className="module-heading-right">
                  <span className="module-topic-counter">
                    {m.masteredCount}/{m.topics.length} Mastered
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setActiveModuleIdForTopic(m.id);
                      setIsAddTopicModalOpen(true);
                    }}
                  >
                    ＋ Add Topic
                  </Button>
                </div>
              </CardHeader>

              {/* Topics inside Module */}
              <div className="module-topics-body">
                {m.topics.length > 0 ? (
                  m.topics.map((t, tIndex) => (
                    <div className="topic-table-row" key={t.id}>
                      <div className="topic-info-cell">
                        <div className="topic-title-flex">
                          <span className="topic-order-num">{tIndex + 1}.</span>
                          <Link
                            to={`/paths/${path.id}/topics/${t.id}`}
                            className="topic-link-title"
                          >
                            <strong>{t.title}</strong>
                          </Link>
                          <span className="topic-time-badge">⏱️ {t.estimatedMinutes}m</span>
                        </div>
                        {t.objective && <small className="topic-objective-text">{t.objective}</small>}
                      </div>

                      <div className="topic-action-controls">
                        {/* Status Select Control */}
                        <div className="status-selector-box">
                          <StatusPill status={t.status} size="sm" />
                          <select
                            className="topic-inline-select"
                            value={t.status}
                            onChange={(e) =>
                              handleUpdateTopic(
                                t,
                                e.target.value as TopicStatus,
                                t.mastery
                              )
                            }
                            aria-label={`Update status for ${t.title}`}
                          >
                            <option value="not_started">Not Started</option>
                            <option value="learning">Learning</option>
                            <option value="practicing">Practicing</option>
                            <option value="review">Review</option>
                            <option value="mastered">Mastered</option>
                          </select>
                        </div>

                        {/* Mastery Level Badge & Selector */}
                        <div className="mastery-selector-box">
                          <Badge variant="mastery" mastery={t.mastery} size="sm" />
                          <select
                            className="topic-inline-select"
                            value={t.mastery}
                            onChange={(e) =>
                              handleUpdateTopic(
                                t,
                                t.status,
                                Number(e.target.value) as MasteryLevel
                              )
                            }
                            aria-label={`Update mastery for ${t.title}`}
                          >
                            <option value={0}>M0 (None)</option>
                            <option value={1}>M1 (Seen)</option>
                            <option value={2}>M2 (Following)</option>
                            <option value={3}>M3 (Guided)</option>
                            <option value={4}>M4 (Independent)</option>
                            <option value={5}>M5 (Mastered)</option>
                          </select>
                        </div>

                        <Link
                          to={`/paths/${path.id}/topics/${t.id}`}
                          className="btn btn-secondary btn-sm topic-workspace-btn"
                        >
                          Study Workspace →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-module-placeholder">
                    <span>No topics in this module yet.</span>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => {
                        setActiveModuleIdForTopic(m.id);
                        setIsAddTopicModalOpen(true);
                      }}
                    >
                      Add first topic
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title="Curriculum is empty"
          description="Build structured learning by adding your first module or seed the standard Linux DevOps roadmap."
          actionLabel="Seed Reference Roadmap"
          onAction={handleSeedRoadmap}
        />
      )}

      {/* Edit Path Modal */}
      <Modal
        isOpen={isEditPathModalOpen}
        onClose={() => setIsEditPathModalOpen(false)}
        title="Edit Learning Path Details"
      >
        <form onSubmit={handleSavePathMetadata} className="edit-path-form">
          <Input
            label="Path Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <Input
            label="Primary Goal"
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            rows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <Select
            label="Target Level"
            value={editTargetLevel}
            onChange={(e) => setEditTargetLevel(e.target.value)}
            options={[
              { value: 'foundation', label: 'Foundation' },
              { value: 'practical', label: 'Practical' },
              { value: 'job-ready', label: 'Job-Ready' },
              { value: 'advanced', label: 'Advanced' },
            ]}
          />
          <div className="modal-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditPathModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Module Modal */}
      <Modal
        isOpen={isAddModuleModalOpen}
        onClose={() => setIsAddModuleModalOpen(false)}
        title="Add New Module"
      >
        <form onSubmit={handleAddModule} className="add-module-form">
          <Input
            label="Module Title"
            placeholder="e.g. Storage, Filesystems & Disk Management"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            required
          />
          <Textarea
            label="Module Description"
            rows={2}
            placeholder="Summary of topics covered in this module..."
            value={moduleDescription}
            onChange={(e) => setModuleDescription(e.target.value)}
          />
          <div className="modal-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModuleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Add Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        title="Add New Topic to Module"
      >
        <form onSubmit={handleAddTopic} className="add-topic-form">
          <Input
            label="Topic Title"
            placeholder="e.g. LVM & Volume Expansion"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            required
          />
          <Textarea
            label="Learning Objective (Outcome-focused)"
            rows={2}
            placeholder="e.g. Create, format, and resize physical volumes and logical volumes unaided."
            value={topicObjective}
            onChange={(e) => setTopicObjective(e.target.value)}
            required
          />
          <Input
            label="Estimated Duration (Minutes)"
            type="number"
            min={15}
            max={240}
            value={topicDuration}
            onChange={(e) => setTopicDuration(e.target.value)}
            required
          />
          <div className="modal-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddTopicModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Add Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
