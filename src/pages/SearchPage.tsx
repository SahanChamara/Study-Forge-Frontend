import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { SearchInput } from '../components/ui/SearchInput';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
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
    <div className="search-page-container animate-fade-in">
      <PageHeader
        eyebrow="GLOBAL DISCOVERY"
        title="Cross-Curriculum Search"
        description="Instantly search across learning paths, topic concepts, smart notes, and practice labs."
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Main Search Input */}
      <div className="search-page-input-bar mb-6">
        <SearchInput
          placeholder="Search by topic, command syntax, Linux subsystem, or note tag..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onClear={() => handleQueryChange('')}
          sizeVariant="lg"
        />
      </div>

      {/* Category Tabs */}
      {results && totalMatches > 0 && (
        <div className="search-category-tabs-container mb-6">
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
        <div className="search-results-cards-stack">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" width="30%" height={16} />
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="85%" height={32} />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : results && totalMatches > 0 ? (
        <div className="search-results-cards-stack">
          {/* Paths */}
          {(activeCategory === 'all' || activeCategory === 'paths') &&
            results.paths.map((p) => (
              <Card key={p.id} className="search-hit-card-item" interactive>
                <CardBody>
                  <div className="search-hit-top-row">
                    <span className="search-entity-badge badge-path">🗺️ Learning Path</span>
                    <Badge variant="neutral" size="sm">{p.targetLevel}</Badge>
                  </div>
                  <Link to={`/paths/${p.id}`} className="search-hit-title-anchor">
                    {p.title}
                  </Link>
                  <p className="search-hit-summary">{p.goal}</p>
                </CardBody>
              </Card>
            ))}

          {/* Topics */}
          {(activeCategory === 'all' || activeCategory === 'topics') &&
            results.topics.map((t) => (
              <Card key={t.id} className="search-hit-card-item" interactive>
                <CardBody>
                  <div className="search-hit-top-row">
                    <span className="search-entity-badge badge-topic">📍 Topic</span>
                    <Badge variant="mastery" mastery={t.mastery} size="sm" />
                  </div>
                  <Link
                    to={`/paths/${t.pathId}/topics/${t.id}`}
                    className="search-hit-title-anchor"
                  >
                    {t.title}
                  </Link>
                  <p className="search-hit-summary">{t.objective}</p>
                </CardBody>
              </Card>
            ))}

          {/* Smart Notes */}
          {(activeCategory === 'all' || activeCategory === 'notes') &&
            results.notes.map((n) => (
              <Card key={n.id} className="search-hit-card-item" interactive>
                <CardBody>
                  <div className="search-hit-top-row">
                    <span className="search-entity-badge badge-note">📝 Smart Note</span>
                    <div className="search-note-tag-cluster">
                      {n.tags?.map((tag) => (
                        <span key={tag} className="tag-cluster-pill">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <Link
                    to={`/paths/${n.pathId}/topics/${n.topicId}`}
                    className="search-hit-title-anchor"
                  >
                    {n.title}
                  </Link>
                  <p className="search-hit-summary">
                    {n.contentMarkdown.slice(0, 160).replace(/#|```/g, '')}...
                  </p>
                </CardBody>
              </Card>
            ))}

          {/* Practice Labs */}
          {(activeCategory === 'all' || activeCategory === 'labs') &&
            results.practiceTasks.map((task) => (
              <Card key={task.id} className="search-hit-card-item" interactive>
                <CardBody>
                  <div className="search-hit-top-row">
                    <span className="search-entity-badge badge-lab">⚡ Practice Lab</span>
                    <span className={`task-badge-pill type-${task.type}`}>{task.type}</span>
                  </div>
                  <Link
                    to={`/paths/${task.pathId}/topics/${task.topicId}`}
                    className="search-hit-title-anchor"
                  >
                    {task.title}
                  </Link>
                  <p className="search-hit-summary">{task.instructions}</p>
                </CardBody>
              </Card>
            ))}
        </div>
      ) : query.trim() && !loading ? (
        <EmptyState
          icon="🔍"
          title={`No results found for "${query}"`}
          description="Try checking for spelling errors, broader search terms, or explore our curriculum catalog."
          actionLabel="Browse Learning Paths"
          onAction={() => window.location.assign('/paths')}
        />
      ) : (
        <Card className="search-suggestions-container">
          <CardBody>
            <h3>Popular Search Terms</h3>
            <div className="popular-chips-flex">
              {['kernel', 'filesystem', 'strace', 'permissions', 'systemd', 'networking', 'signals', 'fhs'].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    className="popular-search-chip"
                    onClick={() => handleQueryChange(term)}
                  >
                    🔍 {term}
                  </button>
                )
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
