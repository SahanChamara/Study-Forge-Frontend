import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Input } from '../components/ui/Input';
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
    return path.modules.map((m) => ({
      ...m,
      topics: path.topics?.filter((t) => t.moduleId === m.id) || [],
    }));
  }, [path]);

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
      <section className="path-detail-view">
        <Skeleton variant="rectangular" height={160} style={{ marginBottom: 24 }} />
        <Skeleton variant="rectangular" height={100} style={{ marginBottom: 16 }} />
        <Skeleton variant="rectangular" height={100} />
      </section>
    );
  }

  if (!path) {
    return (
      <section className="path-detail-view">
        <Alert variant="error" message={error || 'Learning path not found.'} onRetry={loadPath} />
        <Link to="/paths" className="btn btn-secondary">
          ← Return to Paths Directory
        </Link>
      </section>
    );
  }

  const topicCount = path.topics?.length || 0;
  const masteredCount = path.topics?.filter((t) => t.status === 'mastered').length || 0;
  const inProgressCount =
    path.topics?.filter((t) => ['learning', 'practicing', 'review'].includes(t.status)).length || 0;

  return (
    <section className="path-detail-view">
      {/* Path Header Hero */}
      <Card className="path-hero-card" padded={false}>
        <CardHeader>
          <div className="path-hero-eyebrow">
            <Badge variant="neutral">{path.targetLevel}</Badge>
            <span className="path-counts-tag">
              {path.modules?.length || 0} Modules · {topicCount} Topics
            </span>
          </div>
          <div className="path-header-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditPathModalOpen(true)}
            >
              ✏️ Edit Path
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDeletePath}
              className="btn-delete-path"
            >
              🗑️ Delete
            </Button>
          </div>
        </CardHeader>
        <CardBody className="path-hero-body">
          <h1 className="path-hero-title">{path.title}</h1>
          <p className="path-hero-goal">🎯 {path.goal}</p>
          {path.description && <p className="path-hero-desc">{path.description}</p>}

          <div className="path-hero-progress-section">
            <div className="path-progress-stats">
              <span>
                <strong>{masteredCount}</strong> Mastered
              </span>
              <span>
                <strong>{inProgressCount}</strong> In Progress
              </span>
              <span>
                <strong>{topicCount - masteredCount - inProgressCount}</strong> Not Started
              </span>
            </div>
            <ProgressBar
              value={path.progressPercent || 0}
              label="Overall Completion"
              variant={path.progressPercent && path.progressPercent >= 80 ? 'success' : 'accent'}
              size="lg"
            />
          </div>
        </CardBody>
      </Card>

      {error && <Alert variant="error" message={error} onRetry={loadPath} />}

      {/* Module Hierarchy Section Header */}
      <div className="module-section-header">
        <div>
          <div className="eyebrow">CURRICULUM MODULES</div>
          <h2>Ordered Modules & Hands-on Topics</h2>
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
        <div className="module-list">
          {moduleGroups.map((m, mIndex) => (
            <article className="module-card" key={m.id}>
              <div className="module-heading">
                <div className="module-heading-main">
                  <span className="module-index-badge">Module {mIndex + 1}</span>
                  <div>
                    <h3 className="module-title">{m.title}</h3>
                    {m.description && <p className="module-desc">{m.description}</p>}
                  </div>
                </div>
                <div className="module-heading-right">
                  <span className="module-topic-count">{m.topics.length} topics</span>
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
              </div>

              {/* Topics inside Module */}
              <div className="module-topics-list">
                {m.topics.length > 0 ? (
                  m.topics.map((t, tIndex) => (
                    <div className="topic-row" key={t.id}>
                      <div className="topic-main">
                        <div className="topic-title-wrapper">
                          <span className="topic-order">{tIndex + 1}.</span>
                          <Link
                            to={`/paths/${path.id}/topics/${t.id}`}
                            className="topic-link"
                          >
                            <strong>{t.title}</strong>
                          </Link>
                          <span className="topic-duration-badge">⏱️ {t.estimatedMinutes}m</span>
                        </div>
                        {t.objective && <small className="topic-objective">{t.objective}</small>}
                      </div>

                      <div className="topic-controls">
                        {/* Status Select with Visual Badge */}
                        <div className="status-control-wrapper">
                          <select
                            className={`topic-status-select select-${t.status}`}
                            value={t.status}
                            onChange={(e) =>
                              handleUpdateTopic(
                                t,
                                e.target.value as TopicStatus,
                                t.mastery
                              )
                            }
                          >
                            <option value="not_started">Not Started</option>
                            <option value="learning">Learning</option>
                            <option value="practicing">Practicing</option>
                            <option value="review">Review</option>
                            <option value="mastered">Mastered</option>
                          </select>
                        </div>

                        {/* Mastery Level Selector */}
                        <div className="mastery-control-wrapper">
                          <select
                            className="topic-mastery-select"
                            value={t.mastery}
                            onChange={(e) =>
                              handleUpdateTopic(
                                t,
                                t.status,
                                Number(e.target.value) as MasteryLevel
                              )
                            }
                            title="Mastery Scale (0: None to 5: Troubleshooting)"
                          >
                            <option value={0}>M0</option>
                            <option value={1}>M1</option>
                            <option value={2}>M2</option>
                            <option value={3}>M3</option>
                            <option value={4}>M4</option>
                            <option value={5}>M5</option>
                          </select>
                        </div>

                        <Link
                          to={`/paths/${path.id}/topics/${t.id}`}
                          className="btn btn-secondary btn-sm topic-open-btn"
                        >
                          Study →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-module-message">
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
            </article>
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
          <div className="form-field">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Target Level</label>
            <select
              className="form-input"
              value={editTargetLevel}
              onChange={(e) => setEditTargetLevel(e.target.value)}
            >
              <option value="foundation">Foundation</option>
              <option value="practical">Practical</option>
              <option value="job-ready">Job-Ready</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="modal-actions">
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
          <div className="form-field">
            <label className="form-label">Module Description</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Summary of topics covered in this module..."
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
            />
          </div>
          <div className="modal-actions">
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
          <div className="form-field">
            <label className="form-label">Learning Objective (Outcome-focused)</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Create, format, and resize physical volumes and logical volumes unaided."
              value={topicObjective}
              onChange={(e) => setTopicObjective(e.target.value)}
              required
            />
          </div>
          <Input
            label="Estimated Duration (Minutes)"
            type="number"
            min={15}
            max={240}
            value={topicDuration}
            onChange={(e) => setTopicDuration(e.target.value)}
            required
          />
          <div className="modal-actions">
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
    </section>
  );
};
