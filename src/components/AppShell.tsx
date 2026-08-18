import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
export function AppShell() {
  const { user, logout } = useAuth();
  return <div className="app-shell"><aside><div className="brand"><span>SF</span><div><strong>StudyForge</strong><small>Learning OS</small></div></div><nav><NavLink to="/">Dashboard</NavLink><NavLink to="/paths">Learning Paths</NavLink></nav><div className="aside-bottom"><small>{user?.email}</small><button className="secondary" onClick={() => logout()}>Sign out</button></div></aside><main><Outlet /></main></div>;
}
