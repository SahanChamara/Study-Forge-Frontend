import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Button } from '../components/ui/Button';
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

  const learnerName = user?.displayName || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="dashboard-page-container animate-fade-in">
      <PageHeader
        eyebrow="COMMAND CENTER"
        title={`Welcome back, ${learnerName}`}
        description="Continuous deliberate practice is the path to engineering mastery."
        actions={
          <div className="dashboard-streak-pill">
            <span className="streak-emoji" aria-hidden="true">🔥</span>
            <div>
              <strong>7 Day Streak</strong>
              <small>Deliberate Practice</small>
            </div>
          </div>
        }
      />

      {error && <Alert variant="error" message={error} onRetry={loadDashboard} />}

      {/* Spaced Review Due Prompt Banner */}
      {data && data.pendingReviews > 0 && (
        <div className="review-due-banner mb-6">
          <div className="due-banner-content">
            <span className="due-icon">🔄</span>
            <div>
              <strong>Spaced Recall Due Today</strong>
              <p>{data.pendingReviews} topics are scheduled for active retention reinforcement.</p>
            </div>
          </div>
          <Link to="/review" className="btn btn-primary btn-sm">
            Start Recall Session →
          </Link>
        </div>
      )}

      {loading ? (
        <div className="dashboard-skeleton-grid">
          <div className="stats-metric-grid mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton variant="text" width="50%" height={28} />
                  <Skeleton variant="text" width="80%" height={16} />
                </CardBody>
              </Card>
            ))}
          </div>
          <Skeleton variant="rectangular" height={220} />
        </div>
      ) : data ? (
        <div className="dashboard-content-stack">
          {/* 4 Reference Metric Stat Cards */}
          <div className="stats-metric-grid">
            <Card className="stat-card">
              <CardBody>
                <div className="stat-card-top">
                  <span className="stat-icon-badge">🗺️</span>
                  <span className="stat-label">Active Paths</span>
                </div>
                <strong className="stat-value">{data.paths}</strong>
                <small className="stat-hint">Structured curriculums</small>
              </CardBody>
            </Card>

            <Card className="stat-card">
              <CardBody>
                <div className="stat-card-top">
                  <span className="stat-icon-badge">📚</span>
                  <span className="stat-label">Topics Explored</span>
                </div>
                <strong className="stat-value">{data.topics}</strong>
                <small className="stat-hint">{data.inProgress} currently in progress</small>
              </CardBody>
            </Card>

            <Card className="stat-card">
              <CardBody>
                <div className="stat-card-top">
                  <span className="stat-icon-badge">⚡</span>
                  <span className="stat-label">Labs Verified</span>
                </div>
                <strong className="stat-value">{data.completedPractice}</strong>
                <small className="stat-hint">Hands-on terminal tasks</small>
              </CardBody>
            </Card>

            <Card className="stat-card">
              <CardBody>
                <div className="stat-card-top">
                  <span className="stat-icon-badge">🏆</span>
                  <span className="stat-label">Mastered (M4/M5)</span>
                </div>
                <strong className="stat-value stat-value-highlight">{data.mastered}</strong>
                <small className="stat-hint">{overallMasteryPercent}% curriculum mastery</small>
              </CardBody>
            </Card>
          </div>

          {/* Main 2-Column Dashboard Sections */}
          <div className="dashboard-main-grid">
            {/* Left: Continue Learning & Active Activity */}
            <div className="dashboard-left-col">
              {data.activeTopic ? (
                <Card className="active-learning-card" padded={false}>
                  <CardHeader>
                    <div>
                      <span className="eyebrow">CONTINUE LEARNING</span>
                      <h3 className="active-card-heading">Active Workspace</h3>
                    </div>
                    <StatusPill status={data.activeTopic.status} />
                  </CardHeader>
                  <CardBody>
                    <span className="active-path-tag">
                      {data.activeTopic.pathTitle || 'Learning Path'}
                    </span>
                    <h2 className="active-topic-title">{data.activeTopic.title}</h2>
                    <p className="active-topic-objective">{data.activeTopic.objective}</p>
                    <div className="active-topic-meta">
                      <span className="meta-time">⏱️ ~{data.activeTopic.estimatedMinutes} min</span>
                      <Badge variant="mastery" mastery={data.activeTopic.mastery} />
                    </div>
                    <div className="active-topic-actions">
                      <Link
                        to={`/paths/${data.activeTopic.pathId}/topics/${data.activeTopic.id}`}
                        className="btn btn-primary"
                      >
                        Resume Study Workspace →
                      </Link>
                      <Link to="/practice" className="btn btn-secondary">
                        Practice Labs
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <Card className="empty-active-card">
                  <CardBody>
                    <span className="eyebrow">GET STARTED</span>
                    <h3>Start your first learning path</h3>
                    <p>Select a structured engineering roadmap to begin hands-on mastery.</p>
                    <Link to="/paths" className="btn btn-primary">
                      Browse Learning Paths →
                    </Link>
                  </CardBody>
                </Card>
              )}

              {/* Quick Navigation Cards */}
              <div className="quick-access-grid">
                <Card className="quick-access-card" interactive>
                  <Link to="/notes" className="quick-card-link">
                    <CardBody>
                      <span className="quick-card-icon">📝</span>
                      <div className="quick-card-text">
                        <strong>Smart Notes</strong>
                        <small>{data.notes} notes captured</small>
                      </div>
                    </CardBody>
                  </Link>
                </Card>

                <Card className="quick-access-card" interactive>
                  <Link to="/review" className="quick-card-link">
                    <CardBody>
                      <span className="quick-card-icon">🔄</span>
                      <div className="quick-card-text">
                        <strong>Recall Queue</strong>
                        <small>{data.pendingReviews} reviews pending</small>
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Right: Mastery Overview Donut & Level Distribution */}
            <div className="dashboard-right-col">
              <Card className="mastery-summary-card">
                <CardHeader>
                  <div className="card-header-title">
                    <span className="eyebrow">PROGRESS OVERVIEW</span>
                    <h3>Mastery &amp; Retention</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="mastery-donut-wrapper">
                    <CircularProgress
                      value={overallMasteryPercent}
                      variant="primary"
                      size={110}
                      strokeWidth={9}
                      label="Mastery"
                      sublabel={`${data.mastered} of ${data.topics}`}
                    />
                    <div className="donut-details">
                      <div className="donut-metric-item">
                        <span className="metric-dot dot-success" />
                        <span className="metric-name">Mastered</span>
                        <strong>{data.mastered}</strong>
                      </div>
                      <div className="donut-metric-item">
                        <span className="metric-dot dot-primary" />
                        <span className="metric-name">In Progress</span>
                        <strong>{data.inProgress}</strong>
                      </div>
                      <div className="donut-metric-item">
                        <span className="metric-dot dot-warning" />
                        <span className="metric-name">Reviews Due</span>
                        <strong>{data.pendingReviews}</strong>
                      </div>
                    </div>
                  </div>

                  {analytics && (
                    <div className="mastery-scale-breakdown">
                      <div className="scale-breakdown-header">
                        <span>Mastery Scale Distribution</span>
                        <small>{analytics.retentionRate}% Retention</small>
                      </div>
                      <div className="scale-bars-row">
                        {[0, 1, 2, 3, 4, 5].map((lvl) => {
                          const count = analytics.masteryDist[lvl] || 0;
                          return (
                            <div key={lvl} className={`scale-bar-item lvl-${lvl}`} title={`M${lvl}: ${count} topics`}>
                              <span className="bar-tag">M{lvl}</span>
                              <span className="bar-val">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mastery-card-footer-btns">
                    <Link to="/analytics">
                      <Button variant="secondary" size="sm" fullWidth>
                        View Full Learning Analytics →
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* L-N-P-V-R Deliberate Practice Method Banner */}
          <Card className="lnpvr-method-card">
            <CardBody>
              <div className="lnpvr-header-block">
                <span className="eyebrow">THE STUDYFORGE ENGINE</span>
                <h3>Learn → Note → Practice → Verify → Review</h3>
                <p>Engineering competence requires verified execution, not passive consumption.</p>
              </div>
              <div className="lnpvr-step-cards">
                <div className="lnpvr-pill">
                  <span className="lnpvr-index">1</span>
                  <div className="lnpvr-info">
                    <strong>Learn</strong>
                    <small>Focused concepts</small>
                  </div>
                </div>
                <div className="lnpvr-pill">
                  <span className="lnpvr-index">2</span>
                  <div className="lnpvr-info">
                    <strong>Note</strong>
                    <small>Mental models</small>
                  </div>
                </div>
                <div className="lnpvr-pill">
                  <span className="lnpvr-index">3</span>
                  <div className="lnpvr-info">
                    <strong>Practice</strong>
                    <small>Terminal labs</small>
                  </div>
                </div>
                <div className="lnpvr-pill">
                  <span className="lnpvr-index">4</span>
                  <div className="lnpvr-info">
                    <strong>Verify</strong>
                    <small>Real proof</small>
                  </div>
                </div>
                <div className="lnpvr-pill">
                  <span className="lnpvr-index">5</span>
                  <div className="lnpvr-info">
                    <strong>Review</strong>
                    <small>Active recall</small>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
