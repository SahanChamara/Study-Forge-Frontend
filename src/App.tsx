import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PathsPage } from './pages/PathsPage';
import { PathDetailPage } from './pages/PathDetailPage';
import { TopicPage } from './pages/TopicPage';
import { NotesPage } from './pages/NotesPage';
import { PracticePage } from './pages/PracticePage';
import { ReviewPage } from './pages/ReviewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="/paths" element={<PathsPage />} />
          <Route path="/paths/:id" element={<PathDetailPage />} />
          <Route path="/paths/:pathId/topics/:topicId" element={<TopicPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
