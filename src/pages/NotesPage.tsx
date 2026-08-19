import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Alert } from '../components/ui/Alert';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { MarkdownPreview } from '../components/ui/MarkdownPreview';
import type { LearningPath, Note } from '../types';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathId, setSelectedPathId] = useState('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activePreviewNote, setActivePreviewNote] = useState<Note | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [notesData, pathsData] = await Promise.all([
        api<Note[]>('/notes'),
        api<LearningPath[]>('/learning-paths'),
      ]);
      setNotes(notesData);
      setPaths(pathsData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load smart notes.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map pathId and topicId to human-readable names
  const pathMap = useMemo(() => {
    const map = new Map<string, string>();
    paths.forEach((p) => map.set(p.id, p.title));
    return map;
  }, [paths]);

  const topicMap = useMemo(() => {
    const map = new Map<string, string>();
    paths.forEach((p) => {
      p.topics?.forEach((t) => map.set(t.id, t.title));
    });
    return map;
  }, [paths]);

  // Aggregate all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [notes]);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (selectedPathId !== 'all' && n.pathId !== selectedPathId) return false;
      if (selectedTag && !n.tags?.includes(selectedTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = n.title.toLowerCase().includes(q);
        const inContent = n.contentMarkdown.toLowerCase().includes(q);
        const inTags = n.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inTags) return false;
      }
      return true;
    });
  }, [notes, selectedPathId, selectedTag, searchQuery]);

  // Delete note handler
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this smart note?')) return;
    try {
      await api(`/notes/${noteId}`, { method: 'DELETE' });
      setNotes(notes.filter((n) => n.id !== noteId));
      if (activePreviewNote?.id === noteId) {
        setActivePreviewNote(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note.');
    }
  };

  // Helper for word count
  const getWordCount = (text: string) => {
    const clean = text.replace(/#|\*|`|-/g, '').trim();
    return clean ? clean.split(/\s+/).length : 0;
  };

  return (
    <section className="notes-page-view">
      <header className="page-header">
        <div>
          <div className="eyebrow">KNOWLEDGE BASE</div>
          <h1>Smart Notes</h1>
          <p>Structured 9-section Markdown notes authored from memory across your curricula.</p>
        </div>
        <div className="notes-header-stats">
          <span className="badge badge-accent">{notes.length} Total Notes</span>
        </div>
      </header>

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="notes-filter-bar">
        <div className="notes-search-wrapper">
          <Input
            placeholder="Search notes by concept, command syntax, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="notes-path-select-wrapper">
          <select
            className="notes-path-dropdown"
            value={selectedPathId}
            onChange={(e) => setSelectedPathId(e.target.value)}
          >
            <option value="all">All Learning Paths</option>
            {paths.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <div className="notes-tag-chips-bar">
          <span className="tag-filter-label">Filter by Tag:</span>
          <button
            type="button"
            className={`tag-chip ${selectedTag === null ? 'active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Content Grid */}
      {loading ? (
        <div className="notes-grid-layout">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={220} />
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="notes-grid-layout">
          {filteredNotes.map((note) => {
            const wordCount = getWordCount(note.contentMarkdown);
            const pathTitle = pathMap.get(note.pathId) || 'Learning Path';
            const topicTitle = topicMap.get(note.topicId) || 'Topic Note';

            return (
              <Card key={note.id} className="note-hub-card" interactive>
                <CardHeader>
                  <div className="note-card-meta">
                    <span className="note-path-tag">{pathTitle}</span>
                    <span className="note-word-count">{wordCount} words</span>
                  </div>
                  <button
                    type="button"
                    className="note-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    title="Delete Note"
                  >
                    ×
                  </button>
                </CardHeader>
                <CardBody onClick={() => setActivePreviewNote(note)}>
                  <h3 className="note-card-title">{note.title}</h3>
                  <p className="note-topic-subtitle">📍 {topicTitle}</p>
                  <div className="note-snippet-preview">
                    {note.contentMarkdown.slice(0, 180).replace(/#|```/g, '')}...
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags-list">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="note-tag-badge">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </CardBody>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActivePreviewNote(note)}
                  >
                    👁 Preview
                  </Button>
                  <Link
                    to={`/paths/${note.pathId}/topics/${note.topicId}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Open in Study Workspace →
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📝"
          title="No smart notes match your filter"
          description="Try broadening your search criteria or open an active topic workspace to write new structured notes from memory."
          action={
            <Link to="/paths" className="btn btn-primary">
              Browse Learning Paths →
            </Link>
          }
        />
      )}

      {/* Note Reader / Live Preview Modal */}
      {activePreviewNote && (
        <Modal
          isOpen={true}
          onClose={() => setActivePreviewNote(null)}
          title={activePreviewNote.title}
        >
          <div className="note-modal-header-meta">
            <span className="badge badge-neutral">
              {pathMap.get(activePreviewNote.pathId) || 'Path'}
            </span>
            <span className="modal-topic-title">
              {topicMap.get(activePreviewNote.topicId) || 'Topic'}
            </span>
          </div>

          <div className="note-modal-body-rendered">
            <MarkdownPreview content={activePreviewNote.contentMarkdown} />
          </div>

          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setActivePreviewNote(null)}
            >
              Close
            </Button>
            <Link
              to={`/paths/${activePreviewNote.pathId}/topics/${activePreviewNote.topicId}`}
              className="btn btn-primary"
            >
              Edit in Topic Workspace →
            </Link>
          </div>
        </Modal>
      )}
    </section>
  );
};
