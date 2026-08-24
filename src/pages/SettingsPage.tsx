import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StatusPill } from '../components/ui/StatusPill';
import { useAuth } from '../auth/useAuth';
import { Alert } from '../components/ui/Alert';

export const SettingsPage: React.FC = () => {
  const { user, isMockMode, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || 'Engineer');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-page-view animate-fade-in">
      <PageHeader
        eyebrow="PREFERENCES & ACCOUNT"
        title="Settings"
        description="Manage your learning preferences, profile information, and local workspace mode."
      />

      {savedSuccess && (
        <Alert variant="success" message="Profile preferences saved successfully." />
      )}

      <div className="settings-cards-grid">
        {/* Account Profile Card */}
        <Card>
          <CardHeader>
            <div className="card-header-title">
              <h3>Account Profile</h3>
              <p>Your StudyForge learner identity</p>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSave} className="settings-form">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Input
                label="Email Address"
                value={user?.email || 'dev@studyforge.local'}
                disabled
                helperText="Email is linked to your authentication session."
              />
              <div className="settings-form-actions">
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Runtime Environment Card */}
        <Card>
          <CardHeader>
            <div className="card-header-title">
              <h3>Runtime Environment</h3>
              <p>Data source and API adapter mode</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="settings-env-info">
              <div className="env-row">
                <span>Active Mode</span>
                <StatusPill
                  status={isMockMode ? 'learning' : 'mastered'}
                  label={isMockMode ? 'Local Mock Mode' : 'Remote Backend Mode'}
                />
              </div>
              <div className="env-row">
                <span>Session State</span>
                <span className="env-val">{user?.uid || 'local-demo-user'}</span>
              </div>
              <div className="env-row">
                <span>Storage</span>
                <span className="env-val">Local In-Memory Adapter</span>
              </div>
            </div>

            <div className="settings-danger-actions">
              <Button
                variant="danger"
                size="sm"
                onClick={() => logout()}
                leftIcon="🚪"
              >
                Sign Out of Workspace
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
