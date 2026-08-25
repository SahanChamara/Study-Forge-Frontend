import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
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

  const pathOptions = useMemo(() => [
    { value: 'all', label: 'All Learning Paths' },
    ...paths.map((p) => ({ value: p.id, label: p.title })),
  ], [paths]);

  return (
    <div className="notes-page-container animate-fade-in">
      <PageHeader
        eyebrow="KNOWLEDGE BASE"
        title="Smart Notes"
        description="Structured 9-section Markdown notes authored from memory across your curricula."
        actions={
          <Badge variant="accent">
            {notes.length} Total Notes
          </Badge>
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="notes-filter-bar mb-6">
        <div className="notes-search-box">
          <SearchInput
            placeholder="Search notes by concept, command syntax, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="notes-path-select-box">
          <Select
            value={selectedPathId}
            onChange={(e) => setSelectedPathId(e.target.value)}
            options={pathOptions}
          />
        </div>
      </div>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <div className="notes-tag-chips-bar mb-6">
          <span className="tag-filter-title">Filter by Tag:</span>
          <button
            type="button"
            className={`tag-filter-chip ${selectedTag === null ? 'is-active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-filter-chip ${selectedTag === tag ? 'is-active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Notes Content Grid */}
      {loading ? (
        <div className="notes-catalog-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="70%" height={24} />
                <Skeleton variant="text" width="90%" height={60} />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="notes-catalog-grid">
          {filteredNotes.map((note) => {
            const wordCount = getWordCount(note.contentMarkdown);
            const pathTitle = pathMap.get(note.pathId) || 'Learning Path';
            const topicTitle = topicMap.get(note.topicId) || 'Topic Note';

            return (
              <Card key={note.id} className="note-card-item" interactive>
                <CardHeader>
                  <div className="note-meta-badges">
                    <span className="note-path-badge">{pathTitle}</span>
                    <span className="note-word-count-badge">{wordCount} words</span>
                  </div>
                  <button
                    type="button"
                    className="note-card-delete-btn"
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
                  <h3 className="note-heading-text">{note.title}</h3>
                  <p className="note-topic-loc">📍 {topicTitle}</p>
                  <div className="note-text-snippet">
                    {note.contentMarkdown.slice(0, 180).replace(/#|```/g, '')}...
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tag-pills">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="note-pill-tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </CardBody>
                <CardFooter className="note-card-footer-actions">
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
                    Study Workspace →
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
          description="Try broadening your search query or open an active topic workspace to write new structured notes from memory."
          actionLabel="Browse Learning Paths"
          onAction={() => window.location.assign('/paths')}
        />
      )}

      {/* Note Reader / Live Preview Modal */}
      {activePreviewNote && (
        <Modal
          isOpen={true}
          onClose={() => setActivePreviewNote(null)}
          title={activePreviewNote.title}
        >
          <div className="note-modal-meta mb-4">
            <Badge variant="neutral">
              {pathMap.get(activePreviewNote.pathId) || 'Path'}
            </Badge>
            <span className="modal-topic-sublabel">
              {topicMap.get(activePreviewNote.topicId) || 'Topic'}
            </span>
          </div>

          <div className="note-modal-preview-body">
            <MarkdownPreview content={activePreviewNote.contentMarkdown} />
          </div>

          <div className="modal-form-actions mt-6">
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
    </div>
  );
};
