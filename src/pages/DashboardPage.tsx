import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import type { Topic } from '../types';

interface DashboardData {
  paths: number;
  topics: number;
  mastered: number;
  inProgress: number;
  notes: number;
  completedPractice: number;
  pendingReviews: number;
  activeTopic?: (Topic & { pathTitle?: string }) | null;
}

interface AnalyticsData {
  masteryDist: Record<number, number>;
  retentionRate: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    Promise.all([
      api<DashboardData>('/dashboard'),
      api<AnalyticsData>('/analytics').catch(() => null),
    ])
      .then(([dashRes, analyticsRes]) => {
        setData(dashRes);
        setAnalytics(analyticsRes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const overallMasteryPercent =
    data && data.topics > 0 ? Math.round((data.mastered / data.topics) * 100) : 0;

  const learnerName = user?.displayName || user?.email?.split('@')[0] || 'Engineer';

  return (
    <section className="dashboard-view">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow">COMMAND CENTER</div>
          <h1>Welcome back, {learnerName}</h1>
          <p>Continuous deliberate practice is the path to engineering mastery.</p>
        </div>
        <div className="streak-card">
          <span className="streak-icon">🔥</span>
          <div>
            <strong>7 Day Streak</strong>
            <small>Active learning habit</small>
          </div>
        </div>
      </div>

      {error && <Alert variant="error" message={error} onRetry={loadDashboard} />}

      {/* Spaced Review Due Prompt Banner */}
      {data && data.pendingReviews > 0 && (
        <div className="review-due-banner">
          <div className="due-banner-content">
            <span className="due-icon">🔄</span>
            <div>
              <strong>Spaced Recall Due Today</strong>
              <p>{data.pendingReviews} topics are scheduled for active retention reinforcement.</p>
            </div>
          </div>
          <Link to="/review" className="btn btn-accent btn-sm">
            Start Recall Session →
          </Link>
        </div>
      )}

      {loading ? (
        <div className="dashboard-skeleton-grid">
          <div className="stats">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="stat" key={i}>
                <Skeleton variant="text" width="40%" height={32} />
                <Skeleton variant="text" width="70%" height={16} />
              </div>
            ))}
          </div>
          <Skeleton variant="rectangular" height={180} />
        </div>
      ) : data ? (
        <div className="dashboard-layout">
          {/* Key Metric Stats Grid */}
          <div className="stats">
            <div className="stat">
              <span className="stat-icon">🗺️</span>
              <strong>{data.paths}</strong>
              <span>Learning Paths</span>
            </div>
            <div className="stat">
              <span className="stat-icon">📚</span>
              <strong>{data.topics}</strong>
              <span>Total Topics</span>
            </div>
            <div className="stat">
              <span className="stat-icon">⚡</span>
              <strong>{data.inProgress}</strong>
              <span>In Progress</span>
            </div>
            <div className="stat">
              <span className="stat-icon">🏆</span>
              <strong className="stat-mastered">{data.mastered}</strong>
              <span>Mastered Topics</span>
            </div>
            <div className="stat">
              <span className="stat-icon">📝</span>
              <strong>{data.notes}</strong>
              <span>Smart Notes</span>
            </div>
            <div className="stat">
              <span className="stat-icon">✅</span>
              <strong>{data.completedPractice}</strong>
              <span>Labs Completed</span>
            </div>
          </div>

          {/* Active Topic Resume & Progress Section */}
          <div className="dashboard-grid-2col">
            {/* Continue Learning Resume Card */}
            {data.activeTopic ? (
              <Card className="resume-topic-card" padded={false}>
                <CardHeader>
                  <div className="eyebrow">CONTINUE LEARNING</div>
                  <Badge variant={data.activeTopic.status} />
                </CardHeader>
                <CardBody>
                  <small className="resume-path-title">
                    {data.activeTopic.pathTitle || 'Active Path'}
                  </small>
                  <h2 className="resume-topic-title">{data.activeTopic.title}</h2>
                  <p className="resume-topic-objective">{data.activeTopic.objective}</p>
                  <div className="resume-meta">
                    <span className="resume-duration">
                      ⏱️ ~{data.activeTopic.estimatedMinutes} min estimated
                    </span>
                    <Badge variant="mastery" mastery={data.activeTopic.mastery} />
                  </div>
                  <Link
                    to={`/paths/${data.activeTopic.pathId}/topics/${data.activeTopic.id}`}
                    className="btn btn-primary resume-btn"
                  >
                    Resume Study Workspace →
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <Card className="resume-topic-card">
                <div className="eyebrow">GET STARTED</div>
                <h2>Explore your first path</h2>
                <p>Begin a structured roadmap to level up your engineering skills.</p>
                <Link to="/paths" className="btn btn-accent">
                  Browse Learning Paths →
                </Link>
              </Card>
            )}

            {/* Overall Mastery & Analytics Breakdown */}
            <Card className="mastery-overview-card">
              <div className="eyebrow">PROGRESS OVERVIEW</div>
              <h2>Curriculum Mastery & Retention</h2>
              <p>Topics mastered with unaided hands-on verification:</p>
              <ProgressBar
                value={overallMasteryPercent}
                label="Overall Mastery Rate"
                variant="accent"
                size="lg"
              />

              {/* 6-Level Mastery Scale Distribution */}
              {analytics && (
                <div className="mastery-distribution-section">
                  <div className="distribution-header">
                    <span>Mastery Level Breakdown</span>
                    <small>{analytics.retentionRate}% Retention Score</small>
                  </div>
                  <div className="mastery-levels-bar">
                    {[0, 1, 2, 3, 4, 5].map((lvl) => {
                      const count = analytics.masteryDist[lvl] || 0;
                      return (
                        <div key={lvl} className={`level-segment lvl-${lvl}`} title={`M${lvl}: ${count} topics`}>
                          <span className="lvl-name">M{lvl}</span>
                          <span className="lvl-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="quick-actions-bar">
                <Link to="/paths" className="btn btn-secondary btn-sm">
                  🗺️ All Paths
                </Link>
                <Link to="/search" className="btn btn-secondary btn-sm">
                  🔍 Global Search
                </Link>
                <Link to="/review" className="btn btn-secondary btn-sm">
                  🔄 Review Queue ({data.pendingReviews})
                </Link>
              </div>
            </Card>
          </div>

          {/* L-N-P-V-R Learning System Guide */}
          <Card className="lnpvr-guide-card">
            <div className="lnpvr-header">
              <div className="eyebrow">THE STUDYFORGE METHOD</div>
              <h2>Learn → Note → Practice → Verify → Review</h2>
              <p>True engineering competence requires structured practice, not passive watching.</p>
            </div>
            <div className="lnpvr-steps">
              <div className="lnpvr-step">
                <div className="step-num">1</div>
                <strong>Learn</strong>
                <p>Focus on one concept with explicit outcomes.</p>
              </div>
              <div className="lnpvr-step">
                <div className="step-num">2</div>
                <strong>Note</strong>
                <p>Capture mental models and commands from memory.</p>
              </div>
              <div className="lnpvr-step">
                <div className="step-num">3</div>
                <strong>Practice</strong>
                <p>Execute real labs in your terminal.</p>
              </div>
              <div className="lnpvr-step">
                <div className="step-num">4</div>
                <strong>Verify</strong>
                <p>Submit proof and test boundary conditions.</p>
              </div>
              <div className="lnpvr-step">
                <div className="step-num">5</div>
                <strong>Review</strong>
                <p>Reinforce weak areas via active recall.</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </section>
  );
};
