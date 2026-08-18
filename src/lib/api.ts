import { auth } from './firebase';
import { mockApi } from '../mocks/api';

const base = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const mode = import.meta.env.VITE_DATA_MODE ?? 'mock';

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  if (mode === 'mock') return mockApi<T>(path, options);

  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('You are not signed in.');
  const r = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!r.ok) {
    let m = `Request failed (${r.status})`;
    try {
      const b = await r.json();
      m = Array.isArray(b.message) ? b.message.join(', ') : (b.message ?? m);
    } catch {
      // ignore JSON parse error for error response
    }
    throw new Error(m);
  }
  return r.json();
}
