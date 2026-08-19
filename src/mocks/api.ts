import type { LearningPath, ModuleItem, Note, PracticeTask, Topic } from '../types';

let paths: LearningPath[] = [];
const notes: Note[] = [];
const tasks: PracticeTask[] = [];
let seq = 100;
const id = (prefix: string) => `${prefix}-${seq++}`;

const linuxModules: ModuleItem[] = [
  { id: 'm-linux-1', pathId: 'linux-devops', title: 'Linux Foundations', description: 'Architecture, shell, filesystem and core command-line habits.', order: 1 },
  { id: 'm-linux-2', pathId: 'linux-devops', title: 'Users, Permissions & Processes', description: 'Identity, access, jobs and process control.', order: 2 },
  { id: 'm-linux-3', pathId: 'linux-devops', title: 'Networking, Services & Troubleshooting', description: 'Networking, systemd, logs, SSH and production-style diagnosis.', order: 3 },
];

const linuxTopics: Topic[] = [
  {
    id: 't-linux-1',
    moduleId: 'm-linux-1',
    pathId: 'linux-devops',
    title: 'Linux architecture',
    objective: 'Explain kernel, user space, shell, system calls, and filesystem responsibilities unaided.',
    prerequisites: ['Basic CLI familiarity', 'Terminal emulator setup'],
    estimatedMinutes: 45,
    order: 1,
    status: 'mastered',
    mastery: 4,
    resourceUrls: [
      'https://www.kernel.org/doc/html/latest/',
      'https://tldp.org/LDP/intro-linux/html/',
      'https://man7.org/linux/man-pages/man2/syscalls.2.html',
    ],
  },
  {
    id: 't-linux-2',
    moduleId: 'm-linux-1',
    pathId: 'linux-devops',
    title: 'Filesystem hierarchy',
    objective: 'Navigate and explain important Linux filesystem locations (/etc, /var, /proc, /sys, /opt).',
    prerequisites: ['Linux architecture'],
    estimatedMinutes: 60,
    order: 2,
    status: 'practicing',
    mastery: 3,
    resourceUrls: [
      'https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html',
      'https://man7.org/linux/man-pages/man7/hier.7.html',
    ],
  },
  {
    id: 't-linux-3',
    moduleId: 'm-linux-1',
    pathId: 'linux-devops',
    title: 'Shell and command composition',
    objective: 'Use pipes, redirects (stdout/stderr), xargs, tee, and subshells confidently.',
    prerequisites: ['Filesystem navigation'],
    estimatedMinutes: 75,
    order: 3,
    status: 'learning',
    mastery: 2,
    resourceUrls: [
      'https://www.gnu.org/software/bash/manual/',
      'https://mywiki.wooledge.org/BashGuide',
    ],
  },
  {
    id: 't-linux-4',
    moduleId: 'm-linux-2',
    pathId: 'linux-devops',
    title: 'Users, groups and permissions',
    objective: 'Manage UID/GID, chmod (octal & symbolic), chown, setuid, and troubleshoot permission failures.',
    prerequisites: ['Shell command composition'],
    estimatedMinutes: 90,
    order: 1,
    status: 'not_started',
    mastery: 0,
    resourceUrls: [
      'https://man7.org/linux/man-pages/man1/chmod.1.html',
      'https://wiki.archlinux.org/title/File_permissions_and_attributes',
    ],
  },
  {
    id: 't-linux-5',
    moduleId: 'm-linux-2',
    pathId: 'linux-devops',
    title: 'Processes and jobs',
    objective: 'Inspect with ps/top/htop, prioritize with nice/renice, send signals (SIGTERM, SIGKILL), and manage background jobs.',
    prerequisites: ['Shell and command composition'],
    estimatedMinutes: 75,
    order: 2,
    status: 'not_started',
    mastery: 0,
    resourceUrls: [
      'https://man7.org/linux/man-pages/man1/ps.1.html',
      'https://man7.org/linux/man-pages/man7/signal.7.html',
    ],
  },
  {
    id: 't-linux-6',
    moduleId: 'm-linux-3',
    pathId: 'linux-devops',
    title: 'systemd and logs',
    objective: 'Operate units (systemctl), inspect journald logs (journalctl), analyze boot performance, and create unit files.',
    prerequisites: ['Processes and jobs'],
    estimatedMinutes: 90,
    order: 1,
    status: 'not_started',
    mastery: 0,
    resourceUrls: [
      'https://www.freedesktop.org/software/systemd/man/latest/systemctl.html',
      'https://www.freedesktop.org/software/systemd/man/latest/journalctl.html',
    ],
  },
  {
    id: 't-linux-7',
    moduleId: 'm-linux-3',
    pathId: 'linux-devops',
    title: 'Networking and SSH',
    objective: 'Inspect network interfaces (ip, ss), configure routing/DNS (resolv.conf), harden SSH server, and debug latency.',
    prerequisites: ['systemd and logs'],
    estimatedMinutes: 120,
    order: 2,
    status: 'not_started',
    mastery: 0,
    resourceUrls: [
      'https://man7.org/linux/man-pages/man8/ip.8.html',
      'https://man.openbsd.org/sshd_config.5',
    ],
  },
];

function createLinuxPath(pathId = 'linux-devops'): LearningPath {
  return {
    id: pathId,
    title: 'Linux for DevOps',
    description: 'A structured curriculum from Linux foundations to practical production operations.',
    goal: 'Operate, automate, secure and troubleshoot Linux servers with confidence.',
    targetLevel: 'job-ready',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    modules: structuredClone(linuxModules),
    topics: structuredClone(linuxTopics),
    progressPercent: 42,
  };
}

paths = [createLinuxPath()];

function parseBody(options: RequestInit) {
  if (!options.body) return {};
  return typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
}

function calculatePathProgress(path: LearningPath): number {
  if (!path.topics || path.topics.length === 0) return 0;
  const masteredCount = path.topics.filter((t) => t.status === 'mastered').length;
  const inProgressCount = path.topics.filter((t) => ['learning', 'practicing', 'review'].includes(t.status)).length;
  return Math.round(((masteredCount * 1.0 + inProgressCount * 0.5) / path.topics.length) * 100);
}

export async function mockApi<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const method = (options.method ?? 'GET').toUpperCase();
  const url = new URL(path, 'http://mock.local');
  const pathname = url.pathname;

  // Dashboard endpoint
  if (method === 'GET' && pathname === '/dashboard') {
    const allTopics = paths.flatMap((p) => p.topics ?? []);
    const masteredCount = allTopics.filter((t) => t.status === 'mastered').length;
    const inProgressTopics = allTopics.filter((t) => ['learning', 'practicing', 'review'].includes(t.status));
    
    // Find active topic (first topic that is practicing or learning)
    const activeTopic = inProgressTopics[0] || (allTopics.length > 0 ? allTopics[0] : null);
    const activePath = activeTopic ? paths.find((p) => p.id === activeTopic.pathId) : null;

    return {
      paths: paths.length,
      topics: allTopics.length,
      mastered: masteredCount,
      inProgress: inProgressTopics.length,
      notes: notes.length,
      completedPractice: tasks.filter((t) => t.status === 'done').length,
      pendingReviews: allTopics.filter((t) => t.status === 'review' || (t.mastery > 0 && t.mastery < 4)).length,
      activeTopic: activeTopic ? {
        ...activeTopic,
        pathTitle: activePath?.title || 'Learning Path',
      } : null,
    } as T;
  }

  // Learning Paths List
  if (pathname === '/learning-paths' && method === 'GET') {
    return paths.map((p) => ({
      ...p,
      progressPercent: calculatePathProgress(p),
    })) as T;
  }

  // Create Learning Path
  if (pathname === '/learning-paths' && method === 'POST') {
    const body = parseBody(options) as Partial<LearningPath> & { seedTemplate?: string };
    const newId = id('path');
    let newModules: ModuleItem[] = [];
    let newTopics: Topic[] = [];

    if (body.seedTemplate === 'linux-devops') {
      newModules = structuredClone(linuxModules).map((m) => ({ ...m, pathId: newId }));
      newTopics = structuredClone(linuxTopics).map((t) => ({ ...t, pathId: newId, status: 'not_started' as const, mastery: 0 as const }));
    }

    const created: LearningPath = {
      id: newId,
      title: body.title || 'Untitled Path',
      description: body.description || '',
      goal: body.goal || 'Build practical working proficiency',
      targetLevel: body.targetLevel || 'practical',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modules: newModules,
      topics: newTopics,
      progressPercent: 0,
    };
    paths.push(created);
    return structuredClone(created) as T;
  }

  // Seed Linux DevOps Path
  const seedMatch = pathname.match(/^\/learning-paths\/([^/]+)\/seed\/linux-devops$/);
  if (seedMatch && method === 'POST') {
    const targetPathId = seedMatch[1];
    const idx = paths.findIndex((p) => p.id === targetPathId);
    if (idx < 0) throw new Error('Learning path not found');

    const seededModules: ModuleItem[] = structuredClone(linuxModules).map((m) => ({ ...m, pathId: targetPathId }));
    const seededTopics: Topic[] = structuredClone(linuxTopics).map((t) => ({ ...t, pathId: targetPathId, status: 'not_started' as const, mastery: 0 as const }));

    paths[idx] = {
      ...paths[idx],
      modules: seededModules,
      topics: seededTopics,
      updatedAt: new Date().toISOString(),
      progressPercent: 0,
    };
    return structuredClone(paths[idx]) as T;
  }

  // Create Module in Path
  const moduleCreateMatch = pathname.match(/^\/learning-paths\/([^/]+)\/modules$/);
  if (moduleCreateMatch && method === 'POST') {
    const pathId = moduleCreateMatch[1];
    const pathItem = paths.find((p) => p.id === pathId);
    if (!pathItem) throw new Error('Learning path not found');

    const body = parseBody(options) as Partial<ModuleItem>;
    const newModule: ModuleItem = {
      id: id('mod'),
      pathId,
      title: body.title || 'New Module',
      description: body.description || '',
      order: (pathItem.modules?.length || 0) + 1,
    };

    if (!pathItem.modules) pathItem.modules = [];
    pathItem.modules.push(newModule);
    pathItem.updatedAt = new Date().toISOString();
    return structuredClone(newModule) as T;
  }

  // Create Topic in Path
  const topicCreateMatch = pathname.match(/^\/learning-paths\/([^/]+)\/topics$/);
  if (topicCreateMatch && method === 'POST') {
    const pathId = topicCreateMatch[1];
    const pathItem = paths.find((p) => p.id === pathId);
    if (!pathItem) throw new Error('Learning path not found');

    const body = parseBody(options) as Partial<Topic>;
    const targetModuleId = body.moduleId || (pathItem.modules?.[0]?.id ?? 'default-mod');

    const newTopic: Topic = {
      id: id('top'),
      pathId,
      moduleId: targetModuleId,
      title: body.title || 'New Topic',
      objective: body.objective || '',
      estimatedMinutes: Number(body.estimatedMinutes) || 45,
      order: (pathItem.topics?.filter((t) => t.moduleId === targetModuleId).length || 0) + 1,
      status: 'not_started',
      mastery: 0,
      resourceUrls: body.resourceUrls || [],
    };

    if (!pathItem.topics) pathItem.topics = [];
    pathItem.topics.push(newTopic);
    pathItem.updatedAt = new Date().toISOString();
    return structuredClone(newTopic) as T;
  }

  // Topic Patch (Status / Mastery update)
  const topicPatch = pathname.match(/^\/learning-paths\/([^/]+)\/topics\/([^/]+)$/);
  if (topicPatch && method === 'PATCH') {
    const pathItem = paths.find((p) => p.id === topicPatch[1]);
    const topic = pathItem?.topics?.find((t) => t.id === topicPatch[2]);
    if (!topic) throw new Error('Topic not found');

    Object.assign(topic, parseBody(options));
    if (pathItem) {
      pathItem.updatedAt = new Date().toISOString();
      pathItem.progressPercent = calculatePathProgress(pathItem);
    }
    return structuredClone(topic) as T;
  }

  // Single Path Detail (GET, PATCH, DELETE)
  const pathDetailMatch = pathname.match(/^\/learning-paths\/([^/]+)$/);
  if (pathDetailMatch) {
    const pathId = pathDetailMatch[1];
    const idx = paths.findIndex((p) => p.id === pathId);

    if (method === 'GET') {
      if (idx < 0) throw new Error('Learning path not found');
      const item = paths[idx];
      return {
        ...item,
        progressPercent: calculatePathProgress(item),
      } as T;
    }

    if (method === 'PATCH') {
      if (idx < 0) throw new Error('Learning path not found');
      const body = parseBody(options) as Partial<LearningPath>;
      paths[idx] = {
        ...paths[idx],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return structuredClone(paths[idx]) as T;
    }

    if (method === 'DELETE') {
      if (idx < 0) throw new Error('Learning path not found');
      paths.splice(idx, 1);
      return { success: true } as T;
    }
  }

  // Notes endpoints
  if (pathname === '/notes' && method === 'GET') {
    const pathId = url.searchParams.get('pathId');
    const topicId = url.searchParams.get('topicId');
    return structuredClone(
      notes.filter((n) => (!pathId || n.pathId === pathId) && (!topicId || n.topicId === topicId))
    ) as T;
  }
  if (pathname === '/notes' && method === 'POST') {
    const body = parseBody(options) as Partial<Note>;
    const created: Note = {
      id: id('note'),
      pathId: body.pathId || '',
      topicId: body.topicId || '',
      title: body.title || 'Topic Note',
      contentMarkdown: body.contentMarkdown || '',
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.push(created);
    return structuredClone(created) as T;
  }
  const notePatch = pathname.match(/^\/notes\/([^/]+)$/);
  if (notePatch && method === 'PATCH') {
    const note = notes.find((n) => n.id === notePatch[1]);
    if (!note) throw new Error('Note not found');
    Object.assign(note, parseBody(options), { updatedAt: new Date().toISOString() });
    return structuredClone(note) as T;
  }

  // Practice endpoints
  if (pathname === '/practice' && method === 'GET') {
    const pathId = url.searchParams.get('pathId');
    const topicId = url.searchParams.get('topicId');
    return structuredClone(
      tasks.filter((t) => (!pathId || t.pathId === pathId) && (!topicId || t.topicId === topicId))
    ) as T;
  }
  if (pathname === '/practice' && method === 'POST') {
    const body = parseBody(options) as Partial<PracticeTask>;
    const created: PracticeTask = {
      id: id('task'),
      pathId: body.pathId || '',
      topicId: body.topicId || '',
      title: body.title || 'Practice task',
      instructions: body.instructions || '',
      type: body.type || 'command',
      status: 'todo',
      evidence: '',
      updatedAt: new Date().toISOString(),
    };
    tasks.push(created);
    return structuredClone(created) as T;
  }
  const practicePatch = pathname.match(/^\/practice\/([^/]+)$/);
  if (practicePatch && method === 'PATCH') {
    const task = tasks.find((t) => t.id === practicePatch[1]);
    if (!task) throw new Error('Practice task not found');
    Object.assign(task, parseBody(options), { updatedAt: new Date().toISOString() });
    return structuredClone(task) as T;
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${path}`);
}
