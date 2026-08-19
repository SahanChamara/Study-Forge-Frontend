import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { LearningPath, PracticeTask, PracticeTaskType, TaskStatus } from '../types';

export const PracticePage: React.FC = () => {
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
  const [selectedType, setSelectedType] = useState<'all' | PracticeTaskType>('all');
  const [selectedPathId, setSelectedPathId] = useState('all');
  const [expandedEvidenceTaskId, setExpandedEvidenceTaskId] = useState<string | null>(null);
  const [evidenceEdits, setEvidenceEdits] = useState<Record<string, string>>({});
  const [savingEvidenceId, setSavingEvidenceId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newType, setNewType] = useState<PracticeTaskType>('command');
  const [newCriteria, setNewCriteria] = useState('');
  const [newPathId, setNewPathId] = useState('');
  const [newTopicId, setNewTopicId] = useState('');
  const [isSubmittingNewTask, setIsSubmittingNewTask] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksData, pathsData] = await Promise.all([
        api<PracticeTask[]>('/practice'),
        api<LearningPath[]>('/learning-paths'),
      ]);
      setTasks(tasksData);
      setPaths(pathsData);
      if (pathsData.length > 0) {
        setNewPathId(pathsData[0].id);
        if (pathsData[0].topics && pathsData[0].topics.length > 0) {
          setNewTopicId(pathsData[0].topics[0].id);
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practice tasks.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map path and topic names
  const pathMap = useMemo(() => {
    const map = new Map<string, string>();
    paths.forEach((p) => map.set(p.id, p.title));
    return map;
  }, [paths]);

  const topicMap = useMemo(() => {
    const map = new Map<string, string>();
    paths.forEach((p) => {
      p.topics?.forEach((t) => map.set(t.id, t.title));
    });
    return map;
  }, [paths]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const doing = tasks.filter((t) => t.status === 'doing').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, doing, todo, rate };
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedPathId !== 'all' && t.pathId !== selectedPathId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = t.title.toLowerCase().includes(q);
        const inInstr = t.instructions?.toLowerCase().includes(q);
        if (!inTitle && !inInstr) return false;
      }
      return true;
    });
  }, [tasks, selectedStatus, selectedType, selectedPathId, searchQuery]);

  // Toggle or change status handler
  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updated = await api<PracticeTask>(`/practice/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status.');
    }
  };

  // Save terminal evidence handler
  const handleSaveEvidence = async (taskId: string) => {
    const evidenceText = evidenceEdits[taskId];
    if (evidenceText === undefined) return;

    setSavingEvidenceId(taskId);
    try {
      const updated = await api<PracticeTask>(`/practice/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ evidence: evidenceText }),
      });
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      setSavingEvidenceId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save evidence.');
      setSavingEvidenceId(null);
    }
  };

  // Create new task handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmittingNewTask(true);
    try {
      const created = await api<PracticeTask>('/practice', {
        method: 'POST',
        body: JSON.stringify({
          pathId: newPathId,
          topicId: newTopicId,
          title: newTitle.trim(),
          instructions: newInstructions.trim(),
          type: newType,
          status: 'todo',
          evidence: '',
          verificationCriteria: newCriteria.trim(),
        }),
      });

      setTasks([...tasks, created]);
      setNewTitle('');
      setNewInstructions('');
      setNewCriteria('');
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create practice task.');
    } finally {
      setIsSubmittingNewTask(false);
    }
  };

  // Delete task handler
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Delete this practice task?')) return;
    try {
      await api(`/practice/${taskId}`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task.');
    }
  };

  return (
    <section className="practice-page-view">
      <header className="page-header">
        <div>
          <div className="eyebrow">HANDS-ON LABS</div>
          <h1>Practice Queue</h1>
          <p>Executable hands-on exercises, command recipes, and terminal proof submission.</p>
        </div>
        <Button
          variant="accent"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon="＋"
        >
          Add Lab Task
        </Button>
      </header>

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Progress & Summary Stats Banner */}
      <div className="practice-stats-banner">
        <div className="practice-stats-grid">
          <div className="practice-stat-box">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-lbl">Total Tasks</span>
          </div>
          <div className="practice-stat-box stat-done-box">
            <span className="stat-num">{stats.completed}</span>
            <span className="stat-lbl">Completed</span>
          </div>
          <div className="practice-stat-box stat-doing-box">
            <span className="stat-num">{stats.doing}</span>
            <span className="stat-lbl">In Progress</span>
          </div>
          <div className="practice-stat-box">
            <span className="stat-num">{stats.todo}</span>
            <span className="stat-lbl">To Do</span>
          </div>
        </div>
        <div className="practice-progress-box">
          <ProgressBar
            value={stats.rate}
            label="Practice Mastery Completion Rate"
            showPercent
            variant="accent"
            size="md"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="practice-filter-bar">
        <div className="practice-search-wrapper">
          <Input
            placeholder="Search tasks by command, error message, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="practice-path-select-wrapper">
          <select
            className="practice-path-dropdown"
            value={selectedPathId}
            onChange={(e) => setSelectedPathId(e.target.value)}
          >
            <option value="all">All Learning Paths</option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Chips for Status & Type */}
      <div className="practice-chips-row">
        <div className="chips-group">
          <span className="chips-label">Status:</span>
          {(['all', 'todo', 'doing', 'done'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-chip ${selectedStatus === st ? 'active' : ''}`}
              onClick={() => setSelectedStatus(st)}
            >
              {st === 'all' ? 'All Status' : st === 'doing' ? 'In Progress' : st.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="chips-group">
          <span className="chips-label">Task Type:</span>
          {(['all', 'command', 'configuration', 'troubleshooting', 'lab'] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              className={`filter-chip ${selectedType === tp ? 'active' : ''}`}
              onClick={() => setSelectedType(tp)}
            >
              {tp === 'all' ? 'All Types' : tp.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task Queue List */}
      {loading ? (
        <div className="practice-tasks-stack">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={180} />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="practice-tasks-stack">
          {filteredTasks.map((task) => {
            const isExpanded = expandedEvidenceTaskId === task.id;
            const currentEvidence =
              evidenceEdits[task.id] !== undefined
                ? evidenceEdits[task.id]
                : task.evidence;
            const pathTitle = pathMap.get(task.pathId) || 'Path';
            const topicTitle = topicMap.get(task.topicId) || 'Topic';

            return (
              <Card
                key={task.id}
                className={`practice-task-card status-${task.status}`}
              >
                <CardHeader>
                  <div className="task-card-header-left">
                    <label className="task-checkbox-label">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={() =>
                          handleUpdateStatus(
                            task.id,
                            task.status === 'done' ? 'todo' : 'done'
                          )
                        }
                      />
                      <span className="task-checkbox-custom" />
                    </label>
                    <div>
                      <div className="task-breadcrumbs-meta">
                        <span className="task-path-tag">{pathTitle}</span>
                        <span className="separator">/</span>
                        <span className="task-topic-tag">{topicTitle}</span>
                      </div>
                      <h3
                        className={`task-title-text ${
                          task.status === 'done' ? 'is-completed' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  <div className="task-card-header-right">
                    <span className={`task-type-chip type-${task.type}`}>
                      {task.type}
                    </span>
                    <select
                      className={`task-status-dropdown status-select-${task.status}`}
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateStatus(task.id, e.target.value as TaskStatus)
                      }
                    >
                      <option value="todo">To Do</option>
                      <option value="doing">In Progress</option>
                      <option value="done">Completed</option>
                    </select>
                    <button
                      type="button"
                      className="task-delete-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      ×
                    </button>
                  </div>
                </CardHeader>

                <CardBody>
                  {task.instructions && (
                    <div className="task-instructions-box">
                      <strong>Instructions:</strong>
                      <p>{task.instructions}</p>
                    </div>
                  )}

                  {task.verificationCriteria && (
                    <div className="task-criteria-box">
                      <span className="criteria-icon">🎯</span>
                      <div className="criteria-content">
                        <strong>Verification Criteria:</strong>
                        <p>{task.verificationCriteria}</p>
                      </div>
                    </div>
                  )}

                  {/* Terminal Evidence Drawer */}
                  <div className="task-evidence-section">
                    <button
                      type="button"
                      className="evidence-toggle-btn"
                      onClick={() =>
                        setExpandedEvidenceTaskId(isExpanded ? null : task.id)
                      }
                    >
                      <span>
                        {isExpanded ? '▼ Hide Evidence / Terminal Output' : '▶ Terminal Evidence & Proof'}
                      </span>
                      {task.evidence ? (
                        <span className="evidence-saved-badge">Proof Attached</span>
                      ) : (
                        <span className="evidence-empty-badge">No Proof Submitted</span>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="evidence-drawer-body">
                        <textarea
                          className="evidence-textarea"
                          placeholder="Paste terminal outputs, logs, command output, or verification proof..."
                          value={currentEvidence}
                          onChange={(e) =>
                            setEvidenceEdits({
                              ...evidenceEdits,
                              [task.id]: e.target.value,
                            })
                          }
                        />
                        <div className="evidence-actions">
                          <small>Submitted terminal proof verifies unaided mastery.</small>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={savingEvidenceId === task.id}
                            onClick={() => handleSaveEvidence(task.id)}
                          >
                            Save Evidence
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>

                <CardFooter>
                  <Link
                    to={`/paths/${task.pathId}/topics/${task.topicId}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Open Topic Study Workspace →
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="⚡"
          title="No practice tasks found"
          description="Create hands-on lab exercises and command tests to prove practical mastery."
          action={
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              ＋ Add First Lab Task
            </Button>
          }
        />
      )}

      {/* Create Lab Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Hands-on Practice Task"
      >
        <form onSubmit={handleCreateTask} className="create-task-form">
          <Input
            label="Task Title"
            placeholder="e.g. Break and fix systemd service permission issue"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="form-field">
            <label className="form-label">Task Type</label>
            <select
              className="form-input"
              value={newType}
              onChange={(e) => setNewType(e.target.value as PracticeTaskType)}
            >
              <option value="command">Command (CLI recipe execution)</option>
              <option value="configuration">Configuration (File modification & daemon reload)</option>
              <option value="troubleshooting">Troubleshooting (Root cause diagnosis & fix)</option>
              <option value="lab">Lab (Multi-step guided scenario)</option>
              <option value="conceptual">Conceptual (Diagram & architecture review)</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Instructions</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Step-by-step instructions or target problem statement..."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Verification Criteria (Proof of Completion)</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Service status active (running) and curl localhost:8080 returns 200 OK"
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
            />
          </div>

          <div className="form-grid-2col">
            <div className="form-field">
              <label className="form-label">Learning Path</label>
              <select
                className="form-input"
                value={newPathId}
                onChange={(e) => {
                  setNewPathId(e.target.value);
                  const selectedPath = paths.find((p) => p.id === e.target.value);
                  if (selectedPath?.topics?.[0]) {
                    setNewTopicId(selectedPath.topics[0].id);
                  }
                }}
              >
                {paths.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Topic</label>
              <select
                className="form-input"
                value={newTopicId}
                onChange={(e) => setNewTopicId(e.target.value)}
              >
                {paths
                  .find((p) => p.id === newPathId)
                  ?.topics?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
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
              loading={isSubmittingNewTask}
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};
