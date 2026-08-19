import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import type { LearningPath, MasteryLevel, Note, PracticeTask, Topic, TopicStatus } from '../types';

const defaultNoteTemplate = `# Topic Notes

## Why this matters
<!-- 2-3 sentences on why an engineer needs this skill -->

## Mental model
<!-- Core abstraction, architecture diagram, or high-level flow -->

## Key concepts
<!-- Essential terms and components -->
- 

## Commands / syntax
\`\`\`bash
# Essential command recipes with flags
\`\`\`

## Worked example
<!-- Real-world step-by-step scenario -->

## Pitfalls / debugging
<!-- Common error messages and their root causes -->

## Practice I completed
- [ ] 

## Recall questions
- Q: 
  A: 

## 5-line summary
1. 
2. 
3. 
4. 
5. `;

const masteryDescriptions: Record<MasteryLevel, string> = {
  0: '0 - Not Started: Have not studied this concept yet',
  1: '1 - Seen: Familiar with terms and high-level syntax',
  2: '2 - Can Follow: Can perform with step-by-step guided instructions',
  3: '3 - With Reference: Can complete using man pages and documentation',
  4: '4 - Unaided: Can operate confidently from memory without reference',
  5: '5 - Expert / Troubleshoot: Can diagnose failures and explain to others',
};

export const TopicPage: React.FC = () => {
  const { pathId, topicId } = useParams<{ pathId: string; topicId: string }>();
  const navigate = useNavigate();

  const [path, setPath] = useState<LearningPath | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [noteContent, setNoteContent] = useState(defaultNoteTemplate);
  const [taskTitle, setTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [error, setError] = useState('');

  // Add Resource Modal State
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);

  const loadTopicData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pathData, notesData, tasksData] = await Promise.all([
        api<LearningPath>(`/learning-paths/${pathId}`),
        api<Note[]>(`/notes?pathId=${pathId}&topicId=${topicId}`),
        api<PracticeTask[]>(`/practice?pathId=${pathId}&topicId=${topicId}`),
      ]);

      setPath(pathData);
      setNotes(notesData);
      setTasks(tasksData);

      if (notesData.length > 0 && notesData[0].contentMarkdown) {
        setNoteContent(notesData[0].contentMarkdown);
      } else {
        setNoteContent(defaultNoteTemplate);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topic workspace.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopicData();
  }, [pathId, topicId]);

  // Current topic & module
  const currentTopic = useMemo(() => {
    return path?.topics?.find((t) => t.id === topicId) || null;
  }, [path, topicId]);

  const currentModule = useMemo(() => {
    if (!currentTopic || !path?.modules) return null;
    return path.modules.find((m) => m.id === currentTopic.moduleId) || null;
  }, [path, currentTopic]);

  // Flattened topic list for sequential Previous / Next navigation
  const allTopicsInPath = useMemo(() => {
    if (!path?.modules || !path?.topics) return [];
    const sortedModules = [...path.modules].sort((a, b) => a.order - b.order);
    return sortedModules.flatMap((m) =>
      (path.topics?.filter((t) => t.moduleId === m.id) || []).sort(
        (a, b) => a.order - b.order
      )
    );
  }, [path]);

  const currentTopicIndex = useMemo(() => {
    return allTopicsInPath.findIndex((t) => t.id === topicId);
  }, [allTopicsInPath, topicId]);

  const previousTopic = useMemo(() => {
    if (currentTopicIndex > 0) return allTopicsInPath[currentTopicIndex - 1];
    return null;
  }, [allTopicsInPath, currentTopicIndex]);

  const nextTopic = useMemo(() => {
    if (currentTopicIndex >= 0 && currentTopicIndex < allTopicsInPath.length - 1) {
      return allTopicsInPath[currentTopicIndex + 1];
    }
    return null;
  }, [allTopicsInPath, currentTopicIndex]);

  // Status and Mastery update handler
  const handleUpdateTopicMetadata = async (
    updates: { status?: TopicStatus; mastery?: MasteryLevel; resourceUrls?: string[] }
  ) => {
    if (!currentTopic) return;
    try {
      const updated = await api<Topic>(`/learning-paths/${pathId}/topics/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (path && path.topics) {
        const newTopics = path.topics.map((t) => (t.id === topicId ? { ...t, ...updated } : t));
        setPath({ ...path, topics: newTopics });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic.');
    }
  };

  // Smart Note save handler
  const handleSaveNote = async () => {
    setSavingNote(true);
    setNoteSavedFeedback(false);
    try {
      if (notes.length > 0) {
        await api(`/notes/${notes[0].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ contentMarkdown: noteContent }),
        });
      } else {
        const created = await api<Note>('/notes', {
          method: 'POST',
          body: JSON.stringify({
            pathId,
            topicId,
            title: currentTopic?.title || 'Topic Note',
            contentMarkdown: noteContent,
            tags: [],
          }),
        });
        setNotes([created]);
      }
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Add Practice task handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const created = await api<PracticeTask>('/practice', {
        method: 'POST',
        body: JSON.stringify({
          pathId,
          topicId,
          title: taskTitle,
          instructions: '',
          type: 'command',
        }),
      });
      setTasks([...tasks, created]);
      setTaskTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task.');
    }
  };

  // Toggle Practice task status
  const handleToggleTask = async (task: PracticeTask) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const updated = await api<PracticeTask>(`/practice/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task.');
    }
  };

  // Add Resource URL
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceUrl.trim() || !currentTopic) return;

    setIsSubmittingResource(true);
    try {
      const updatedUrls = [...(currentTopic.resourceUrls || []), newResourceUrl.trim()];
      await handleUpdateTopicMetadata({ resourceUrls: updatedUrls });
      setNewResourceUrl('');
      setIsAddResourceModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource.');
    } finally {
      setIsSubmittingResource(false);
    }
  };

  // Mark as Mastered shortcut
  const handleMarkMastered = async () => {
    await handleUpdateTopicMetadata({ status: 'mastered', mastery: 4 });
    if (nextTopic) {
      navigate(`/paths/${pathId}/topics/${nextTopic.id}`);
    }
  };

  if (loading) {
    return (
      <div className="workspace-loading">
        <Skeleton variant="rectangular" height={60} style={{ marginBottom: 20 }} />
        <Skeleton variant="rectangular" height={140} style={{ marginBottom: 20 }} />
        <Skeleton variant="rectangular" height={400} />
      </div>
    );
  }

  if (!currentTopic || !path) {
    return (
      <div className="workspace-not-found">
        <Alert variant="error" message={error || 'Topic not found in this curriculum.'} />
        <Link to={`/paths/${pathId}`} className="btn btn-secondary">
          ← Return to Path
        </Link>
      </div>
    );
  }

  return (
    <div className={`workspace-layout ${sidebarCollapsed ? 'sidebar-hidden' : ''}`}>
      {/* Collapsible Curriculum Tree Sidebar */}
      <aside className="workspace-curriculum-sidebar">
        <div className="curriculum-sidebar-header">
          <div className="curriculum-path-info">
            <small className="curriculum-eyebrow">CURRICULUM TREE</small>
            <h3 className="curriculum-path-title" title={path.title}>
              {path.title}
            </h3>
          </div>
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse curriculum tree"
            title="Collapse sidebar for distraction-free study"
          >
            ◀
          </button>
        </div>

        <div className="curriculum-modules-nav">
          {path.modules?.map((m, mIdx) => {
            const moduleTopics = path.topics?.filter((t) => t.moduleId === m.id) || [];
            return (
              <div key={m.id} className="curriculum-module-group">
                <div className="curriculum-module-header">
                  <span className="curriculum-module-idx">M{mIdx + 1}</span>
                  <span className="curriculum-module-name">{m.title}</span>
                </div>
                <div className="curriculum-topics-list">
                  {moduleTopics.map((t) => {
                    const isSelected = t.id === topicId;
                    return (
                      <Link
                        key={t.id}
                        to={`/paths/${path.id}/topics/${t.id}`}
                        className={`curriculum-topic-item ${isSelected ? 'is-active' : ''} status-${t.status}`}
                      >
                        <span className="topic-status-dot" title={`Status: ${t.status}`} />
                        <span className="topic-nav-title">{t.title}</span>
                        {t.status === 'mastered' && (
                          <span className="topic-mastered-check" title="Mastered">✓</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Learning Workspace */}
      <main className="workspace-main-area">
        {/* Top Control Bar & Breadcrumbs */}
        <div className="workspace-topbar">
          <div className="workspace-topbar-left">
            {sidebarCollapsed && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
                className="expand-sidebar-btn"
                title="Expand Curriculum Tree"
              >
                ▶ Modules
              </Button>
            )}
            <div className="workspace-breadcrumbs">
              <Link to={`/paths/${path.id}`}>{path.title}</Link>
              <span className="separator">/</span>
              <span>{currentModule?.title || 'Module'}</span>
              <span className="separator">/</span>
              <span className="current-topic-label">{currentTopic.title}</span>
            </div>
          </div>

          <div className="workspace-seq-nav">
            {previousTopic ? (
              <Link
                to={`/paths/${path.id}/topics/${previousTopic.id}`}
                className="btn btn-secondary btn-sm"
              >
                ← Prev: {previousTopic.title.slice(0, 16)}...
              </Link>
            ) : (
              <span className="nav-placeholder" />
            )}

            {nextTopic ? (
              <Link
                to={`/paths/${path.id}/topics/${nextTopic.id}`}
                className="btn btn-primary btn-sm"
              >
                Next: {nextTopic.title.slice(0, 16)}... →
              </Link>
            ) : (
              <span className="nav-placeholder" />
            )}
          </div>
        </div>

        {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

        {/* Topic Header Hero */}
        <header className="topic-hero-header">
          <div className="topic-hero-top">
            <div>
              <div className="eyebrow">
                {currentModule?.title?.toUpperCase()} · {currentTopic.estimatedMinutes} MIN ESTIMATE
              </div>
              <h1 className="topic-title">{currentTopic.title}</h1>
            </div>

            {/* Status & Mastery Controls */}
            <div className="topic-lifecycle-controls">
              {/* Status Selector Dropdown */}
              <div className="control-group">
                <label className="control-label">Status</label>
                <select
                  className={`topic-status-select select-${currentTopic.status}`}
                  value={currentTopic.status}
                  onChange={(e) =>
                    handleUpdateTopicMetadata({
                      status: e.target.value as TopicStatus,
                    })
                  }
                >
                  <option value="not_started">Not Started</option>
                  <option value="learning">Learning</option>
                  <option value="practicing">Practicing</option>
                  <option value="review">In Review</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>

              {/* Mastery Level Selector Pills */}
              <div className="control-group">
                <label className="control-label">Mastery Scale</label>
                <div className="mastery-pill-selector">
                  {([0, 1, 2, 3, 4, 5] as MasteryLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`mastery-pill ${currentTopic.mastery === lvl ? 'active' : ''}`}
                      onClick={() => handleUpdateTopicMetadata({ mastery: lvl })}
                      title={masteryDescriptions[lvl]}
                    >
                      M{lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Outcome-Focused Objective Box */}
          <div className="topic-objective-box">
            <div className="objective-icon">🎯</div>
            <div className="objective-content">
              <strong className="objective-heading">Target Learning Outcome:</strong>
              <p className="objective-text">{currentTopic.objective}</p>
              {currentTopic.prerequisites && currentTopic.prerequisites.length > 0 && (
                <div className="prerequisites-tags">
                  <span className="prereq-label">Prerequisites:</span>
                  {currentTopic.prerequisites.map((prereq, idx) => (
                    <span key={idx} className="prereq-chip">
                      {prereq}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="workspace-tabs-wrapper">
          <Tabs
            tabs={[
              {
                id: 'overview',
                label: 'Overview & Resources',
                icon: '📚',
                badge: currentTopic.resourceUrls?.length || 0,
              },
              {
                id: 'notes',
                label: 'Smart Notes',
                icon: '📝',
                badge: notes.length > 0 ? 'Saved' : 'Draft',
              },
              {
                id: 'practice',
                label: 'Practice Labs',
                icon: '⚡',
                badge: tasks.length,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Tab 1: Overview & Resources */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-tab-content">
            {/* Session Shape Pacing Guide */}
            <Card className="session-shape-card">
              <CardHeader>
                <div className="eyebrow">SESSION PACER</div>
                <h3>Recommended 60-Minute Deliberate Practice Pacing</h3>
              </CardHeader>
              <CardBody>
                <div className="session-pacing-grid">
                  <div className="pacing-block">
                    <span className="pacing-time">5 Min</span>
                    <strong>1. Recall & Goal</strong>
                    <p>Review objectives & test prior recall questions.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time">20 Min</span>
                    <strong>2. Deep Learn</strong>
                    <p>Study docs & build mental models without distraction.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time">10 Min</span>
                    <strong>3. Smart Note</strong>
                    <p>Synthesize concepts & command syntax from memory.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time">20 Min</span>
                    <strong>4. Hands-on Lab</strong>
                    <p>Execute real tasks in terminal and test edge cases.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time">5 Min</span>
                    <strong>5. Verify & Rate</strong>
                    <p>Submit proof and update self-assessed mastery scale.</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Resources Reference Hub */}
            <Card className="resources-hub-card">
              <CardHeader>
                <div>
                  <div className="eyebrow">REFERENCE DOCUMENTATION</div>
                  <h3>Official Docs & Command References</h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddResourceModalOpen(true)}
                  leftIcon="＋"
                >
                  Add Resource
                </Button>
              </CardHeader>
              <CardBody>
                {currentTopic.resourceUrls && currentTopic.resourceUrls.length > 0 ? (
                  <div className="resources-list">
                    {currentTopic.resourceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-item-link"
                      >
                        <span className="resource-link-icon">🔗</span>
                        <div className="resource-link-details">
                          <strong className="resource-url-text">{url}</strong>
                          <small>External documentation reference</small>
                        </div>
                        <span className="external-icon">↗</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="empty-resources">
                    <p>No external resource links added for this topic yet.</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsAddResourceModalOpen(true)}
                    >
                      ＋ Add First Reference Link
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 2: Smart Notes */}
        {activeTab === 'notes' && (
          <div className="tab-content notes-tab-content">
            <Card className="smart-notes-card">
              <CardHeader>
                <div>
                  <div className="eyebrow">STRUCTURED MARKDOWN</div>
                  <h3>Smart Notes (Write from memory)</h3>
                </div>
                <div className="notes-actions">
                  {noteSavedFeedback && (
                    <span className="saved-feedback-badge">✓ Note Saved</span>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    loading={savingNote}
                    onClick={handleSaveNote}
                  >
                    Save Note
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="template-helper-bar">
                  <span className="template-helper-label">Quick Inserts:</span>
                  <button
                    type="button"
                    className="template-insert-btn"
                    onClick={() => setNoteContent(defaultNoteTemplate)}
                  >
                    Standard 9-Section Template
                  </button>
                </div>
                <textarea
                  className="note-editor-workspace"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Capture mental models, command syntax, pitfalls, and recall questions..."
                />
                <small className="editor-footer-text">
                  Formatted in Markdown. Stored and synced with your study path.
                </small>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Tab 3: Practice Labs */}
        {activeTab === 'practice' && (
          <div className="tab-content practice-tab-content">
            <Card className="practice-labs-card">
              <CardHeader>
                <div>
                  <div className="eyebrow">HANDS-ON LABS</div>
                  <h3>Prove Mastery with Practice Tasks</h3>
                </div>
              </CardHeader>
              <CardBody>
                <form className="add-task-inline-form" onSubmit={handleAddTask}>
                  <Input
                    placeholder="e.g. Inspect kernel ring buffer with dmesg and filter for errors..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary">
                    Add Lab Task
                  </Button>
                </form>

                <div className="workspace-task-list">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <label
                        key={task.id}
                        className={`workspace-task-row ${task.status === 'done' ? 'is-done' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={task.status === 'done'}
                          onChange={() => handleToggleTask(task)}
                        />
                        <div className="task-row-details">
                          <strong className="task-title">{task.title}</strong>
                          <span className="task-type-badge">{task.type}</span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="empty-tasks-box">
                      <p>No practice labs created for this topic yet.</p>
                      <small>Add hands-on tasks above to prove you can execute unaided.</small>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Bottom Workflow Action Bar */}
        <div className="workspace-bottom-bar">
          <div className="bottom-bar-left">
            <Link to={`/paths/${path.id}`} className="btn btn-secondary btn-sm">
              ← Return to Path Curriculum
            </Link>
          </div>
          <div className="bottom-bar-right">
            <Button
              variant="accent"
              size="md"
              onClick={handleMarkMastered}
            >
              🏆 Mark as Mastered (M4) & Proceed
            </Button>
            {nextTopic && (
              <Link
                to={`/paths/${path.id}/topics/${nextTopic.id}`}
                className="btn btn-primary btn-md"
              >
                Next Topic →
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Add Resource Link Modal */}
      <Modal
        isOpen={isAddResourceModalOpen}
        onClose={() => setIsAddResourceModalOpen(false)}
        title="Add Learning Resource Link"
      >
        <form onSubmit={handleAddResource} className="add-resource-form">
          <Input
            label="Resource URL"
            type="url"
            placeholder="https://man7.org/linux/man-pages/..."
            value={newResourceUrl}
            onChange={(e) => setNewResourceUrl(e.target.value)}
            required
            helperText="Link to official documentation, standard specifications, or cheatsheets."
          />
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddResourceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmittingResource}
            >
              Add Reference
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
