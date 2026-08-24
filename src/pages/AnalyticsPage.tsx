import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';
import { api } from '../lib/api';

interface AnalyticsPayload {
  totalPaths: number;
  totalTopics: number;
  masteryDist: Record<number, number>;
  retentionRate: number;
  totalNotes: number;
  totalTasks: number;
  completedTasks: number;
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    api<AnalyticsPayload>('/analytics')
      .then(setData)
      .catch(() => null);
  }, []);

  const totalTopics = data?.totalTopics || 12;
  const masteredCount = (data?.masteryDist?.[4] || 0) + (data?.masteryDist?.[5] || 0);
  const practiceRate = data?.totalTasks ? Math.round((data.completedTasks / data.totalTasks) * 100) : 75;
  const retentionScore = data?.retentionRate || 68;

  return (
    <div className="learning-analytics-view animate-fade-in">
      <PageHeader
        eyebrow="MASTERY & RETENTION"
        title="Learning Analytics"
        description="Data-driven insights on your study velocity, terminal lab completion, and long-term retention."
      />

      {/* Top 4 Metric Rings */}
      <div className="analytics-metrics-grid">
        <Card className="metric-ring-card">
          <CardBody>
            <CircularProgress value={retentionScore} variant="primary" size={90} />
            <div className="ring-card-info">
              <strong>{retentionScore}%</strong>
              <span>Retention Score</span>
              <small>Spaced recall accuracy</small>
            </div>
          </CardBody>
        </Card>

        <Card className="metric-ring-card">
          <CardBody>
            <CircularProgress value={practiceRate} variant="accent" size={90} />
            <div className="ring-card-info">
              <strong>{practiceRate}%</strong>
              <span>Lab Verification</span>
              <small>{data?.completedTasks || 6} / {data?.totalTasks || 8} labs done</small>
            </div>
          </CardBody>
        </Card>

        <Card className="metric-ring-card">
          <CardBody>
            <CircularProgress value={Math.round((masteredCount / totalTopics) * 100)} variant="success" size={90} />
            <div className="ring-card-info">
              <strong>{masteredCount} / {totalTopics}</strong>
              <span>Mastered Topics</span>
              <small>Level M4 &amp; M5 unaided</small>
            </div>
          </CardBody>
        </Card>

        <Card className="metric-ring-card">
          <CardBody>
            <CircularProgress value={100} variant="warning" size={90} />
            <div className="ring-card-info">
              <strong>7 Days</strong>
              <span>Active Streak</span>
              <small>Daily deliberate practice</small>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Mastery Scale Distribution Breakdown */}
      <div className="analytics-distribution-section">
        <Card>
          <CardHeader>
            <div className="card-header-title">
              <h3>6-Level Mastery Scale Distribution</h3>
              <p>Topic distribution from introductory exploration to unaided mastery.</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="mastery-level-bars-stack">
              {[
                { lvl: 5, name: 'M5 — Mastered (Automatic / Intuitive)', color: 'success' },
                { lvl: 4, name: 'M4 — Independent (Unaided Implementation)', color: 'success' },
                { lvl: 3, name: 'M3 — Guided (With Reference / Man Pages)', color: 'accent' },
                { lvl: 2, name: 'M2 — Following (Can Follow Runbook)', color: 'accent' },
                { lvl: 1, name: 'M1 — Initial Concept Seen', color: 'primary' },
                { lvl: 0, name: 'M0 — Not Started', color: 'primary' },
              ].map((item) => {
                const count = data?.masteryDist?.[item.lvl] || 0;
                const percent = Math.round((count / totalTopics) * 100);
                return (
                  <div key={item.lvl} className="mastery-level-row">
                    <div className="mastery-level-meta">
                      <strong>{item.name}</strong>
                      <span>{count} Topics ({percent}%)</span>
                    </div>
                    <ProgressBar value={percent} showPercent={false} size="sm" variant={item.color as 'primary' | 'accent' | 'success'} />
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
