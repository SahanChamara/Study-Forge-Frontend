import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { auth } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card, CardBody } from '../components/ui/Card';
import { SegmentedControl } from '../components/ui/SegmentedControl';

type AuthMode = 'login' | 'register' | 'forgot';

export function LoginPage() {
  const { user, isMockMode, loginMock, registerMock, resetPasswordMock } = useAuth();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('dev@studyforge.local');
  const [password, setPassword] = useState('studyforge123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already authenticated, redirect to requested page or home
  if (user) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleDemoLogin = () => {
    loginMock('dev@studyforge.local');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isMockMode) {
        if (mode === 'login') {
          loginMock(email);
        } else if (mode === 'register') {
          registerMock(email);
        } else if (mode === 'forgot') {
          await resetPasswordMock(email);
          setSuccessMessage(`Password reset link has been dispatched to ${email}.`);
        }
        return;
      }

      // Remote Firebase mode
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage(`Password reset email sent to ${email}. Check your inbox.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication action failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-split-layout animate-fade-in">
      {/* Left Feature Showcase Banner (Desktop) */}
      <div className="auth-showcase-panel">
        <div className="auth-showcase-content">
          <div className="auth-brand-badge">
            <div className="brand-logo-large">SF</div>
            <div>
              <span className="brand-title-large">StudyForge</span>
              <span className="brand-badge-pill">v0.1.0 · Light Engine</span>
            </div>
          </div>

          <div className="showcase-hero-text">
            <h1>Personal Engineering Learning Operating System</h1>
            <p>
              Master deep technical domains with structured curricula, 9-section recall notes, hands-on terminal verification, and automated spaced review.
            </p>
          </div>

          <div className="showcase-highlights-grid">
            <div className="showcase-highlight-item">
              <span className="highlight-icon">🎯</span>
              <div>
                <strong>L-N-P-V-R Deliberate Practice</strong>
                <p>Learn → Note from memory → Practice labs → Verify proof → Spaced recall review.</p>
              </div>
            </div>

            <div className="showcase-highlight-item">
              <span className="highlight-icon">🏆</span>
              <div>
                <strong>6-Level Mastery Scale (M0–M5)</strong>
                <p>Quantifiable progression from unfamiliar terms (M0) to expert root-cause troubleshooting (M5).</p>
              </div>
            </div>

            <div className="showcase-highlight-item">
              <span className="highlight-icon">⚡</span>
              <div>
                <strong>Hands-on Terminal Proof</strong>
                <p>Attach real CLI execution evidence and test edge cases unaided.</p>
              </div>
            </div>
          </div>

          <div className="showcase-footer-tag">
            <span>🔒 Zero-backend local mock mode &amp; optional Firebase cloud sync</span>
          </div>
        </div>
      </div>

      {/* Right Form Card Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="mobile-brand-header">
            <div className="brand-logo-large">SF</div>
            <h2>StudyForge</h2>
            <p className="auth-tagline">Personal Engineering Learning OS</p>
          </div>

          <Card className="auth-card-box">
            <CardBody>
              {/* Auth Mode Toggle */}
              <div className="auth-mode-segmented-wrapper mb-6">
                <SegmentedControl
                  value={mode}
                  onChange={(val) => {
                    setMode(val as AuthMode);
                    setError('');
                    setSuccessMessage('');
                  }}
                  fullWidth
                  options={[
                    { id: 'login', label: 'Sign In' },
                    { id: 'register', label: 'Create Account' },
                    { id: 'forgot', label: 'Reset' },
                  ]}
                />
              </div>

              {/* Feedback Alerts */}
              {error && <Alert variant="error" message={error} className="mb-4" onDismiss={() => setError('')} />}
              {successMessage && <Alert variant="success" message={successMessage} className="mb-4" />}

              {/* Auth Form */}
              <form className="auth-form-body" onSubmit={handleSubmit}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. engineer@studyforge.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {mode !== 'forgot' && (
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    helperText={mode === 'register' ? 'Minimum 6 characters required' : undefined}
                  />
                )}

                {mode === 'register' && (
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  fullWidth
                  className="mt-2"
                >
                  {mode === 'login'
                    ? 'Sign In to Workspace'
                    : mode === 'register'
                    ? 'Create StudyForge Account'
                    : 'Send Reset Instructions'}
                </Button>
              </form>

              {/* Demo Login Shortcut */}
              {isMockMode && (
                <div className="auth-demo-section mt-6">
                  <div className="demo-divider-line">
                    <span>or explore with instant access</span>
                  </div>
                  <Button
                    type="button"
                    variant="accent"
                    size="md"
                    fullWidth
                    onClick={handleDemoLogin}
                    leftIcon="⚡"
                    className="btn-demo-trigger"
                  >
                    Enter One-Click Demo Workspace
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
