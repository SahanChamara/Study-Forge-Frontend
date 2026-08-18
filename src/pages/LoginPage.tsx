import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { auth } from '../lib/firebase';

const dataMode = import.meta.env.VITE_DATA_MODE ?? 'mock';
export function LoginPage() {
  const { user, loginMock } = useAuth();
  const [email, setEmail] = useState('dev@studyforge.local');
  const [password, setPassword] = useState('studyforge');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    try {
      if (dataMode === 'mock') { loginMock(email); return; }
      mode === 'login' ? await signInWithEmailAndPassword(auth, email, password) : await createUserWithEmailAndPassword(auth, email, password);
    } catch (e) { setError(e instanceof Error ? e.message : 'Authentication failed'); }
  }

  return <div className="auth-page"><form className="auth-card" onSubmit={submit}><div className="eyebrow">PERSONAL LEARNING SYSTEM</div><h1>Build skill, not a note pile.</h1><p>{dataMode === 'mock' ? 'Frontend design mode is active. No backend is required.' : 'Turn a technology into a path you can learn, practice, verify and revisit.'}</p><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label><label>Password<input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <div className="error">{error}</div>}<button>{dataMode === 'mock' ? 'Enter frontend demo' : mode === 'login' ? 'Sign in' : 'Create account'}</button>{dataMode !== 'mock' && <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>}</form></div>;
}
