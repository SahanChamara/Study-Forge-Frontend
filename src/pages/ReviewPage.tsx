import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
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
      <div className="review-page-container">
        <Skeleton variant="rectangular" height={100} />
        <div className="mt-6">
          <Skeleton variant="rectangular" height={240} />
        </div>
      </div>
    );
  }

  // Active Recall Session Mode
  if (isSessionActive) {
    const currentItem = queue[currentSessionIndex];
    const currentQuestion = currentItem?.recallQuestions?.[0];
    const sessionProgress = Math.round(((currentSessionIndex + (sessionCompleted ? 1 : 0)) / queue.length) * 100);

    return (
      <div className="review-session-container animate-fade-in">
        {/* Session Top Bar */}
        <div className="review-session-topbar mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsSessionActive(false);
              loadQueue();
            }}
          >
            ✕ Exit Session
          </Button>
          <div className="session-counter-badge">
            Card {currentSessionIndex + 1} of {queue.length}
          </div>
          <div className="session-progress-strip">
            <ProgressBar value={sessionProgress} showPercent={false} size="sm" variant="primary" />
          </div>
        </div>

        {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

        {!sessionCompleted && currentItem ? (
          <div className="flashcard-deck-layout">
            <Card className="flashcard-card-box">
              <CardHeader>
                <div className="flashcard-meta-row">
                  <Badge variant="neutral">{currentItem.pathTitle}</Badge>
                  <Badge variant="mastery" mastery={currentItem.currentMastery} />
                </div>
                <h2 className="flashcard-topic-heading">{currentItem.topicTitle}</h2>
              </CardHeader>

              <CardBody>
                <div className="flashcard-prompt-callout">
                  <span className="prompt-label-text">Active Recall Prompt:</span>
                  <p className="prompt-question-text">
                    {currentQuestion?.question || `Explain key concepts and command workflow for ${currentItem.topicTitle}`}
                  </p>
                </div>

                {!isAnswerRevealed ? (
                  <div className="reveal-answer-block">
                    <p className="reveal-prompt-instruction">
                      Formulate the mental model or commands in your head or on scratchpad before checking the answer.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setIsAnswerRevealed(true)}
                    >
                      👁 Reveal Suggested Answer
                    </Button>
                  </div>
                ) : (
                  <div className="answer-revealed-block">
                    <div className="answer-card-callout">
                      <span className="answer-label-text">Suggested Solution / Core Model:</span>
                      <p className="answer-body-text">
                        {currentQuestion?.suggestedAnswer || 'Review commands and troubleshooting workflow.'}
                      </p>
                    </div>

                    {/* 4-tier self assessment rating buttons */}
                    <div className="retention-rating-container">
                      <span className="rating-heading-label">How well did you recall this?</span>
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
          <div className="session-celebration-container">
            <Card className="celebration-card-box">
              <CardBody>
                <div className="celebration-emoji">🎉</div>
                <h2>Recall Session Completed!</h2>
                <p>You reviewed {sessionResults.length} topics and reinforced long-term retention.</p>

                <div className="session-results-table">
                  {sessionResults.map((r, idx) => (
                    <div key={idx} className="result-row-item">
                      <span className="result-topic-name">{r.topicTitle}</span>
                      <span className={`result-rating-tag rating-${r.rating}`}>{r.rating.toUpperCase()}</span>
                      <Badge variant="mastery" mastery={r.newMastery as MasteryLevel} size="sm" />
                    </div>
                  ))}
                </div>

                <div className="session-complete-button-row">
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
      </div>
    );
  }

  // Standard Spaced Review Queue View
  return (
    <div className="review-page-container animate-fade-in">
      <PageHeader
        eyebrow="RETENTION & MASTERY (L-N-P-V-R)"
        title="Spaced Repetition Review"
        description="Deliberate recall intervals and self-assessment to transition working knowledge into permanent retention."
        actions={
          queue.length > 0 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleStartSession(0)}
              leftIcon="⚡"
            >
              Start Recall Session ({summary.dueToday} Due)
            </Button>
          ) : undefined
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Review Metrics Banner */}
      <div className="review-stats-summary-grid mb-6">
        <Card className="review-metric-box">
          <CardBody>
            <span className="metric-val text-warning">{summary.dueToday}</span>
            <span className="metric-lbl">Due for Review</span>
          </CardBody>
        </Card>

        <Card className="review-metric-box">
          <CardBody>
            <span className="metric-val">{summary.total}</span>
            <span className="metric-lbl">Total in Queue</span>
          </CardBody>
        </Card>

        <Card className="review-metric-box">
          <CardBody>
            <span className="metric-val text-success">{summary.masteredCount}</span>
            <span className="metric-lbl">Mastered (M4+)</span>
          </CardBody>
        </Card>

        <Card className="review-metric-box">
          <CardBody>
            <span className="metric-val text-primary">{summary.retentionScore}%</span>
            <span className="metric-lbl">Curriculum Retention</span>
          </CardBody>
        </Card>
      </div>

      {/* Queue List */}
      <div className="review-queue-section">
        <div className="queue-section-header mb-4">
          <h2>Scheduled Spaced Recall Items</h2>
          <span className="queue-count-pill">{queue.length} Topics Queued</span>
        </div>

        {queue.length > 0 ? (
          <div className="review-queue-cards-stack">
            {queue.map((item, idx) => (
              <Card key={item.topicId} className="review-item-card" interactive>
                <CardBody>
                  <div className="queue-card-top-flex">
                    <div>
                      <span className="queue-path-name">{item.pathTitle}</span>
                      <h3 className="queue-topic-heading">{item.topicTitle}</h3>
                    </div>

                    <div className="queue-card-status-badges">
                      <Badge variant="mastery" mastery={item.currentMastery} />
                      <StatusPill status="review_due" label="Due Today" size="sm" />
                    </div>
                  </div>

                  <p className="queue-prompt-snippet">
                    🎯 {item.recallQuestions?.[0]?.question || 'Active recall question ready.'}
                  </p>
                </CardBody>

                <CardFooter className="review-item-footer">
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
            actionLabel="Explore Learning Paths"
            onAction={() => window.location.assign('/paths')}
          />
        )}
      </div>
    </div>
  );
};
