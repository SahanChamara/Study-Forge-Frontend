import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { StatusPill } from '../components/ui/StatusPill';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { MarkdownPreview } from '../components/ui/MarkdownPreview';
import type { LearningPath, MasteryLevel, Note, PracticeTask, PracticeTaskType, Topic, TopicStatus, RecallQuestion } from '../types';

const defaultNoteTemplate = `# Topic Notes

## Why this matters
<!-- 2-3 sentences on why an engineer needs this skill in production -->

## Mental model
<!-- Core abstraction, architecture diagram, or high-level flow -->

## Key concepts
<!-- Essential terms, components, and subsystems -->
- 

## Commands / syntax
\`\`\`bash
# Essential command recipes with flags
\`\`\`

## Worked example
<!-- Real-world step-by-step production scenario -->

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
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);
  const [noteMode, setNoteMode] = useState<'edit' | 'preview'>('edit');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [evidenceEdits, setEvidenceEdits] = useState<Record<string, string>>({});
  const [savingEvidenceId, setSavingEvidenceId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Review Tab State
  const [reviewQuestions, setReviewQuestions] = useState<RecallQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [nextReviewDays, setNextReviewDays] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add Resource Modal State
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<PracticeTaskType>('command');
  const [newTaskInstructions, setNewTaskInstructions] = useState('');
  const [newTaskCriteria, setNewTaskCriteria] = useState('');
  const [isSubmittingNewTask, setIsSubmittingNewTask] = useState(false);

  const initialLoadedContent = useRef(defaultNoteTemplate);

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

      // Extract recall questions from note or construct default
      const extractedQuestions: RecallQuestion[] = [];
      if (notesData.length > 0 && notesData[0].contentMarkdown) {
        setNoteContent(notesData[0].contentMarkdown);
        initialLoadedContent.current = notesData[0].contentMarkdown;
        if (notesData[0].updatedAt) {
          setLastSavedTime(new Date(notesData[0].updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }

        // Parse questions from markdown
        const lines = notesData[0].contentMarkdown.split('\n');
        let currentQ = '';
        lines.forEach((line) => {
          if (line.startsWith('- Q: ')) {
            currentQ = line.replace('- Q: ', '').trim();
          } else if (line.startsWith('  A: ') && currentQ) {
            const ans = line.replace('  A: ', '').trim();
            extractedQuestions.push({
              id: `q-${extractedQuestions.length + 1}`,
              question: currentQ,
              suggestedAnswer: ans,
            });
            currentQ = '';
          }
        });
      } else {
        setNoteContent(defaultNoteTemplate);
        initialLoadedContent.current = defaultNoteTemplate;
      }

      // Fallback question if none found in note
      const currentTopicObj = pathData.topics?.find((t) => t.id === topicId);
      if (extractedQuestions.length === 0 && currentTopicObj) {
        extractedQuestions.push({
          id: 'q-default-1',
          question: `How do you fulfill the target outcome: "${currentTopicObj.objective}"?`,
          suggestedAnswer: `Demonstrate unaided execution of the core syntax, mental model, and verification commands for ${currentTopicObj.title}.`,
        });
      }

      setReviewQuestions(extractedQuestions);
      setActiveQuestionIndex(0);
      setIsAnswerRevealed(false);
      setReviewSubmitted(false);
      setHasUnsavedChanges(false);
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
      setHasUnsavedChanges(false);
      initialLoadedContent.current = noteContent;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowStr);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  // Handle Note Content Change
  const handleNoteContentChange = (newVal: string) => {
    setNoteContent(newVal);
    setHasUnsavedChanges(newVal !== initialLoadedContent.current);
  };

  // Add Practice task handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmittingNewTask(true);
    try {
      const created = await api<PracticeTask>('/practice', {
        method: 'POST',
        body: JSON.stringify({
          pathId,
          topicId,
          title: newTaskTitle.trim(),
          instructions: newTaskInstructions.trim(),
          type: newTaskType,
          status: 'todo',
          evidence: '',
          verificationCriteria: newTaskCriteria.trim(),
        }),
      });
      setTasks([...tasks, created]);
      setNewTaskTitle('');
      setNewTaskInstructions('');
      setNewTaskCriteria('');
      setIsAddTaskModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task.');
    } finally {
      setIsSubmittingNewTask(false);
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

  // Save evidence for task
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

  // Submit Spaced Recall Rating
  const handleRateRecall = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setSubmittingReview(true);
    try {
      const res = await api<{ success: boolean; updatedMastery: MasteryLevel; nextReviewDays: number }>(
        '/review/submit',
        {
          method: 'POST',
          body: JSON.stringify({
            topicId,
            rating,
          }),
        }
      );

      if (res.updatedMastery !== undefined) {
        handleUpdateTopicMetadata({ mastery: res.updatedMastery });
      }

      setNextReviewDays(res.nextReviewDays);
      setReviewSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review rating.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Mark as Mastered shortcut
  const handleMarkMastered = async () => {
    await handleUpdateTopicMetadata({ status: 'mastered', mastery: 4 });
    if (nextTopic) {
      navigate(`/paths/${pathId}/topics/${nextTopic.id}`);
    }
  };

  // Note Word & Character Metrics
  const noteMetrics = useMemo(() => {
    const clean = noteContent.replace(/#|\*|`|-/g, '').trim();
    const words = clean ? clean.split(/\s+/).length : 0;
    const chars = noteContent.length;
    return { words, chars };
  }, [noteContent]);

  if (loading) {
    return (
      <div className="workspace-loading-skeleton">
        <Skeleton variant="rectangular" height={60} />
        <div className="mt-4">
          <Skeleton variant="rectangular" height={140} />
        </div>
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
    <div className={`workspace-split-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''} animate-fade-in`}>
      {/* Collapsible Curriculum Tree Sidebar */}
      <aside className="workspace-curriculum-tree" aria-label="Curriculum Sidebar">
        <div className="curriculum-tree-top">
          <div className="curriculum-path-text">
            <span className="eyebrow">CURRICULUM TREE</span>
            <strong className="curriculum-heading" title={path.title}>
              {path.title}
            </strong>
          </div>
          <button
            type="button"
            className="curriculum-collapse-btn"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse curriculum tree"
            title="Collapse sidebar for distraction-free study"
          >
            ◀
          </button>
        </div>

        <div className="curriculum-tree-modules">
          {path.modules?.map((m, mIdx) => {
            const moduleTopics = path.topics?.filter((t) => t.moduleId === m.id) || [];
            return (
              <div key={m.id} className="tree-module-block">
                <div className="tree-module-title">
                  <span className="tree-module-idx">M{mIdx + 1}</span>
                  <span className="tree-module-name">{m.title}</span>
                </div>
                <div className="tree-topics-sublist">
                  {moduleTopics.map((t) => {
                    const isSelected = t.id === topicId;
                    return (
                      <Link
                        key={t.id}
                        to={`/paths/${path.id}/topics/${t.id}`}
                        className={`tree-topic-item ${isSelected ? 'is-current' : ''}`}
                      >
                        <span className={`tree-topic-dot status-dot-${t.status}`} />
                        <span className="tree-topic-name">{t.title}</span>
                        {t.status === 'mastered' && (
                          <span className="tree-topic-check" title="Mastered">✓</span>
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
      <div className="workspace-center-panel">
        {/* Top Control Bar & Sequence Nav */}
        <div className="workspace-nav-bar">
          <div className="workspace-nav-left">
            {sidebarCollapsed && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
                className="expand-curriculum-btn"
                title="Expand Curriculum Tree"
              >
                ▶ Curriculum
              </Button>
            )}
            <div className="workspace-breadcrumb-trail">
              <Link to={`/paths/${path.id}`}>{path.title}</Link>
              <span className="bc-sep">/</span>
              <span>{currentModule?.title || 'Module'}</span>
              <span className="bc-sep">/</span>
              <span className="bc-current">{currentTopic.title}</span>
            </div>
          </div>

          <div className="workspace-nav-seq">
            {previousTopic && (
              <Link
                to={`/paths/${path.id}/topics/${previousTopic.id}`}
                className="btn btn-secondary btn-sm"
              >
                ← Prev: {previousTopic.title.slice(0, 14)}...
              </Link>
            )}

            {nextTopic && (
              <Link
                to={`/paths/${path.id}/topics/${nextTopic.id}`}
                className="btn btn-primary btn-sm"
              >
                Next: {nextTopic.title.slice(0, 14)}... →
              </Link>
            )}
          </div>
        </div>

        {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

        {/* Topic Header Hero */}
        <Card className="topic-hero-card mb-6" padded={false}>
          <CardHeader>
            <div>
              <span className="eyebrow">
                {currentModule?.title?.toUpperCase()} · ~{currentTopic.estimatedMinutes} MIN ESTIMATE
              </span>
              <h1 className="topic-hero-title-text">{currentTopic.title}</h1>
            </div>

            {/* Status & Mastery Controls */}
            <div className="topic-header-controls-group">
              <div className="control-item">
                <label className="control-item-label">Status</label>
                <div className="status-badge-select">
                  <StatusPill status={currentTopic.status} size="sm" />
                  <select
                    className="topic-dropdown-select"
                    value={currentTopic.status}
                    onChange={(e) =>
                      handleUpdateTopicMetadata({
                        status: e.target.value as TopicStatus,
                      })
                    }
                    aria-label="Update topic status"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="learning">Learning</option>
                    <option value="practicing">Practicing</option>
                    <option value="review">In Review</option>
                    <option value="mastered">Mastered</option>
                  </select>
                </div>
              </div>

              <div className="control-item">
                <label className="control-item-label">Mastery Scale</label>
                <div className="mastery-pills-row">
                  {([0, 1, 2, 3, 4, 5] as MasteryLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`mastery-level-pill ${currentTopic.mastery === lvl ? 'is-active' : ''}`}
                      onClick={() => handleUpdateTopicMetadata({ mastery: lvl })}
                      title={masteryDescriptions[lvl]}
                    >
                      M{lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            {/* Outcome-Focused Objective Box */}
            <div className="topic-objective-callout">
              <div className="objective-icon-badge">🎯</div>
              <div className="objective-text-content">
                <strong>Target Learning Outcome:</strong>
                <p>{currentTopic.objective}</p>
                {currentTopic.prerequisites && currentTopic.prerequisites.length > 0 && (
                  <div className="prereq-list">
                    <span className="prereq-title">Prerequisites:</span>
                    {currentTopic.prerequisites.map((prereq, idx) => (
                      <span key={idx} className="prereq-tag">
                        {prereq}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 5-Tab Focused Workspace Navigation */}
        <div className="workspace-tabs-container mb-6">
          <Tabs
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                icon: '🎯',
              },
              {
                id: 'notes',
                label: 'Notes',
                icon: '📝',
                badge: notes.length > 0 ? 'Saved' : 'Draft',
              },
              {
                id: 'practice',
                label: 'Practice',
                icon: '⚡',
                badge: tasks.length,
              },
              {
                id: 'resources',
                label: 'Resources',
                icon: '📚',
                badge: currentTopic.resourceUrls?.length || 0,
              },
              {
                id: 'review',
                label: 'Review',
                icon: '🔄',
                badge: currentTopic.status === 'review' ? 'Due' : `M${currentTopic.mastery}`,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* ========================================= */}
        {/* Tab 1: Overview */}
        {/* ========================================= */}
        {activeTab === 'overview' && (
          <div className="tab-pane-content">
            {/* Why This Matters Callout */}
            <Card className="why-it-matters-card mb-6">
              <CardBody>
                <div className="why-matters-flex">
                  <span className="why-icon">💡</span>
                  <div className="why-content">
                    <h3>Why this skill matters in production</h3>
                    <p>
                      Mastering <strong>{currentTopic.title}</strong> ensures you can deploy, operate, and troubleshoot production environments unaided without relying on guess-and-check or copying unverified snippets.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Action Navigation Dock to Workspace Sections */}
            <div className="overview-quick-shortcuts mb-6">
              <Card interactive className="overview-shortcut-card" onClick={() => setActiveTab('notes')}>
                <CardBody>
                  <span className="shortcut-icon">📝</span>
                  <div>
                    <strong>Capture Smart Notes</strong>
                    <small>Synthesize mental models from memory</small>
                  </div>
                  <span className="shortcut-arrow">→</span>
                </CardBody>
              </Card>

              <Card interactive className="overview-shortcut-card" onClick={() => setActiveTab('practice')}>
                <CardBody>
                  <span className="shortcut-icon">⚡</span>
                  <div>
                    <strong>Hands-on Practice Labs</strong>
                    <small>{tasks.length} terminal tasks with verified proof</small>
                  </div>
                  <span className="shortcut-arrow">→</span>
                </CardBody>
              </Card>

              <Card interactive className="overview-shortcut-card" onClick={() => setActiveTab('review')}>
                <CardBody>
                  <span className="shortcut-icon">🔄</span>
                  <div>
                    <strong>Spaced Active Recall</strong>
                    <small>Reinforce retention & advance M0–M5 scale</small>
                  </div>
                  <span className="shortcut-arrow">→</span>
                </CardBody>
              </Card>
            </div>

            {/* 60-Minute Deliberate Practice Session Pacing Guide */}
            <Card className="session-shape-card mb-6">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">SESSION PACER</span>
                  <h3>Recommended 60-Minute Deliberate Practice Pacing</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="session-pacing-grid">
                  <div className="pacing-block">
                    <span className="pacing-time-pill">5 Min</span>
                    <strong>1. Recall &amp; Goal</strong>
                    <p>Review objectives &amp; test prior recall questions.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time-pill">20 Min</span>
                    <strong>2. Deep Learn</strong>
                    <p>Study docs &amp; build mental models without distraction.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time-pill">10 Min</span>
                    <strong>3. Smart Note</strong>
                    <p>Synthesize concepts &amp; command syntax from memory.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time-pill">20 Min</span>
                    <strong>4. Hands-on Lab</strong>
                    <p>Execute real tasks in terminal and test edge cases.</p>
                  </div>
                  <div className="pacing-block">
                    <span className="pacing-time-pill">5 Min</span>
                    <strong>5. Verify &amp; Rate</strong>
                    <p>Submit proof and update self-assessed mastery scale.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* ========================================= */}
        {/* Tab 2: Smart Notes */}
        {/* ========================================= */}
        {activeTab === 'notes' && (
          <div className="tab-pane-content">
            <Card className="smart-notes-card">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">STRUCTURED MARKDOWN</span>
                  <h3>Smart Notes (Write from memory)</h3>
                </div>

                <div className="notes-header-controls">
                  <div className="note-mode-segmented">
                    <button
                      type="button"
                      className={`mode-btn ${noteMode === 'edit' ? 'is-active' : ''}`}
                      onClick={() => setNoteMode('edit')}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${noteMode === 'preview' ? 'is-active' : ''}`}
                      onClick={() => setNoteMode('preview')}
                    >
                      👁 Live Preview
                    </button>
                  </div>

                  <div className="notes-save-meta">
                    {hasUnsavedChanges ? (
                      <span className="status-unsaved">● Unsaved changes</span>
                    ) : lastSavedTime ? (
                      <span className="status-saved">✓ Saved at {lastSavedTime}</span>
                    ) : null}

                    {noteSavedFeedback && (
                      <span className="saved-badge-pop">✓ Saved!</span>
                    )}
                  </div>

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
                {noteMode === 'edit' ? (
                  <>
                    <div className="template-snippets-bar">
                      <span className="snippets-label">Templates:</span>
                      <button
                        type="button"
                        className="template-btn"
                        onClick={() => handleNoteContentChange(defaultNoteTemplate)}
                      >
                        9-Section Template
                      </button>
                      <button
                        type="button"
                        className="template-btn"
                        onClick={() =>
                          handleNoteContentChange(
                            `${noteContent}\n\n## Mental model\n- Core abstraction:\n`
                          )
                        }
                      >
                        ＋ Mental Model
                      </button>
                      <button
                        type="button"
                        className="template-btn"
                        onClick={() =>
                          handleNoteContentChange(
                            `${noteContent}\n\n## Worked example\n\`\`\`bash\n# Example command\n\`\`\`\n`
                          )
                        }
                      >
                        ＋ Worked Example
                      </button>
                      <button
                        type="button"
                        className="template-btn"
                        onClick={() =>
                          handleNoteContentChange(
                            `${noteContent}\n\n## Pitfalls / debugging\n- Common error:\n  Root cause:\n`
                          )
                        }
                      >
                        ＋ Pitfall
                      </button>
                      <button
                        type="button"
                        className="template-btn"
                        onClick={() =>
                          handleNoteContentChange(
                            `${noteContent}\n\n## Recall questions\n- Q: \n  A: \n`
                          )
                        }
                      >
                        ＋ Recall Question
                      </button>
                    </div>

                    <textarea
                      className="note-markdown-textarea"
                      value={noteContent}
                      onChange={(e) => handleNoteContentChange(e.target.value)}
                      placeholder="Capture mental models, command syntax, pitfalls, and recall questions from memory..."
                    />

                    <div className="editor-footer-status">
                      <span>{noteMetrics.words} words · {noteMetrics.chars} chars</span>
                      <span>Markdown supported</span>
                    </div>
                  </>
                ) : (
                  <div className="note-preview-container">
                    <MarkdownPreview content={noteContent} />
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* ========================================= */}
        {/* Tab 3: Practice Labs */}
        {/* ========================================= */}
        {activeTab === 'practice' && (
          <div className="tab-pane-content">
            <Card className="practice-labs-card">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">HANDS-ON LABS</span>
                  <h3>Prove Mastery with Practice Tasks</h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTaskModalOpen(true)}
                  leftIcon="＋"
                >
                  Add Lab Task
                </Button>
              </CardHeader>

              <CardBody>
                <div className="practice-tasks-stack">
                  {tasks.length > 0 ? (
                    tasks.map((task) => {
                      const isExpanded = expandedTaskId === task.id;
                      const currentEvidence =
                        evidenceEdits[task.id] !== undefined
                          ? evidenceEdits[task.id]
                          : task.evidence;

                      return (
                        <div
                          key={task.id}
                          className={`practice-task-item ${task.status === 'done' ? 'is-completed' : ''}`}
                        >
                          <div className="task-row-content">
                            <label className="task-check-wrapper">
                              <input
                                type="checkbox"
                                checked={task.status === 'done'}
                                onChange={() => handleToggleTask(task)}
                              />
                              <span className="task-checkbox-indicator" />
                            </label>

                            <div className="task-body-content">
                              <div className="task-title-line">
                                <span className={`task-badge-pill type-${task.type}`}>
                                  {task.type}
                                </span>
                                <strong className="task-title-heading">{task.title}</strong>
                              </div>

                              {task.instructions && (
                                <p className="task-instructions-text">{task.instructions}</p>
                              )}

                              {task.verificationCriteria && (
                                <div className="task-criteria-callout">
                                  <span className="criteria-heading">Criteria:</span>
                                  <span>{task.verificationCriteria}</span>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              className="task-evidence-toggle-btn"
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            >
                              {isExpanded ? 'Hide Proof ▲' : task.evidence ? 'View Proof ✓' : 'Add Proof ＋'}
                            </button>
                          </div>

                          {/* Expandable Evidence Drawer */}
                          {isExpanded && (
                            <div className="task-evidence-subpanel">
                              <label className="evidence-panel-label">Terminal Output / Evidence Proof:</label>
                              <textarea
                                className="evidence-text-input"
                                rows={4}
                                placeholder="Paste terminal output, command exit code, or verification proof..."
                                value={currentEvidence}
                                onChange={(e) =>
                                  setEvidenceEdits({
                                    ...evidenceEdits,
                                    [task.id]: e.target.value,
                                  })
                                }
                              />
                              <div className="evidence-footer-actions">
                                <small>Submitted proof verifies practical execution unaided.</small>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  loading={savingEvidenceId === task.id}
                                  onClick={() => handleSaveEvidence(task.id)}
                                >
                                  Save Proof
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-tasks-placeholder">
                      <p>No practice labs created for this topic yet.</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsAddTaskModalOpen(true)}
                      >
                        ＋ Create First Practice Task
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* ========================================= */}
        {/* Tab 4: Resources */}
        {/* ========================================= */}
        {activeTab === 'resources' && (
          <div className="tab-pane-content">
            <Card className="resources-hub-card">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">REFERENCE DOCUMENTATION</span>
                  <h3>Official Docs &amp; Command References</h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddResourceModalOpen(true)}
                  leftIcon="＋"
                >
                  Add Resource Link
                </Button>
              </CardHeader>
              <CardBody>
                {currentTopic.resourceUrls && currentTopic.resourceUrls.length > 0 ? (
                  <div className="resources-link-list">
                    {currentTopic.resourceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-item-anchor"
                      >
                        <span className="resource-link-icon">🔗</span>
                        <div className="resource-link-details">
                          <strong className="resource-url-text">{url}</strong>
                          <small>External documentation reference</small>
                        </div>
                        <span className="external-arrow-icon">↗</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="empty-resources-box">
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

        {/* ========================================= */}
        {/* Tab 5: Review */}
        {/* ========================================= */}
        {activeTab === 'review' && (
          <div className="tab-pane-content">
            <Card className="topic-review-card">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">ACTIVE RECALL REPETITION</span>
                  <h3>Self-Assessed Spaced Review</h3>
                </div>
                <Badge variant="mastery" mastery={currentTopic.mastery}>
                  Current: M{currentTopic.mastery}
                </Badge>
              </CardHeader>

              <CardBody>
                {reviewSubmitted ? (
                  <div className="review-submitted-state">
                    <span className="celebration-icon">🎉</span>
                    <h3>Review Session Completed!</h3>
                    <p>
                      Your self-assessment has been recorded. Next spaced review is scheduled in{' '}
                      <strong>{nextReviewDays || 7} days</strong>.
                    </p>
                    <div className="review-submitted-actions mt-4">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setReviewSubmitted(false);
                          setIsAnswerRevealed(false);
                        }}
                      >
                        Review Again
                      </Button>
                      <Link to="/review" className="btn btn-primary btn-md">
                        View Global Recall Queue →
                      </Link>
                    </div>
                  </div>
                ) : reviewQuestions.length > 0 ? (
                  <div className="flashcard-active-session">
                    <div className="flashcard-progress-counter">
                      Question {activeQuestionIndex + 1} of {reviewQuestions.length}
                    </div>

                    <div className="flashcard-question-box">
                      <span className="question-tag">ACTIVE RECALL PROMPT</span>
                      <h3 className="question-prompt-text">
                        {reviewQuestions[activeQuestionIndex].question}
                      </h3>
                    </div>

                    {isAnswerRevealed ? (
                      <div className="flashcard-answer-revealed">
                        <span className="answer-tag">SUGGESTED ANSWER &amp; MENTAL MODEL</span>
                        <p className="answer-text">
                          {reviewQuestions[activeQuestionIndex].suggestedAnswer}
                        </p>

                        <div className="retention-rating-section mt-6">
                          <span className="rating-prompt-label">Rate your recall accuracy:</span>
                          <div className="rating-buttons-grid">
                            <button
                              type="button"
                              disabled={submittingReview}
                              className="rating-btn btn-again"
                              onClick={() => handleRateRecall('again')}
                            >
                              <strong>Again</strong>
                              <small>Forgot (1d)</small>
                            </button>
                            <button
                              type="button"
                              disabled={submittingReview}
                              className="rating-btn btn-hard"
                              onClick={() => handleRateRecall('hard')}
                            >
                              <strong>Hard</strong>
                              <small>Struggled (2d)</small>
                            </button>
                            <button
                              type="button"
                              disabled={submittingReview}
                              className="rating-btn btn-good"
                              onClick={() => handleRateRecall('good')}
                            >
                              <strong>Good</strong>
                              <small>Recalled (7d)</small>
                            </button>
                            <button
                              type="button"
                              disabled={submittingReview}
                              className="rating-btn btn-easy"
                              onClick={() => handleRateRecall('easy')}
                            >
                              <strong>Easy</strong>
                              <small>Mastered (21d)</small>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="reveal-answer-dock mt-6">
                        <p className="dock-hint">
                          Try answering from memory before revealing the answer.
                        </p>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => setIsAnswerRevealed(true)}
                        >
                          👁 Reveal Suggested Answer
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-review-state">
                    <p>No recall questions recorded for this topic yet.</p>
                    <p className="empty-hint">
                      Add recall questions in the Smart Notes tab under <code>## Recall questions</code>.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTab('notes')}
                    >
                      Open Smart Notes Tab →
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {/* Bottom Workflow Action Bar */}
        <div className="workspace-bottom-dock">
          <Link to={`/paths/${path.id}`} className="btn btn-secondary btn-sm">
            ← Return to Path Curriculum
          </Link>
          <div className="bottom-dock-actions">
            <Button
              variant="accent"
              size="md"
              onClick={handleMarkMastered}
            >
              🏆 Mark Mastered (M4) & Proceed
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
      </div>

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
          <div className="modal-form-actions">
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

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Add Hands-on Practice Task"
      >
        <form onSubmit={handleCreateTask} className="add-task-form">
          <Input
            label="Task Title"
            placeholder="e.g. Profile syscall execution counts with strace -c"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
          />

          <Select
            label="Task Type"
            value={newTaskType}
            onChange={(e) => setNewTaskType(e.target.value as PracticeTaskType)}
            options={[
              { value: 'command', label: 'Command (CLI recipe)' },
              { value: 'configuration', label: 'Configuration (File modification)' },
              { value: 'troubleshooting', label: 'Troubleshooting (Root cause fix)' },
              { value: 'lab', label: 'Lab (Multi-step scenario)' },
              { value: 'conceptual', label: 'Conceptual (Diagram & review)' },
            ]}
          />

          <Textarea
            label="Instructions"
            rows={3}
            placeholder="Step-by-step instructions or target problem statement..."
            value={newTaskInstructions}
            onChange={(e) => setNewTaskInstructions(e.target.value)}
          />

          <Textarea
            label="Verification Criteria"
            rows={2}
            placeholder="Proof of completion: command produces expected return code or terminal output"
            value={newTaskCriteria}
            onChange={(e) => setNewTaskCriteria(e.target.value)}
          />

          <div className="modal-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddTaskModalOpen(false)}
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
