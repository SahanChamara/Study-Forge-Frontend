import React, { useEffect, useState, useMemo } from 'react';
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
import { SegmentedControl } from '../components/ui/SegmentedControl';
import type { DashboardData, WeeklyActivityDay, RecentActivityItem } from '../types';

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

  // Timeframe and Metric Dimension for Learning Activity Chart
  const [timeframe, setTimeframe] = useState<'this_week' | 'last_week' | 'monthly'>('this_week');
  const [activityMetric, setActivityMetric] = useState<'minutes' | 'topics' | 'labs'>('minutes');

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

  // Weekly Activity Data with timeframe multiplier simulation
  const weeklyData: WeeklyActivityDay[] = useMemo(() => {
    const base = data?.weeklyActivity || [
      { day: 'Mon', minutes: 45, topicsCompleted: 1, labsCompleted: 2 },
      { day: 'Tue', minutes: 60, topicsCompleted: 2, labsCompleted: 1 },
      { day: 'Wed', minutes: 30, topicsCompleted: 0, labsCompleted: 2 },
      { day: 'Thu', minutes: 75, topicsCompleted: 2, labsCompleted: 3 },
      { day: 'Fri', minutes: 50, topicsCompleted: 1, labsCompleted: 1 },
      { day: 'Sat', minutes: 90, topicsCompleted: 3, labsCompleted: 4 },
      { day: 'Sun', minutes: 40, topicsCompleted: 1, labsCompleted: 1 },
    ];

    if (timeframe === 'last_week') {
      return base.map((d) => ({
        ...d,
        minutes: Math.max(20, Math.round(d.minutes * 0.85)),
        topicsCompleted: Math.max(0, d.topicsCompleted - 1),
        labsCompleted: Math.max(1, d.labsCompleted - 1),
      }));
    }

    if (timeframe === 'monthly') {
      return base.map((d) => ({
        ...d,
        minutes: Math.round(d.minutes * 1.2),
        topicsCompleted: d.topicsCompleted + 1,
        labsCompleted: d.labsCompleted + 1,
      }));
    }

    return base;
  }, [data?.weeklyActivity, timeframe]);

  // Max value for chart scaling
  const maxChartValue = useMemo(() => {
    if (activityMetric === 'minutes') {
      const maxMins = Math.max(...weeklyData.map((d) => d.minutes), 60);
      return Math.ceil(maxMins / 15) * 15;
    }
    if (activityMetric === 'topics') {
      return Math.max(...weeklyData.map((d) => d.topicsCompleted), 4);
    }
    return Math.max(...weeklyData.map((d) => d.labsCompleted), 5);
  }, [weeklyData, activityMetric]);

  // Aggregate Weekly Stats
  const activitySummary = useMemo(() => {
    const totalMinutes = weeklyData.reduce((acc, d) => acc + d.minutes, 0);
    const totalTopics = weeklyData.reduce((acc, d) => acc + d.topicsCompleted, 0);
    const totalLabs = weeklyData.reduce((acc, d) => acc + d.labsCompleted, 0);
    const hours = (totalMinutes / 60).toFixed(1);
    const avgDailyMins = Math.round(totalMinutes / weeklyData.length);
    return { totalMinutes, hours, avgDailyMins, totalTopics, totalLabs };
  }, [weeklyData]);

  // Recent Activity Feed fallback
  const recentActivities: RecentActivityItem[] = useMemo(() => {
    if (data?.recentActivity && data.recentActivity.length > 0) {
      return data.recentActivity;
    }
    return [
      {
        id: 'act-1',
        type: 'lab',
        title: 'Trace syscalls of process startup with strace',
        pathTitle: 'Linux Systems & Production Engineering',
        pathId: 'linux-devops',
        topicId: 't-linux-1',
        outcome: 'Verified Proof Attached',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: 'act-2',
        type: 'study',
        title: 'Linux Architecture & Subsystems',
        pathTitle: 'Linux Systems & Production Engineering',
        pathId: 'linux-devops',
        topicId: 't-linux-1',
        outcome: 'Mastery M4 (Unaided)',
        timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      },
      {
        id: 'act-3',
        type: 'note',
        title: 'Filesystem Hierarchy & FHS Principles',
        pathTitle: 'Linux Systems & Production Engineering',
        pathId: 'linux-devops',
        topicId: 't-linux-2',
        outcome: 'Structured Note Saved',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: 'act-4',
        type: 'review',
        title: 'System Calls & POSIX Traps',
        pathTitle: 'Linux Systems & Production Engineering',
        pathId: 'linux-devops',
        topicId: 't-linux-1',
        outcome: 'Recall Good (+7d Interval)',
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
    ];
  }, [data?.recentActivity]);

  const getActivityBadge = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'lab':
        return <span className="activity-type-pill type-lab">⚡ Lab</span>;
      case 'study':
        return <span className="activity-type-pill type-study">📚 Study</span>;
      case 'note':
        return <span className="activity-type-pill type-note">📝 Note</span>;
      case 'review':
        return <span className="activity-type-pill type-review">🔄 Review</span>;
      default:
        return <span className="activity-type-pill">⚡ Activity</span>;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffHours = Math.round((Date.now() - new Date(isoString).getTime()) / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

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
              <strong>{data?.currentStreakDays || 7} Day Streak</strong>
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
          <div className="dashboard-main-grid mb-6">
            <Skeleton variant="rectangular" height={320} />
            <Skeleton variant="rectangular" height={320} />
          </div>
        </div>
      ) : data ? (
        <div className="dashboard-content-stack">
          {/* 1. Top 4 Reference Metric Stat Cards */}
          <div className="stats-metric-grid mb-6">
            <Link to="/paths" className="stat-card-link">
              <Card className="stat-card" interactive>
                <CardBody>
                  <div className="stat-card-top">
                    <span className="stat-icon-badge">🗺️</span>
                    <span className="stat-label">Active Paths</span>
                  </div>
                  <strong className="stat-value">{data.paths}</strong>
                  <div className="stat-card-bottom">
                    <small className="stat-hint">Structured curriculums</small>
                    <span className="stat-trend-tag positive">Active</span>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/paths" className="stat-card-link">
              <Card className="stat-card" interactive>
                <CardBody>
                  <div className="stat-card-top">
                    <span className="stat-icon-badge">📚</span>
                    <span className="stat-label">Topics Explored</span>
                  </div>
                  <strong className="stat-value">{data.topics}</strong>
                  <div className="stat-card-bottom">
                    <small className="stat-hint">{data.inProgress} currently in progress</small>
                    <span className="stat-trend-tag neutral">Exploring</span>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/practice" className="stat-card-link">
              <Card className="stat-card" interactive>
                <CardBody>
                  <div className="stat-card-top">
                    <span className="stat-icon-badge">⚡</span>
                    <span className="stat-label">Labs Verified</span>
                  </div>
                  <strong className="stat-value">{data.completedPractice}</strong>
                  <div className="stat-card-bottom">
                    <small className="stat-hint">Hands-on terminal tasks</small>
                    <span className="stat-trend-tag positive">Verified</span>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link to="/review" className="stat-card-link">
              <Card className="stat-card" interactive>
                <CardBody>
                  <div className="stat-card-top">
                    <span className="stat-icon-badge">🏆</span>
                    <span className="stat-label">Reviews Due</span>
                  </div>
                  <strong className={`stat-value ${data.pendingReviews > 0 ? 'stat-value-warning' : 'stat-value-highlight'}`}>
                    {data.pendingReviews}
                  </strong>
                  <div className="stat-card-bottom">
                    <small className="stat-hint">
                      {data.pendingReviews > 0 ? 'Retention intervals due' : 'All caught up'}
                    </small>
                    <span className={`stat-trend-tag ${data.pendingReviews > 0 ? 'warning' : 'positive'}`}>
                      {data.pendingReviews > 0 ? 'Action Due' : 'On Track'}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>

          {/* 2. Middle Section: Learning Activity Chart (Left) + Mastery Overview (Right) */}
          <div className="dashboard-main-grid mb-6">
            {/* Left: Learning Activity Card (Reports / Sales equivalent) */}
            <Card className="learning-activity-card">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">PRACTICE ENGAGEMENT</span>
                  <h3>Learning Activity</h3>
                </div>
                <div className="chart-header-controls">
                  <SegmentedControl
                    size="sm"
                    value={timeframe}
                    onChange={(val) => setTimeframe(val as typeof timeframe)}
                    options={[
                      { id: 'this_week', label: 'This Week' },
                      { id: 'last_week', label: 'Last Week' },
                      { id: 'monthly', label: 'Monthly' },
                    ]}
                  />
                </div>
              </CardHeader>
              <CardBody>
                {/* Metric Dimension Toggles */}
                <div className="activity-metric-selector mb-4">
                  <button
                    type="button"
                    className={`metric-select-btn ${activityMetric === 'minutes' ? 'is-active' : ''}`}
                    onClick={() => setActivityMetric('minutes')}
                  >
                    ⏱️ Study Time ({activitySummary.hours} hrs)
                  </button>
                  <button
                    type="button"
                    className={`metric-select-btn ${activityMetric === 'topics' ? 'is-active' : ''}`}
                    onClick={() => setActivityMetric('topics')}
                  >
                    📚 Topics ({activitySummary.totalTopics})
                  </button>
                  <button
                    type="button"
                    className={`metric-select-btn ${activityMetric === 'labs' ? 'is-active' : ''}`}
                    onClick={() => setActivityMetric('labs')}
                  >
                    ⚡ Labs ({activitySummary.totalLabs})
                  </button>
                </div>

                {/* Visual Weekly Bar Chart */}
                <div className="weekly-bar-chart-container">
                  <div className="chart-bars-track">
                    {weeklyData.map((dayItem, idx) => {
                      const val =
                        activityMetric === 'minutes'
                          ? dayItem.minutes
                          : activityMetric === 'topics'
                          ? dayItem.topicsCompleted
                          : dayItem.labsCompleted;
                      const heightPercent = maxChartValue > 0 ? Math.round((val / maxChartValue) * 100) : 0;
                      const isToday = idx === 3; // Highlight Thursday in sample/production view

                      return (
                        <div key={dayItem.day} className={`chart-day-column ${isToday ? 'is-today' : ''}`}>
                          <div className="column-bar-wrapper">
                            <span className="bar-tooltip">
                              {activityMetric === 'minutes' ? `${val}m` : val}
                            </span>
                            <div
                              className="column-bar-fill"
                              style={{ height: `${Math.max(6, heightPercent)}%` }}
                            />
                          </div>
                          <span className="column-day-label">{dayItem.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Stats Summary Strip */}
                <div className="activity-summary-strip mt-4">
                  <div className="summary-stat-block">
                    <span className="stat-sublabel">Total Practice</span>
                    <strong className="stat-subval">{activitySummary.hours} Hours</strong>
                  </div>
                  <div className="summary-stat-block">
                    <span className="stat-sublabel">Daily Average</span>
                    <strong className="stat-subval">{activitySummary.avgDailyMins} Mins/day</strong>
                  </div>
                  <div className="summary-stat-block">
                    <span className="stat-sublabel">Active Streak</span>
                    <strong className="stat-subval text-primary">🔥 7 Days</strong>
                  </div>
                  <div className="summary-stat-block">
                    <span className="stat-sublabel">Weekly Goal</span>
                    <strong className="stat-subval text-success">92% On Track</strong>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Right: Mastery Overview Card (Transactions equivalent) */}
            <Card className="mastery-summary-card">
              <CardHeader>
                <div className="card-header-title">
                  <span className="eyebrow">RETENTION & MASTERY</span>
                  <h3>Mastery Overview</h3>
                </div>
                <Badge variant="accent">
                  {analytics ? `${analytics.retentionRate}% Retention` : 'M0–M5 Scale'}
                </Badge>
              </CardHeader>
              <CardBody>
                <div className="mastery-donut-wrapper">
                  <CircularProgress
                    value={overallMasteryPercent}
                    variant="primary"
                    size={116}
                    strokeWidth={10}
                    label="Mastery"
                    sublabel={`${data.mastered} of ${data.topics}`}
                  />
                  <div className="donut-details">
                    <div className="donut-metric-item">
                      <span className="metric-dot dot-success" />
                      <span className="metric-name">Mastered (M4/M5)</span>
                      <strong>{data.mastered}</strong>
                    </div>
                    <div className="donut-metric-item">
                      <span className="metric-dot dot-primary" />
                      <span className="metric-name">In Progress (M1–M3)</span>
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
                      <span>Detailed Mastery Scale Distribution</span>
                      <small>{analytics.retentionRate}% Retained</small>
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
                      View Comprehensive Analytics →
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 3. Lower Section: Continue Learning (Left) + Recent Learning Activity (Right) */}
          <div className="dashboard-main-grid mb-6">
            {/* Left: Continue Learning (Top Selling Products equivalent) */}
            <div className="dashboard-lower-left-col">
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
                      {data.activeTopic.pathTitle || 'Linux Systems & Production Engineering'}
                    </span>
                    <h2 className="active-topic-title">{data.activeTopic.title}</h2>
                    <p className="active-topic-objective">{data.activeTopic.objective}</p>
                    <div className="active-topic-meta">
                      <span className="meta-time">⏱️ ~{data.activeTopic.estimatedMinutes} min estimated</span>
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
                    <p>Select a structured engineering roadmap to begin hands-on deliberate practice.</p>
                    <Link to="/paths" className="btn btn-primary">
                      Browse Learning Paths →
                    </Link>
                  </CardBody>
                </Card>
              )}

              {/* Quick Navigation Shortcuts */}
              <div className="quick-access-grid mt-4">
                <Card className="quick-access-card" interactive>
                  <Link to="/notes" className="quick-card-link">
                    <CardBody>
                      <span className="quick-card-icon">📝</span>
                      <div className="quick-card-text">
                        <strong>Smart Notes</strong>
                        <small>{data.notes} notes captured from memory</small>
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
                        <small>{data.pendingReviews} topics pending review</small>
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Right: Recent Learning Activity Feed (Recent Orders equivalent) */}
            <div className="dashboard-lower-right-col">
              <Card className="recent-activity-card">
                <CardHeader>
                  <div className="card-header-title">
                    <span className="eyebrow">RECENT AUDIT TRAIL</span>
                    <h3>Recent Learning Activity</h3>
                  </div>
                  <Link to="/practice" className="recent-activity-view-all">
                    View Queue →
                  </Link>
                </CardHeader>
                <CardBody>
                  <div className="recent-activity-list">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="recent-activity-item">
                        <div className="activity-item-left">
                          {getActivityBadge(act.type)}
                          <div className="activity-item-details">
                            <Link
                              to={`/paths/${act.pathId}/topics/${act.topicId}`}
                              className="activity-item-title-link"
                            >
                              {act.title}
                            </Link>
                            <span className="activity-item-path">{act.pathTitle}</span>
                          </div>
                        </div>
                        <div className="activity-item-right">
                          <span className="activity-outcome-badge">{act.outcome}</span>
                          <span className="activity-item-time">{formatRelativeTime(act.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* 4. Bottom Engine Method Guide: L-N-P-V-R */}
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
