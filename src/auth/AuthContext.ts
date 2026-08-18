import { createContext } from 'react';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isMockMode: boolean;
  loginMock: (email: string) => void;
  registerMock: (email: string) => void;
  resetPasswordMock: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isMockMode: true,
  loginMock: () => {},
  registerMock: () => {},
  resetPasswordMock: async () => {},
  logout: async () => {},
});
