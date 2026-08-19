import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { MasteryLevel, ReviewItem } from '../types';

interface ReviewSubmissionResult {
  success: boolean;
  updatedMastery: MasteryLevel;
  nextReviewDays: number;
}

export const ReviewPage: React.FC = () => {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ topicTitle: string; rating: string; newMastery: number }[]>([]);
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api<ReviewItem[]>('/review/queue');
      setQueue(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load review queue.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = queue.length;
    const dueToday = queue.filter((item) => new Date(item.nextReviewDue) <= new Date()).length;
    const masteredCount = queue.filter((item) => item.currentMastery >= 4).length;
    const retentionScore = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    return { total, dueToday, masteredCount, retentionScore };
  }, [queue]);

  // Start Recall Session
  const handleStartSession = (startIndex = 0) => {
    if (queue.length === 0) return;
    setCurrentSessionIndex(startIndex);
    setIsAnswerRevealed(false);
    setSessionCompleted(false);
    setSessionResults([]);
    setIsSessionActive(true);
  };

  // Submit Self-Assessment Rating
  const handleRateRetention = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentItem = queue[currentSessionIndex];
    if (!currentItem) return;

    setSubmittingRating(true);
    try {
      const res = await api<ReviewSubmissionResult>('/review/submit', {
        method: 'POST',
        body: JSON.stringify({
          topicId: currentItem.topicId,
          rating,
        }),
      });

      setSessionResults((prev) => [
        ...prev,
        {
          topicTitle: currentItem.topicTitle,
          rating,
          newMastery: res.updatedMastery,
        },
      ]);

      // Move to next card or complete session
      if (currentSessionIndex < queue.length - 1) {
        setCurrentSessionIndex((prev) => prev + 1);
        setIsAnswerRevealed(false);
      } else {
        setSessionCompleted(true);
      }
      setSubmittingRating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record review response.');
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <section className="review-page-view">
        <header className="page-header">
          <div>
            <div className="eyebrow">RETENTION & MASTERY</div>
            <h1>Spaced Review</h1>
          </div>
        </header>
        <div className="review-loading-stack">
          <Skeleton variant="rectangular" height={120} style={{ marginBottom: 20 }} />
          <Skeleton variant="rectangular" height={240} />
        </div>
      </section>
    );
  }

  // Active Recall Session Mode
  if (isSessionActive) {
    const currentItem = queue[currentSessionIndex];
    const currentQuestion = currentItem?.recallQuestions?.[0];
    const sessionProgress = Math.round(((currentSessionIndex + (sessionCompleted ? 1 : 0)) / queue.length) * 100);

    return (
      <section className="review-session-container">
        {/* Session Top Bar */}
        <div className="review-session-topbar">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setIsSessionActive(false);
              loadQueue();
            }}
          >
            ✕ Exit Session
          </button>
          <div className="session-counter">
            Card {currentSessionIndex + 1} of {queue.length}
          </div>
          <div className="session-progress-wrapper">
            <ProgressBar value={sessionProgress} showPercent={false} size="sm" variant="accent" />
          </div>
        </div>

        {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

        {!sessionCompleted && currentItem ? (
          <div className="flashcard-deck">
            <Card className="flashcard-card">
              <CardHeader>
                <div className="flashcard-meta">
                  <span className="badge badge-neutral">{currentItem.pathTitle}</span>
                  <span className="badge badge-mastery">Current: M{currentItem.currentMastery}</span>
                </div>
                <h2 className="flashcard-topic-title">{currentItem.topicTitle}</h2>
              </CardHeader>

              <CardBody>
                <div className="flashcard-prompt-box">
                  <span className="prompt-label">Active Recall Prompt:</span>
                  <p className="prompt-question">
                    {currentQuestion?.question || `Explain key concepts and command workflow for ${currentItem.topicTitle}`}
                  </p>
                </div>

                {!isAnswerRevealed ? (
                  <div className="reveal-answer-container">
                    <p className="reveal-instruction">
                      Formulate the mental model or commands in your head or on scratchpad before checking the answer.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      className="reveal-btn"
                      onClick={() => setIsAnswerRevealed(true)}
                    >
                      👁 Reveal Suggested Answer
                    </Button>
                  </div>
                ) : (
                  <div className="answer-revealed-container">
                    <div className="answer-box">
                      <span className="answer-label">Suggested Solution / Core Model:</span>
                      <p className="answer-text">
                        {currentQuestion?.suggestedAnswer || 'Review commands and troubleshooting workflow.'}
                      </p>
                    </div>

                    {/* 4-tier self assessment rating buttons */}
                    <div className="retention-rating-section">
                      <span className="rating-prompt-label">How well did you recall this?</span>
                      <div className="rating-buttons-grid">
                        <button
                          type="button"
                          className="btn-rating btn-rating-again"
                          disabled={submittingRating}
                          onClick={() => handleRateRetention('again')}
                        >
                          <strong>🟥 Again</strong>
                          <small>&lt; 1 Day (Reset M1)</small>
                        </button>

                        <button
                          type="button"
                          className="btn-rating btn-rating-hard"
                          disabled={submittingRating}
                          onClick={() => handleRateRetention('hard')}
                        >
                          <strong>🟧 Hard</strong>
                          <small>+2 Days (Keep Level)</small>
                        </button>

                        <button
                          type="button"
                          className="btn-rating btn-rating-good"
                          disabled={submittingRating}
                          onClick={() => handleRateRetention('good')}
                        >
                          <strong>🟩 Good</strong>
                          <small>+7 Days (+1 Mastery)</small>
                        </button>

                        <button
                          type="button"
                          className="btn-rating btn-rating-easy"
                          disabled={submittingRating}
                          onClick={() => handleRateRetention('easy')}
                        >
                          <strong>🟦 Easy</strong>
                          <small>+21 Days (M5 Mastered)</small>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          /* Session Completed Celebration Screen */
          <div className="session-complete-card">
            <Card className="celebration-card">
              <CardBody>
                <div className="celebration-icon">🎉</div>
                <h2>Recall Session Completed!</h2>
                <p>You reviewed {sessionResults.length} topics and reinforced long-term retention.</p>

                <div className="session-results-table">
                  {sessionResults.map((r, idx) => (
                    <div key={idx} className="result-row">
                      <span className="result-topic">{r.topicTitle}</span>
                      <span className={`result-rating rating-${r.rating}`}>{r.rating.toUpperCase()}</span>
                      <span className="badge badge-sm badge-mastery">New: M{r.newMastery}</span>
                    </div>
                  ))}
                </div>

                <div className="session-complete-actions">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setIsSessionActive(false);
                      loadQueue();
                    }}
                  >
                    Back to Review Queue →
                  </Button>
                  <Link to="/" className="btn btn-secondary btn-lg">
                    Return to Dashboard
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </section>
    );
  }

  // Standard Spaced Review Queue View
  return (
    <section className="review-page-view">
      <header className="page-header">
        <div>
          <div className="eyebrow">RETENTION & MASTERY (L-N-P-V-R)</div>
          <h1>Spaced Repetition Review</h1>
          <p>Deliberate recall intervals and self-assessment to transition working knowledge into permanent retention.</p>
        </div>
        {queue.length > 0 && (
          <Button
            variant="accent"
            size="lg"
            onClick={() => handleStartSession(0)}
            leftIcon="⚡"
          >
            Start Recall Session ({summary.dueToday} Due)
          </Button>
        )}
      </header>

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Review Metrics Banner */}
      <div className="review-stats-banner">
        <div className="review-stat-box">
          <span className="stat-num stat-due">{summary.dueToday}</span>
          <span className="stat-lbl">Due for Review</span>
        </div>
        <div className="review-stat-box">
          <span className="stat-num">{summary.total}</span>
          <span className="stat-lbl">Total in Queue</span>
        </div>
        <div className="review-stat-box">
          <span className="stat-num stat-mastered">{summary.masteredCount}</span>
          <span className="stat-lbl">Mastered (M4+)</span>
        </div>
        <div className="review-stat-box">
          <span className="stat-num">{summary.retentionScore}%</span>
          <span className="stat-lbl">Curriculum Retention</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="review-queue-section">
        <div className="queue-section-header">
          <h2>Scheduled Spaced Recall Items</h2>
          <span className="queue-count-badge">{queue.length} Topics Queued</span>
        </div>

        {queue.length > 0 ? (
          <div className="review-queue-stack">
            {queue.map((item, idx) => (
              <Card key={item.topicId} className="review-queue-card" interactive>
                <CardBody>
                  <div className="queue-card-top">
                    <div>
                      <div className="queue-path-tag">{item.pathTitle}</div>
                      <h3 className="queue-topic-title">{item.topicTitle}</h3>
                    </div>

                    <div className="queue-card-meta">
                      <span className="badge badge-mastery">Level M{item.currentMastery}</span>
                      <span className="due-status-chip">Due Today</span>
                    </div>
                  </div>

                  <p className="queue-prompt-preview">
                    🎯 {item.recallQuestions?.[0]?.question || 'Active recall question ready.'}
                  </p>
                </CardBody>

                <CardFooter>
                  <Link
                    to={`/paths/${item.pathId}/topics/${item.topicId}`}
                    className="btn btn-ghost btn-sm"
                  >
                    Open Topic Workspace →
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartSession(idx)}
                  >
                    Review Topic Now ⚡
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔄"
            title="All caught up on spaced reviews!"
            description="Great job! Your retention intervals are up to date. Keep studying active topics to add more items to your spaced repetition queue."
            action={
              <Link to="/paths" className="btn btn-primary">
                Explore Learning Paths →
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
};
