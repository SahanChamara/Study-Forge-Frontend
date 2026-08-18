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
import { Card } from '../components/ui/Card';

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
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="brand-logo-large">SF</div>
          <h2>StudyForge</h2>
          <p className="auth-tagline">Personal Engineering Learning Operating System</p>
        </div>

        <Card className="auth-card-wrapper">
          {/* Auth Tab Navigation */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMessage('');
              }}
            >
              Create Account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'forgot'}
              className={`auth-tab ${mode === 'forgot' ? 'active' : ''}`}
              onClick={() => {
                setMode('forgot');
                setError('');
                setSuccessMessage('');
              }}
            >
              Reset
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && <Alert variant="error" message={error} className="auth-alert" />}
          {successMessage && <Alert variant="success" message={successMessage} className="auth-alert" />}

          {/* Auth Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
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
              className="btn-auth-submit"
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
            <div className="demo-mode-section">
              <div className="demo-divider">
                <span>or explore with instant access</span>
              </div>
              <Button
                type="button"
                variant="accent"
                size="md"
                onClick={handleDemoLogin}
                className="btn-demo-login"
              >
                ⚡ Enter One-Click Demo
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
