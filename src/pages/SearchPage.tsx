import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import type { GlobalSearchResult } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search execution
  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api<GlobalSearchResult>(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setResults(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setSearchParams(val.trim() ? { q: val } : {});
    executeSearch(val);
  };

  const totalMatches = useMemo(() => {
    return (
      (results?.paths.length || 0) +
      (results?.topics.length || 0) +
      (results?.notes.length || 0) +
      (results?.practiceTasks.length || 0)
    );
  }, [results]);

  return (
    <section className="search-page-view">
      <header className="page-header">
        <div>
          <div className="eyebrow">GLOBAL DISCOVERY</div>
          <h1>Cross-Curriculum Search</h1>
          <p>Instantly search across learning paths, topic concepts, smart notes, and practice labs.</p>
        </div>
      </header>

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Main Search Input */}
      <div className="search-page-input-bar">
        <Input
          placeholder="Search by topic, command syntax, Linux subsystem, or note tag..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      {results && totalMatches > 0 && (
        <div className="search-category-tabs">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Results', badge: totalMatches },
              { id: 'paths', label: 'Paths', badge: results.paths.length },
              { id: 'topics', label: 'Topics', badge: results.topics.length },
              { id: 'notes', label: 'Smart Notes', badge: results.notes.length },
              { id: 'labs', label: 'Practice Labs', badge: results.practiceTasks.length },
            ]}
            activeTab={activeCategory}
            onChange={setActiveCategory}
          />
        </div>
      )}

      {/* Results Rendering */}
      {loading ? (
        <div className="search-results-stack">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={100} />
          ))}
        </div>
      ) : results && totalMatches > 0 ? (
        <div className="search-results-stack">
          {/* Paths */}
          {(activeCategory === 'all' || activeCategory === 'paths') &&
            results.paths.map((p) => (
              <Card key={p.id} className="search-hit-card" interactive>
                <CardBody>
                  <div className="search-hit-header">
                    <span className="search-hit-badge badge-path">🗺️ Learning Path</span>
                    <span className="badge badge-sm badge-neutral">{p.targetLevel}</span>
                  </div>
                  <Link to={`/paths/${p.id}`} className="search-hit-title-link">
                    {p.title}
                  </Link>
                  <p className="search-hit-desc">{p.goal}</p>
                </CardBody>
              </Card>
            ))}

          {/* Topics */}
          {(activeCategory === 'all' || activeCategory === 'topics') &&
            results.topics.map((t) => (
              <Card key={t.id} className="search-hit-card" interactive>
                <CardBody>
                  <div className="search-hit-header">
                    <span className="search-hit-badge badge-topic">📍 Topic</span>
                    <span className="badge badge-sm badge-mastery">M{t.mastery}</span>
                  </div>
                  <Link
                    to={`/paths/${t.pathId}/topics/${t.id}`}
                    className="search-hit-title-link"
                  >
                    {t.title}
                  </Link>
                  <p className="search-hit-desc">{t.objective}</p>
                </CardBody>
              </Card>
            ))}

          {/* Smart Notes */}
          {(activeCategory === 'all' || activeCategory === 'notes') &&
            results.notes.map((n) => (
              <Card key={n.id} className="search-hit-card" interactive>
                <CardBody>
                  <div className="search-hit-header">
                    <span className="search-hit-badge badge-note">📝 Smart Note</span>
                    <div className="search-note-tags">
                      {n.tags?.map((tag) => (
                        <span key={tag} className="tag-pill">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/paths/${n.pathId}/topics/${n.topicId}`}
                    className="search-hit-title-link"
                  >
                    {n.title}
                  </Link>
                  <p className="search-hit-desc">
                    {n.contentMarkdown.slice(0, 160).replace(/#|```/g, '')}...
                  </p>
                </CardBody>
              </Card>
            ))}

          {/* Practice Labs */}
          {(activeCategory === 'all' || activeCategory === 'labs') &&
            results.practiceTasks.map((task) => (
              <Card key={task.id} className="search-hit-card" interactive>
                <CardBody>
                  <div className="search-hit-header">
                    <span className="search-hit-badge badge-lab">⚡ Practice Lab</span>
                    <span className={`task-type-chip type-${task.type}`}>{task.type}</span>
                  </div>
                  <Link
                    to={`/paths/${task.pathId}/topics/${task.topicId}`}
                    className="search-hit-title-link"
                  >
                    {task.title}
                  </Link>
                  <p className="search-hit-desc">{task.instructions}</p>
                </CardBody>
              </Card>
            ))}
        </div>
      ) : query.trim() && !loading ? (
        <EmptyState
          icon="🔍"
          title={`No results found for "${query}"`}
          description="Try checking for spelling errors, broader search terms, or explore our curriculum catalog."
          action={
            <Link to="/paths" className="btn btn-primary">
              Browse Learning Paths →
            </Link>
          }
        />
      ) : (
        <div className="search-suggestions-card">
          <h3>Popular Search Terms</h3>
          <div className="search-chips-list">
            {['kernel', 'filesystem', 'strace', 'permissions', 'systemd', 'networking', 'signals', 'fhs'].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  className="search-suggest-chip"
                  onClick={() => handleQueryChange(term)}
                >
                  🔍 {term}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
};
