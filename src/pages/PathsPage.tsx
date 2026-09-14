import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import type { LearningPath, Topic } from '../types';

export const PathsPage: React.FC = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  // Create Path Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [targetLevel, setTargetLevel] = useState('job-ready');
  const [seedTemplate, setSeedTemplate] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPaths = () => {
    setLoading(true);
    setError('');
    api<LearningPath[]>('/learning-paths')
      .then((data) => {
        setPaths(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load learning paths.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPaths();
  }, []);

  // Filtered paths
  const filteredPaths = useMemo(() => {
    return paths.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        levelFilter === 'all' ||
        p.targetLevel.toLowerCase().includes(levelFilter.toLowerCase());

      return matchesSearch && matchesLevel;
    });
  }, [paths, searchQuery, levelFilter]);

  // Overall Curricula Statistics
  const stats = useMemo(() => {
    const totalPaths = paths.length;
    const allTopics = paths.flatMap((p) => p.topics || []);
    const totalTopics = allTopics.length;
    const masteredTopics = allTopics.filter((t) => t.status === 'mastered').length;
    const totalMinutes = allTopics.reduce((sum, t) => sum + (t.estimatedMinutes || 45), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return { totalPaths, totalTopics, masteredTopics, totalHours };
  }, [paths]);

  // Helper to determine the Next Action topic for a given path
  const getNextActionTopic = (p: LearningPath): Topic | null => {
    if (!p.topics || p.topics.length === 0) return null;
    const inProgress = p.topics.find((t) => ['learning', 'practicing', 'review'].includes(t.status));
    if (inProgress) return inProgress;
    return p.topics.find((t) => t.status === 'not_started') || p.topics[0] || null;
  };

  const handleCreatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await api<LearningPath>('/learning-paths', {
        method: 'POST',
        body: JSON.stringify({
          title,
          goal: goal || 'Build practical working knowledge',
          description,
          targetLevel,
          seedTemplate: seedTemplate !== 'none' ? seedTemplate : undefined,
        }),
      });

      setTitle('');
      setGoal('');
      setDescription('');
      setSeedTemplate('none');
      setIsCreateModalOpen(false);
      loadPaths();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create path.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="paths-page-container animate-fade-in">
      <PageHeader
        eyebrow="CURRICULUM ROADMAPS"
        title="Learning Paths"
        description="Structured engineering curriculums with explicit module hierarchies, deliberate practice, and verifiable proof."
        actions={
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon="＋"
          >
            Create New Path
          </Button>
        }
      />

      {error && <Alert variant="error" message={error} onRetry={loadPaths} />}

      {/* Curriculum Directory Summary Strip */}
      <div className="paths-stats-strip mb-6">
        <div className="paths-stat-item">
          <span className="paths-stat-label">Active Roadmaps</span>
          <strong className="paths-stat-val">{stats.totalPaths} Curricula</strong>
        </div>
        <div className="paths-stat-item">
          <span className="paths-stat-label">Total Topics</span>
          <strong className="paths-stat-val">{stats.totalTopics} Topics</strong>
        </div>
        <div className="paths-stat-item">
          <span className="paths-stat-label">Verified Mastered</span>
          <strong className="paths-stat-val text-success">{stats.masteredTopics} Mastered</strong>
        </div>
        <div className="paths-stat-item">
          <span className="paths-stat-label">Estimated Depth</span>
          <strong className="paths-stat-val text-primary">{stats.totalHours} Hours</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="catalog-filter-bar mb-6">
        <div className="filter-search-box">
          <SearchInput
            placeholder="Search paths by title, goal, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="filter-level-segments">
          <SegmentedControl
            options={[
              { id: 'all', label: 'All Levels' },
              { id: 'foundation', label: 'Foundation' },
              { id: 'practical', label: 'Practical' },
              { id: 'job-ready', label: 'Job-Ready' },
              { id: 'advanced', label: 'Advanced' },
            ]}
            value={levelFilter}
            onChange={setLevelFilter}
            size="sm"
          />
        </div>
      </div>

      {/* Path Cards Grid */}
      {loading ? (
        <div className="paths-catalog-grid">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" width="35%" height={16} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="95%" height={16} />
                <Skeleton variant="rectangular" height={8} />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredPaths.length > 0 ? (
        <div className="paths-catalog-grid">
          {filteredPaths.map((p) => {
            const topicCount = p.topics?.length || 0;
            const moduleCount = p.modules?.length || 0;
            const masteredCount = p.topics?.filter((t) => t.status === 'mastered').length || 0;
            const progress = p.progressPercent || 0;
            const nextActionTopic = getNextActionTopic(p);

            return (
              <div key={p.id} className="path-card-wrapper">
                <Card interactive padded={false} className="path-card-item">
                  <CardHeader>
                    <div className="path-card-header-top">
                      <Badge variant="neutral">{p.targetLevel}</Badge>
                      <span className="path-hierarchy-meta">
                        {moduleCount} {moduleCount === 1 ? 'module' : 'modules'} · {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <Link to={`/paths/${p.id}`} className="path-card-title-anchor">
                      <h2 className="path-title-heading">{p.title}</h2>
                    </Link>
                    <p className="path-goal-summary">{p.goal || p.description}</p>

                    {/* Next Action Callout Strip */}
                    {nextActionTopic ? (
                      <div className="path-next-action-strip">
                        <div className="next-action-icon">🎯</div>
                        <div className="next-action-details">
                          <span className="next-action-tag">NEXT ACTION</span>
                          <Link
                            to={`/paths/${p.id}/topics/${nextActionTopic.id}`}
                            className="next-action-title"
                          >
                            {nextActionTopic.title}
                          </Link>
                        </div>
                        <span className="next-action-time">⏱️ {nextActionTopic.estimatedMinutes}m</span>
                      </div>
                    ) : (
                      <div className="path-next-action-strip complete">
                        <div className="next-action-icon">🏆</div>
                        <div className="next-action-details">
                          <span className="next-action-tag">STATUS</span>
                          <span className="next-action-title">All Topics Completed</span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar with Fraction */}
                    <div className="path-progress-box mt-4">
                      <div className="path-progress-meta-row">
                        <span className="progress-meta-label">Curriculum Mastery</span>
                        <span className="progress-meta-fraction">
                          {masteredCount} of {topicCount} Mastered ({progress}%)
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        variant={progress >= 80 ? 'success' : 'primary'}
                        size="sm"
                      />
                    </div>
                  </CardBody>

                  <CardFooter className="path-card-footer-flex">
                    <span className="path-updated-date">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                    <Link to={`/paths/${p.id}`} className="path-open-action-btn">
                      View Curriculum →
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🗺️"
          title={searchQuery || levelFilter !== 'all' ? 'No matching paths found' : 'No learning paths yet'}
          description={
            searchQuery || levelFilter !== 'all'
              ? 'Try adjusting your search query or level filter to see more learning paths.'
              : 'Create your first structured curriculum or seed the reference Linux for DevOps roadmap.'
          }
          actionLabel="Create First Path"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Learning Path Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Learning Path"
      >
        <form onSubmit={handleCreatePath} className="create-path-form">
          <Input
            label="Path Title"
            placeholder="e.g. Linux for DevOps, Docker Mastery, Kubernetes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            helperText="The primary technology or engineering domain you are mastering."
          />

          <Input
            label="Primary Goal"
            placeholder="e.g. Operate, automate, and troubleshoot Linux in production"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            helperText="What will you be able to build or implement when completed?"
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Brief summary of prerequisites and target depth..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="form-grid-2col">
            <Select
              label="Target Level"
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              options={[
                { value: 'foundation', label: 'Foundation' },
                { value: 'practical', label: 'Practical' },
                { value: 'job-ready', label: 'Job-Ready' },
                { value: 'advanced', label: 'Advanced' },
              ]}
            />

            <Select
              label="Starter Roadmap Template"
              value={seedTemplate}
              onChange={(e) => setSeedTemplate(e.target.value)}
              options={[
                { value: 'none', label: 'Empty Path (Build custom)' },
                { value: 'linux-devops', label: 'Linux for DevOps (3 modules, 7 topics)' },
              ]}
            />
          </div>

          <div className="modal-form-actions">
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
              loading={isSubmitting}
            >
              Create Path
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
