import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';
import type { LearningPath } from '../types';

type LevelFilter = 'all' | 'foundation' | 'practical' | 'job-ready';

export const PathsPage: React.FC = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

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
    <section className="paths-view">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <div className="eyebrow">CURRICULUM DIRECTORY</div>
          <h1>Learning Paths</h1>
          <p>Structured roadmaps with explicit module hierarchies and verified practice.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon="＋"
        >
          Create New Path
        </Button>
      </header>

      {error && <Alert variant="error" message={error} onRetry={loadPaths} />}

      {/* Filter & Search Bar */}
      <div className="paths-filter-bar">
        <div className="search-input-wrapper">
          <Input
            placeholder="Search paths by title, goal, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="paths-search-input"
          />
        </div>

        <div className="level-filter-chips">
          {(['all', 'foundation', 'practical', 'job-ready'] as LevelFilter[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`filter-chip ${levelFilter === lvl ? 'active' : ''}`}
              onClick={() => setLevelFilter(lvl)}
            >
              {lvl === 'all' ? 'All Levels' : lvl.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Path Cards Grid */}
      {loading ? (
        <div className="grid">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="path-card-skeleton">
              <Skeleton variant="text" width="30%" height={14} style={{ marginBottom: 12 }} />
              <Skeleton variant="text" width="80%" height={24} style={{ marginBottom: 8 }} />
              <Skeleton variant="text" width="95%" height={16} style={{ marginBottom: 16 }} />
              <Skeleton variant="rectangular" height={8} style={{ marginBottom: 16 }} />
              <Skeleton variant="text" width="40%" height={14} />
            </Card>
          ))}
        </div>
      ) : filteredPaths.length > 0 ? (
        <div className="grid">
          {filteredPaths.map((p) => {
            const topicCount = p.topics?.length || 0;
            const moduleCount = p.modules?.length || 0;
            const progress = p.progressPercent || 0;

            return (
              <Link to={`/paths/${p.id}`} key={p.id} className="path-card-link">
                <Card interactive padded={false} className="path-catalog-card">
                  <CardHeader>
                    <Badge variant="neutral">{p.targetLevel}</Badge>
                    <span className="path-module-badge">{moduleCount} modules · {topicCount} topics</span>
                  </CardHeader>
                  <CardBody>
                    <h2 className="path-card-title">{p.title}</h2>
                    <p className="path-card-goal">{p.goal || p.description}</p>
                    <div className="path-card-progress">
                      <ProgressBar
                        value={progress}
                        label="Path Progress"
                        variant={progress >= 80 ? 'success' : 'accent'}
                        size="sm"
                      />
                    </div>
                  </CardBody>
                  <CardFooter className="path-card-footer">
                    <span className="path-updated-text">
                      Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="path-explore-link">Open Path →</span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🗺️"
          title={searchQuery || levelFilter !== 'all' ? 'No matching paths found' : 'No learning paths yet'}
          description={
            searchQuery || levelFilter !== 'all'
              ? 'Try adjusting your search criteria or filter to see more learning paths.'
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
            helperText="The primary technology or domain you are mastering."
          />

          <Input
            label="Primary Goal"
            placeholder="e.g. Operate, automate, and troubleshoot Linux in production"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            helperText="What will you be able to build or do when complete?"
          />

          <div className="form-field">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Brief summary of prerequisites and depth..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-grid-2col">
            <div className="form-field">
              <label className="form-label">Target Level</label>
              <select
                className="form-input"
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
              >
                <option value="foundation">Foundation</option>
                <option value="practical">Practical</option>
                <option value="job-ready">Job-Ready</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Starter Roadmap Template</label>
              <select
                className="form-input"
                value={seedTemplate}
                onChange={(e) => setSeedTemplate(e.target.value)}
              >
                <option value="none">Empty Path (Build custom)</option>
                <option value="linux-devops">Linux for DevOps (3 modules, 7 topics)</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
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
    </section>
  );
};
