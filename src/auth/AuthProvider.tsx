import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthContext, type AppUser } from './AuthContext';

const mode = import.meta.env.VITE_DATA_MODE ?? 'mock';
const isMockMode = mode === 'mock';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem('studyforge.mock.auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AppUser;
          setUser(parsed);
        } catch {
          setUser({ uid: 'mock-user-1', email: 'dev@studyforge.local', displayName: 'Dev Learner' });
        }
      } else {
        // Default demo session for mock mode
        const defaultUser: AppUser = {
          uid: 'mock-user-1',
          email: 'dev@studyforge.local',
          displayName: 'Dev Learner',
        };
        localStorage.setItem('studyforge.mock.auth', JSON.stringify(defaultUser));
        setUser(defaultUser);
      }
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (u: User | null) => {
      setUser(u ? { uid: u.uid, email: u.email, displayName: u.displayName } : null);
      setLoading(false);
    });
  }, []);

  const loginMock = (email: string) => {
    const mockUser: AppUser = {
      uid: `mock-user-${Date.now()}`,
      email: email || 'dev@studyforge.local',
      displayName: (email || 'dev').split('@')[0],
    };
    localStorage.setItem('studyforge.mock.auth', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const registerMock = (email: string) => {
    const mockUser: AppUser = {
      uid: `mock-user-${Date.now()}`,
      email: email || 'newlearner@studyforge.local',
      displayName: (email || 'learner').split('@')[0],
    };
    localStorage.setItem('studyforge.mock.auth', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const resetPasswordMock = async (email: string) => {
    // Simulate reset link dispatch for mock user
    if (email) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const logout = async () => {
    if (isMockMode) {
      localStorage.removeItem('studyforge.mock.auth');
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isMockMode,
        loginMock,
        registerMock,
        resetPasswordMock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export type { AppUser };
