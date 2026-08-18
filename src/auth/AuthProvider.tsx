import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AppUser { uid: string; email: string | null }
interface AuthContextValue { user: AppUser | null; loading: boolean; loginMock: (email: string) => void; logout: () => Promise<void> }
const C = createContext<AuthContextValue>({ user: null, loading: true, loginMock: () => {}, logout: async () => {} });
const mode = import.meta.env.VITE_DATA_MODE ?? 'mock';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode === 'mock') {
      const email = localStorage.getItem('studyforge.mock.email') ?? 'dev@studyforge.local';
      setUser({ uid: 'mock-user', email });
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u: User | null) => {
      setUser(u ? { uid: u.uid, email: u.email } : null);
      setLoading(false);
    });
  }, []);

  const loginMock = (email: string) => {
    localStorage.setItem('studyforge.mock.email', email || 'dev@studyforge.local');
    setUser({ uid: 'mock-user', email: email || 'dev@studyforge.local' });
  };
  const logout = async () => {
    if (mode === 'mock') { setUser(null); return; }
    await auth.signOut();
  };

  return <C.Provider value={{ user, loading, loginMock, logout }}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
