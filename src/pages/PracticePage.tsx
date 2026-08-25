import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
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

  const pathOptions = useMemo(() => [
    { value: 'all', label: 'All Learning Paths' },
    ...paths.map((p) => ({ value: p.id, label: p.title })),
  ], [paths]);

  const selectedPathTopics = useMemo(() => {
    const found = paths.find((p) => p.id === newPathId);
    return found?.topics || [];
  }, [paths, newPathId]);

  return (
    <div className="practice-page-container animate-fade-in">
      <PageHeader
        eyebrow="HANDS-ON LABS"
        title="Practice Queue"
        description="Executable hands-on exercises, command recipes, and terminal proof submission."
        actions={
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon="＋"
          >
            Add Lab Task
          </Button>
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Progress & Summary Stats Banner */}
      <Card className="practice-summary-card mb-6">
        <CardBody>
          <div className="practice-summary-flex">
            <div className="practice-stat-counters">
              <div className="counter-item">
                <span className="counter-num">{stats.total}</span>
                <span className="counter-lbl">Total Tasks</span>
              </div>
              <div className="counter-item counter-done">
                <span className="counter-num">{stats.completed}</span>
                <span className="counter-lbl">Completed</span>
              </div>
              <div className="counter-item counter-doing">
                <span className="counter-num">{stats.doing}</span>
                <span className="counter-lbl">In Progress</span>
              </div>
              <div className="counter-item">
                <span className="counter-num">{stats.todo}</span>
                <span className="counter-lbl">To Do</span>
              </div>
            </div>

            <div className="practice-bar-container">
              <ProgressBar
                value={stats.rate}
                label="Lab Mastery Rate"
                showPercent
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filter and Search Bar */}
      <div className="practice-filter-bar mb-4">
        <div className="practice-search-box">
          <SearchInput
            placeholder="Search tasks by command, error message, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="practice-path-select-box">
          <Select
            value={selectedPathId}
            onChange={(e) => setSelectedPathId(e.target.value)}
            options={pathOptions}
          />
        </div>
      </div>

      {/* Filter Chips for Status & Type */}
      <div className="practice-chips-bar mb-6">
        <div className="chips-cluster">
          <span className="chips-cluster-title">Status:</span>
          {(['all', 'todo', 'doing', 'done'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-chip-item ${selectedStatus === st ? 'is-active' : ''}`}
              onClick={() => setSelectedStatus(st)}
            >
              {st === 'all' ? 'All Status' : st === 'doing' ? 'In Progress' : st.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="chips-cluster">
          <span className="chips-cluster-title">Type:</span>
          {(['all', 'command', 'configuration', 'troubleshooting', 'lab'] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              className={`filter-chip-item ${selectedType === tp ? 'is-active' : ''}`}
              onClick={() => setSelectedType(tp)}
            >
              {tp === 'all' ? 'All Types' : tp.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task Queue List */}
      {loading ? (
        <div className="practice-cards-stack">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" width="30%" height={16} />
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="90%" height={40} />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="practice-cards-stack">
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
                className={`task-queue-card status-${task.status}`}
              >
                <CardHeader>
                  <div className="task-header-left">
                    <label className="task-row-checkbox">
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
                      <span className="checkbox-custom-indicator" />
                    </label>
                    <div>
                      <div className="task-hierarchy-meta">
                        <span className="meta-path-tag">{pathTitle}</span>
                        <span className="meta-slash">/</span>
                        <span className="meta-topic-tag">{topicTitle}</span>
                      </div>
                      <h3
                        className={`task-row-title ${
                          task.status === 'done' ? 'is-completed' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  <div className="task-header-right">
                    <span className={`task-badge-pill type-${task.type}`}>
                      {task.type}
                    </span>
                    <select
                      className={`task-inline-status-select status-select-${task.status}`}
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateStatus(task.id, e.target.value as TaskStatus)
                      }
                      aria-label="Update task status"
                    >
                      <option value="todo">To Do</option>
                      <option value="doing">In Progress</option>
                      <option value="done">Completed</option>
                    </select>
                    <button
                      type="button"
                      className="task-delete-icon-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete Task"
                    >
                      ×
                    </button>
                  </div>
                </CardHeader>

                <CardBody>
                  {task.instructions && (
                    <div className="task-instruction-block">
                      <strong>Instructions:</strong>
                      <p>{task.instructions}</p>
                    </div>
                  )}

                  {task.verificationCriteria && (
                    <div className="task-criteria-block">
                      <span className="criteria-emoji">🎯</span>
                      <div className="criteria-text">
                        <strong>Verification Criteria:</strong>
                        <p>{task.verificationCriteria}</p>
                      </div>
                    </div>
                  )}

                  {/* Terminal Evidence Drawer */}
                  <div className="task-evidence-area">
                    <button
                      type="button"
                      className="evidence-toggle-banner"
                      onClick={() =>
                        setExpandedEvidenceTaskId(isExpanded ? null : task.id)
                      }
                    >
                      <span>
                        {isExpanded ? '▼ Hide Evidence Proof' : '▶ Terminal Evidence Proof'}
                      </span>
                      {task.evidence ? (
                        <span className="proof-attached-tag">Proof Attached ✓</span>
                      ) : (
                        <span className="proof-none-tag">No Proof Submitted</span>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="evidence-panel-body">
                        <textarea
                          className="evidence-input-area"
                          placeholder="Paste terminal outputs, exit codes, or verification logs..."
                          value={currentEvidence}
                          onChange={(e) =>
                            setEvidenceEdits({
                              ...evidenceEdits,
                              [task.id]: e.target.value,
                            })
                          }
                        />
                        <div className="evidence-bottom-actions">
                          <small>Submitted terminal proof verifies hands-on mastery unaided.</small>
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
                    Open in Topic Study Workspace →
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
          actionLabel="Add First Lab Task"
          onAction={() => setIsCreateModalOpen(true)}
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

          <Select
            label="Task Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as PracticeTaskType)}
            options={[
              { value: 'command', label: 'Command (CLI recipe execution)' },
              { value: 'configuration', label: 'Configuration (File modification & daemon reload)' },
              { value: 'troubleshooting', label: 'Troubleshooting (Root cause diagnosis & fix)' },
              { value: 'lab', label: 'Lab (Multi-step guided scenario)' },
              { value: 'conceptual', label: 'Conceptual (Diagram & architecture review)' },
            ]}
          />

          <Textarea
            label="Instructions"
            rows={3}
            placeholder="Step-by-step instructions or target problem statement..."
            value={newInstructions}
            onChange={(e) => setNewInstructions(e.target.value)}
          />

          <Textarea
            label="Verification Criteria (Proof of Completion)"
            rows={2}
            placeholder="e.g. Service status active (running) and curl localhost:8080 returns 200 OK"
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
          />

          <div className="form-grid-2col">
            <Select
              label="Learning Path"
              value={newPathId}
              onChange={(e) => {
                setNewPathId(e.target.value);
                const selectedPath = paths.find((p) => p.id === e.target.value);
                if (selectedPath?.topics?.[0]) {
                  setNewTopicId(selectedPath.topics[0].id);
                }
              }}
              options={paths.map((p) => ({ value: p.id, label: p.title }))}
            />

            <Select
              label="Topic"
              value={newTopicId}
              onChange={(e) => setNewTopicId(e.target.value)}
              options={selectedPathTopics.map((t) => ({ value: t.id, label: t.title }))}
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
              loading={isSubmittingNewTask}
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
