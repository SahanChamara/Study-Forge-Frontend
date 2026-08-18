import type { LearningPath, Note, PracticeTask, Topic } from '../types';

let paths: LearningPath[] = [];
let notes: Note[] = [];
let tasks: PracticeTask[] = [];
let seq = 1;
const id = (prefix: string) => `${prefix}-${seq++}`;

const linuxModules = [
  { id: 'm-linux-1', title: 'Linux Foundations', description: 'Architecture, shell, filesystem and core command-line habits.', order: 1 },
  { id: 'm-linux-2', title: 'Users, Permissions & Processes', description: 'Identity, access, jobs and process control.', order: 2 },
  { id: 'm-linux-3', title: 'Networking, Services & Troubleshooting', description: 'Networking, systemd, logs, SSH and production-style diagnosis.', order: 3 },
];
const linuxTopics: Topic[] = [
  { id: 't-linux-1', moduleId: 'm-linux-1', title: 'Linux architecture', objective: 'Explain kernel, user space, shell, processes and filesystem responsibilities.', estimatedMinutes: 45, order: 1, status: 'mastered', mastery: 4, resourceUrls: [] },
  { id: 't-linux-2', moduleId: 'm-linux-1', title: 'Filesystem hierarchy', objective: 'Navigate and explain important Linux filesystem locations.', estimatedMinutes: 60, order: 2, status: 'practicing', mastery: 3, resourceUrls: [] },
  { id: 't-linux-3', moduleId: 'm-linux-1', title: 'Shell and command composition', objective: 'Use pipes, redirects, help systems and command composition confidently.', estimatedMinutes: 75, order: 3, status: 'learning', mastery: 2, resourceUrls: [] },
  { id: 't-linux-4', moduleId: 'm-linux-2', title: 'Users, groups and permissions', objective: 'Manage ownership and permissions and troubleshoot access failures.', estimatedMinutes: 90, order: 1, status: 'not_started', mastery: 0, resourceUrls: [] },
  { id: 't-linux-5', moduleId: 'm-linux-2', title: 'Processes and jobs', objective: 'Inspect, prioritize, signal and troubleshoot Linux processes.', estimatedMinutes: 75, order: 2, status: 'not_started', mastery: 0, resourceUrls: [] },
  { id: 't-linux-6', moduleId: 'm-linux-3', title: 'systemd and logs', objective: 'Operate services and diagnose failures using systemd and journal logs.', estimatedMinutes: 90, order: 1, status: 'not_started', mastery: 0, resourceUrls: [] },
  { id: 't-linux-7', moduleId: 'm-linux-3', title: 'Networking and SSH', objective: 'Inspect connectivity, ports, DNS and secure remote access.', estimatedMinutes: 120, order: 2, status: 'not_started', mastery: 0, resourceUrls: [] },
];

function linuxPath(pathId = 'linux-devops'): LearningPath {
  return {
    id: pathId,
    title: 'Linux for DevOps',
    description: 'A structured path from Linux foundations to practical DevOps operations.',
    goal: 'Operate, automate, secure and troubleshoot Linux confidently.',
    targetLevel: 'job-ready',
    updatedAt: new Date().toISOString(),
    modules: structuredClone(linuxModules),
    topics: structuredClone(linuxTopics),
  };
}

paths = [linuxPath()];

function parseBody(options: RequestInit) {
  if (!options.body) return {};
  return typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
}

export async function mockApi<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const method = (options.method ?? 'GET').toUpperCase();
  const url = new URL(path, 'http://mock.local');
  const pathname = url.pathname;

  if (method === 'GET' && pathname === '/dashboard') {
    const topics = paths.flatMap((p) => p.topics ?? []);
    return {
      paths: paths.length,
      topics: topics.length,
      mastered: topics.filter((t) => t.status === 'mastered').length,
      inProgress: topics.filter((t) => ['learning', 'practicing', 'review'].includes(t.status)).length,
      notes: notes.length,
      completedPractice: tasks.filter((t) => t.status === 'done').length,
    } as T;
  }

  if (pathname === '/learning-paths' && method === 'GET') return structuredClone(paths) as T;
  if (pathname === '/learning-paths' && method === 'POST') {
    const body = parseBody(options) as Partial<LearningPath>;
    const created: LearningPath = { id: id('path'), title: body.title ?? 'Untitled path', description: body.description ?? '', goal: body.goal ?? '', targetLevel: body.targetLevel ?? 'practical', updatedAt: new Date().toISOString(), modules: [], topics: [] };
    paths.push(created); return structuredClone(created) as T;
  }

  const seed = pathname.match(/^\/learning-paths\/([^/]+)\/seed\/linux-devops$/);
  if (seed && method === 'POST') {
    const idx = paths.findIndex((p) => p.id === seed[1]);
    if (idx < 0) throw new Error('Learning path not found');
    paths[idx] = { ...paths[idx], modules: structuredClone(linuxModules), topics: structuredClone(linuxTopics), updatedAt: new Date().toISOString() };
    return structuredClone(paths[idx]) as T;
  }

  const topicPatch = pathname.match(/^\/learning-paths\/([^/]+)\/topics\/([^/]+)$/);
  if (topicPatch && method === 'PATCH') {
    const pathItem = paths.find((p) => p.id === topicPatch[1]);
    const topic = pathItem?.topics?.find((t) => t.id === topicPatch[2]);
    if (!topic) throw new Error('Topic not found');
    Object.assign(topic, parseBody(options));
    return structuredClone(topic) as T;
  }

  const pathGet = pathname.match(/^\/learning-paths\/([^/]+)$/);
  if (pathGet && method === 'GET') {
    const item = paths.find((p) => p.id === pathGet[1]);
    if (!item) throw new Error('Learning path not found');
    return structuredClone(item) as T;
  }

  if (pathname === '/notes' && method === 'GET') {
    const pathId = url.searchParams.get('pathId'); const topicId = url.searchParams.get('topicId');
    return structuredClone(notes.filter((n) => (!pathId || n.pathId === pathId) && (!topicId || n.topicId === topicId))) as T;
  }
  if (pathname === '/notes' && method === 'POST') {
    const body = parseBody(options) as Partial<Note>;
    const created: Note = { id: id('note'), pathId: body.pathId ?? '', topicId: body.topicId ?? '', title: body.title ?? 'Topic note', contentMarkdown: body.contentMarkdown ?? '', tags: body.tags ?? [], updatedAt: new Date().toISOString() };
    notes.push(created); return structuredClone(created) as T;
  }
  const notePatch = pathname.match(/^\/notes\/([^/]+)$/);
  if (notePatch && method === 'PATCH') {
    const note = notes.find((n) => n.id === notePatch[1]); if (!note) throw new Error('Note not found');
    Object.assign(note, parseBody(options), { updatedAt: new Date().toISOString() }); return structuredClone(note) as T;
  }

  if (pathname === '/practice' && method === 'GET') {
    const pathId = url.searchParams.get('pathId'); const topicId = url.searchParams.get('topicId');
    return structuredClone(tasks.filter((t) => (!pathId || t.pathId === pathId) && (!topicId || t.topicId === topicId))) as T;
  }
  if (pathname === '/practice' && method === 'POST') {
    const body = parseBody(options) as Partial<PracticeTask>;
    const created: PracticeTask = { id: id('practice'), pathId: body.pathId ?? '', topicId: body.topicId ?? '', title: body.title ?? 'Practice task', instructions: body.instructions ?? '', type: body.type ?? 'lab', status: 'todo', evidence: '' };
    tasks.push(created); return structuredClone(created) as T;
  }
  const practicePatch = pathname.match(/^\/practice\/([^/]+)$/);
  if (practicePatch && method === 'PATCH') {
    const task = tasks.find((t) => t.id === practicePatch[1]); if (!task) throw new Error('Practice task not found');
    Object.assign(task, parseBody(options)); return structuredClone(task) as T;
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${path}`);
}
