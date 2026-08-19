import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Spinner } from './ui/Spinner';
import type { GlobalSearchResult } from '../types';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api<GlobalSearchResult>(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  const totalMatches =
    (results?.paths.length || 0) +
    (results?.topics.length || 0) +
    (results?.notes.length || 0) +
    (results?.practiceTasks.length || 0);

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-palette" onClick={(e) => e.stopPropagation()}>
        {/* Search Header Input */}
        <div className="search-palette-header">
          <span className="search-palette-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-palette-input"
            placeholder="Search paths, topics, smart notes, commands, and labs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Spinner size="sm" />}
          <button
            type="button"
            className="search-palette-close"
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="search-palette-body">
          {query.trim() && !loading && results && totalMatches === 0 && (
            <div className="search-palette-empty">
              <p>No matches found for &quot;{query}&quot;</p>
              <small>Try searching for Linux commands, concepts, or topic titles.</small>
            </div>
          )}

          {!query.trim() && (
            <div className="search-palette-hint">
              <div className="hint-group">
                <span className="hint-label">Quick Jumps:</span>
                <button
                  type="button"
                  className="quick-search-chip"
                  onClick={() => setQuery('kernel')}
                >
                  #kernel
                </button>
                <button
                  type="button"
                  className="quick-search-chip"
                  onClick={() => setQuery('filesystem')}
                >
                  #filesystem
                </button>
                <button
                  type="button"
                  className="quick-search-chip"
                  onClick={() => setQuery('strace')}
                >
                  strace
                </button>
                <button
                  type="button"
                  className="quick-search-chip"
                  onClick={() => setQuery('systemd')}
                >
                  systemd
                </button>
              </div>
            </div>
          )}

          {results && totalMatches > 0 && (
            <div className="search-results-groups">
              {/* Learning Paths */}
              {results.paths.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span>Learning Paths</span>
                    <span className="group-count">{results.paths.length}</span>
                  </div>
                  {results.paths.map((p) => (
                    <div
                      key={p.id}
                      className="search-result-item"
                      onClick={() => handleNavigate(`/paths/${p.id}`)}
                    >
                      <span className="item-entity-icon">🗺️</span>
                      <div className="item-details">
                        <strong className="item-title">{p.title}</strong>
                        <span className="item-subtitle">{p.goal}</span>
                      </div>
                      <span className="badge badge-sm badge-neutral">{p.targetLevel}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Topics */}
              {results.topics.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span>Curriculum Topics</span>
                    <span className="group-count">{results.topics.length}</span>
                  </div>
                  {results.topics.map((t) => (
                    <div
                      key={t.id}
                      className="search-result-item"
                      onClick={() => handleNavigate(`/paths/${t.pathId}/topics/${t.id}`)}
                    >
                      <span className="item-entity-icon">📍</span>
                      <div className="item-details">
                        <strong className="item-title">{t.title}</strong>
                        <span className="item-subtitle">{t.objective}</span>
                      </div>
                      <span className="badge badge-sm badge-mastery">M{t.mastery}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Smart Notes */}
              {results.notes.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span>Smart Notes</span>
                    <span className="group-count">{results.notes.length}</span>
                  </div>
                  {results.notes.map((n) => (
                    <div
                      key={n.id}
                      className="search-result-item"
                      onClick={() => handleNavigate(`/paths/${n.pathId}/topics/${n.topicId}`)}
                    >
                      <span className="item-entity-icon">📝</span>
                      <div className="item-details">
                        <strong className="item-title">{n.title}</strong>
                        <span className="item-subtitle">
                          {n.contentMarkdown.slice(0, 80).replace(/#|```/g, '')}...
                        </span>
                      </div>
                      <span className="item-note-tags">
                        {n.tags?.slice(0, 2).map((t) => `#${t}`).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Practice Tasks */}
              {results.practiceTasks.length > 0 && (
                <div className="search-group">
                  <div className="search-group-title">
                    <span>Practice Labs</span>
                    <span className="group-count">{results.practiceTasks.length}</span>
                  </div>
                  {results.practiceTasks.map((task) => (
                    <div
                      key={task.id}
                      className="search-result-item"
                      onClick={() => handleNavigate(`/paths/${task.pathId}/topics/${task.topicId}`)}
                    >
                      <span className="item-entity-icon">⚡</span>
                      <div className="item-details">
                        <strong className="item-title">{task.title}</strong>
                        <span className="item-subtitle">{task.instructions}</span>
                      </div>
                      <span className={`task-type-badge type-${task.type}`}>{task.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Link to Dedicated Search Page */}
        <div className="search-palette-footer">
          <span>Tip: Press <kbd>ESC</kbd> to exit search</span>
          <button
            type="button"
            className="full-search-page-btn"
            onClick={() => handleNavigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')}
          >
            Open Dedicated Search Page →
          </button>
        </div>
      </div>
    </div>
  );
};
