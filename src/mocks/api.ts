import type { LearningPath, MasteryLevel, ModuleItem, Note, PracticeTask, ReviewItem, Topic } from '../types';

let paths: LearningPath[] = [];
const notes: Note[] = [
  {
    id: 'note-1',
    pathId: 'linux-devops',
    topicId: 't-linux-1',
    title: 'Linux Architecture & Subsystems',
    tags: ['kernel', 'syscalls', 'architecture'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    contentMarkdown: `# Linux architecture

## Why this matters
Understanding the boundary between kernel space and user space allows engineers to troubleshoot system bottlenecks, unexpected kernel panics, and permission errors during production incidents.

## Mental model
User space applications execute in unprivileged Ring 3, communicating through POSIX system calls (syscalls) with the Linux Kernel running in privileged Ring 0, which directly orchestrates memory, CPU schedules, and hardware devices.

## Key concepts
- **Ring 0 vs Ring 3**: Hardware-enforced isolation preventing direct user process access to raw physical RAM and hardware registers.
- **Syscall Dispatch**: Software trap (e.g. \`int 0x80\` or \`syscall\` instruction) transitioning CPU into kernel mode.
- **VFS (Virtual File System)**: Abstract file layer presenting unified directory interface for ext4, procfs, sysfs, and pipe devices.

## Commands / syntax
\`\`\`bash
# Inspect running kernel version and build flags
uname -r -v

# Trace system calls invoked by a program
strace -c -f -e trace=openat,read,write ls -la

# Inspect kernel ring buffer and filter boot / hardware errors
dmesg -T --level=err,warn
\`\`\`

## Worked example
Investigating why an application cannot bind to port 80:
\`\`\`bash
strace -e bind ./my-app
# Output: bind(3, {sa_family=AF_INET, sin_port=htons(80)...}) = -1 EACCES (Permission denied)
# Conclusion: Non-root user space process cannot bind privileged ports (<1024) without CAP_NET_BIND_SERVICE.
\`\`\`

## Pitfalls / debugging
- Context switch overhead when calling excessive synchronous syscalls in tight loops.
- Blocking on disk I/O in the kernel while holding userland locks.

## Practice I completed
- [x] Trace \`cat /etc/os-release\` using \`strace\` and list file descriptors opened.
- [x] Inspect sysfs tunables under \`/proc/sys/kernel/\`.

## Recall questions
- Q: What hardware CPU privilege ring does user-space code run in?
  A: Ring 3.
- Q: How does user space safely request kernel services?
  A: Via system calls (syscalls) handled by kernel interrupt/trap tables.

## 5-line summary
1. The Linux kernel runs in privileged Ring 0 controlling hardware, memory, and task scheduling.
2. User applications run in Ring 3 and invoke syscalls to read files, open sockets, or allocate memory.
3. VFS provides a unified abstraction treating block storage, network sockets, and pseudo-files uniformly.
4. \`strace\` exposes runtime syscall transitions between user and kernel space.
5. Production troubleshooting requires distinguishing user space application bugs from kernel resource exhaustion.`,
  },
  {
    id: 'note-2',
    pathId: 'linux-devops',
    topicId: 't-linux-2',
    title: 'Filesystem Hierarchy & FHS Principles',
    tags: ['filesystem', 'fhs', 'storage'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    contentMarkdown: `# Filesystem hierarchy

## Why this matters
Knowing where configuration files, persistent data, ephemeral runtimes, and kernel control knobs live prevents catastrophic accidental deletions and speeds up server setup automation.

## Mental model
A single root inverted tree (\`/\`) where storage devices, memory pseudo-filesystems (\`/proc\`, \`/sys\`), and temporary mount points are attached seamlessly.

## Key concepts
- \`/etc\`: Host-specific static configuration files.
- \`/var\`: Variable data files (logs, databases, spool).
- \`/proc\`: Virtual filesystem exposing live kernel and process metrics.
- \`/sys\`: Hardware and device driver control tree.

## Commands / syntax
\`\`\`bash
# Inspect filesystem disk usage and mount points
df -hT

# Check inode usage
df -i

# Inspect disk space consumed by top-level directories
du -sh /* 2>/dev/null | sort -hr | head -n 10
\`\`\`

## Worked example
Finding which directory exhausted disk space:
\`\`\`bash
ncdu -x /
# Drill down into /var/log to find unrotated service logs.
\`\`\`

## Pitfalls / debugging
- Running out of disk inodes while free megabytes still exist.
- Writing ephemeral container caches to the root partition instead of \`/tmp\` or dedicated volume.

## Practice I completed
- [x] Mount and unmount loopback test image.
- [x] Inspect \`/proc/cpuinfo\` and \`/proc/meminfo\`.

## Recall questions
- Q: Where do process-specific runtime metrics live in Linux?
  A: In \`/proc/[pid]/\`.

## 5-line summary
1. The Linux Filesystem Hierarchy Standard organizes files by function and persistence.
2. \`/etc\` contains configuration while \`/var\` contains variable application states and logs.
3. \`/proc\` and \`/sys\` are RAM-backed pseudo-filesystems exposing kernel internals.
4. \`df -hT\` and \`du -sh\` provide rapid disk space diagnostics.
5. Inode exhaustion can block file creation even when disk blocks remain free.`,
  },
];

const tasks: PracticeTask[] = [
  {
    id: 'task-1',
    pathId: 'linux-devops',
    topicId: 't-linux-1',
    title: 'Trace syscalls of process startup with strace',
    instructions: 'Run `strace -c ls /var/log` to profile syscall counts and identify the most frequent calls.',
    type: 'command',
    status: 'done',
    evidence: `% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 38.45    0.000125           8        15           close
 22.15    0.000072           7        10           mprotect
 14.77    0.000048           4        12           openat
  8.92    0.000029           9         3           getdents64
------ ----------- ----------- --------- --------- ----------------
100.00    0.000325                    78         1 total`,
    verificationCriteria: 'strace execution completes with summary breakdown of syscall counts and zero crashes.',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-2',
    pathId: 'linux-devops',
    topicId: 't-linux-1',
    title: 'Inspect kernel boot parameters and dmesg ring buffer',
    instructions: 'Query the active kernel command line from `/proc/cmdline` and search `dmesg` for warning logs.',
    type: 'troubleshooting',
    status: 'done',
    evidence: `$ cat /proc/cmdline
BOOT_IMAGE=/vmlinuz-6.5.0-generic root=UUID=98a3f81e-12... ro quiet splash
$ dmesg -T --level=warn
[Tue Aug 18 10:12:00 2026] systemd[1]: Configuration file /etc/systemd/system/app.service is marked executable. Please remove executable bit.`,
    verificationCriteria: 'Commandline string printed and warnings analyzed.',
    updatedAt: new Date(Date.now() - 40000000).toISOString(),
  },
  {
    id: 'task-3',
    pathId: 'linux-devops',
    topicId: 't-linux-2',
    title: 'Diagnose and resolve inode exhaustion scenario',
    instructions: 'Simulate high inode utilization, diagnose with `df -i`, and locate directories with excessive small files.',
    type: 'lab',
    status: 'doing',
    evidence: `$ df -i /tmp
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
/dev/sda1       655360 655360       0  100% /tmp
No space left on device when attempting touch /tmp/test.txt`,
    verificationCriteria: 'Locate offending directory using find and clean orphaned files to restore IFree > 50%.',
    updatedAt: new Date(Date.now() - 20000000).toISOString(),
  },
  {
    id: 'task-4',
    pathId: 'linux-devops',
    topicId: 't-linux-3',
    title: 'Compose complex pipeline with xargs, grep, and awk',
    instructions: 'Construct a command line pipeline to parse `/var/log/auth.log` for failed SSH attempts and sort by IP address.',
    type: 'command',
    status: 'todo',
    evidence: '',
    verificationCriteria: 'Pipeline produces sorted list of IP addresses with failed attempt counts.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    pathId: 'linux-devops',
    topicId: 't-linux-4',
    title: 'Configure SGID directory for shared DevOps group collaboration',
    instructions: 'Create `/srv/shared`, assign group `devops`, enable SGID bit, and verify new files inherit group ownership.',
    type: 'configuration',
    status: 'todo',
    evidence: '',
    verificationCriteria: 'ls -ld /srv/shared shows drwxrws--- and newly created files have group devops.',
    updatedAt: new Date().toISOString(),
  },
];
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
    const q = url.searchParams.get('q')?.toLowerCase();
    const tag = url.searchParams.get('tag')?.toLowerCase();

    return structuredClone(
      notes.filter((n) => {
        if (pathId && n.pathId !== pathId) return false;
        if (topicId && n.topicId !== topicId) return false;
        if (tag && !n.tags.some((t) => t.toLowerCase() === tag)) return false;
        if (q) {
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.contentMarkdown.toLowerCase().includes(q);
          const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTag) return false;
        }
        return true;
      })
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
  const singleNoteMatch = pathname.match(/^\/notes\/([^/]+)$/);
  if (singleNoteMatch) {
    const noteId = singleNoteMatch[1];
    const idx = notes.findIndex((n) => n.id === noteId);

    if (method === 'GET') {
      if (idx < 0) throw new Error('Note not found');
      return structuredClone(notes[idx]) as T;
    }
    if (method === 'PATCH') {
      if (idx < 0) throw new Error('Note not found');
      Object.assign(notes[idx], parseBody(options), { updatedAt: new Date().toISOString() });
      return structuredClone(notes[idx]) as T;
    }
    if (method === 'DELETE') {
      if (idx < 0) throw new Error('Note not found');
      notes.splice(idx, 1);
      return { success: true } as T;
    }
  }

  // Practice endpoints
  if (pathname === '/practice' && method === 'GET') {
    const pathId = url.searchParams.get('pathId');
    const topicId = url.searchParams.get('topicId');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const q = url.searchParams.get('q')?.toLowerCase();

    return structuredClone(
      tasks.filter((t) => {
        if (pathId && t.pathId !== pathId) return false;
        if (topicId && t.topicId !== topicId) return false;
        if (status && status !== 'all' && t.status !== status) return false;
        if (type && type !== 'all' && t.type !== type) return false;
        if (q) {
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchInstr = t.instructions.toLowerCase().includes(q);
          if (!matchTitle && !matchInstr) return false;
        }
        return true;
      })
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
      status: body.status || 'todo',
      evidence: body.evidence || '',
      verificationCriteria: body.verificationCriteria || '',
      updatedAt: new Date().toISOString(),
    };
    tasks.push(created);
    return structuredClone(created) as T;
  }
  const singlePracticeMatch = pathname.match(/^\/practice\/([^/]+)$/);
  if (singlePracticeMatch) {
    const taskId = singlePracticeMatch[1];
    const idx = tasks.findIndex((t) => t.id === taskId);

    if (method === 'GET') {
      if (idx < 0) throw new Error('Practice task not found');
      return structuredClone(tasks[idx]) as T;
    }
    if (method === 'PATCH') {
      if (idx < 0) throw new Error('Practice task not found');
      Object.assign(tasks[idx], parseBody(options), { updatedAt: new Date().toISOString() });
      return structuredClone(tasks[idx]) as T;
    }
    if (method === 'DELETE') {
      if (idx < 0) throw new Error('Practice task not found');
      tasks.splice(idx, 1);
      return { success: true } as T;
    }
  }

  // Review Endpoints (Phase 5)
  if (pathname === '/review/queue' && method === 'GET') {
    const queue: ReviewItem[] = [];

    paths.forEach((p) => {
      p.topics?.forEach((t) => {
        // Collect recall questions from associated note if any
        const associatedNote = notes.find((n) => n.topicId === t.id);
        const questions: { id: string; question: string; suggestedAnswer: string }[] = [];

        if (associatedNote) {
          // Extract Q&A from note
          const lines = associatedNote.contentMarkdown.split('\n');
          let currentQ = '';
          lines.forEach((line) => {
            if (line.startsWith('- Q: ')) {
              currentQ = line.replace('- Q: ', '').trim();
            } else if (line.startsWith('  A: ') && currentQ) {
              const ans = line.replace('  A: ', '').trim();
              questions.push({
                id: id('rq'),
                question: currentQ,
                suggestedAnswer: ans,
              });
              currentQ = '';
            }
          });
        }

        // Fallback default recall question from objective
        if (questions.length === 0) {
          questions.push({
            id: id('rq'),
            question: `Explain and demonstrate the target outcome: "${t.objective}"`,
            suggestedAnswer: `Execute the commands and verify understanding unaided for "${t.title}".`,
          });
        }

        queue.push({
          topicId: t.id,
          pathId: p.id,
          topicTitle: t.title,
          pathTitle: p.title,
          currentMastery: t.mastery,
          lastReviewedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          nextReviewDue: new Date().toISOString(),
          recallQuestions: questions,
        });
      });
    });

    return structuredClone(queue) as T;
  }

  if (pathname === '/review/submit' && method === 'POST') {
    const body = parseBody(options) as {
      topicId: string;
      rating: 'again' | 'hard' | 'good' | 'easy';
    };

    let updatedMastery: MasteryLevel = 3;

    // Find and update target topic
    for (const p of paths) {
      const topic = p.topics?.find((t) => t.id === body.topicId);
      if (topic) {
        if (body.rating === 'again') {
          topic.mastery = Math.max(1, topic.mastery - 1) as MasteryLevel;
          topic.status = 'learning';
        } else if (body.rating === 'hard') {
          // Mastery unchanged
        } else if (body.rating === 'good') {
          topic.mastery = Math.min(5, topic.mastery + 1) as MasteryLevel;
          if (topic.mastery >= 4) topic.status = 'mastered';
        } else if (body.rating === 'easy') {
          topic.mastery = 5 as MasteryLevel;
          topic.status = 'mastered';
        }
        updatedMastery = topic.mastery;
        p.updatedAt = new Date().toISOString();
        p.progressPercent = calculatePathProgress(p);
        break;
      }
    }

    return {
      success: true,
      updatedMastery,
      nextReviewDays: body.rating === 'again' ? 1 : body.rating === 'hard' ? 2 : body.rating === 'good' ? 7 : 21,
    } as T;
  }

  // Global Cross-Entity Search Endpoint
  if (pathname === '/search' && method === 'GET') {
    const q = url.searchParams.get('q')?.toLowerCase().trim() || '';

    if (!q) {
      return {
        paths: [],
        topics: [],
        notes: [],
        practiceTasks: [],
      } as T;
    }

    const matchedPaths = paths.filter(
      (p) => p.title.toLowerCase().includes(q) || p.goal.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    const matchedTopics: Topic[] = [];
    paths.forEach((p) => {
      p.topics?.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || t.objective.toLowerCase().includes(q)) {
          matchedTopics.push(t);
        }
      });
    });

    const matchedNotes = notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.contentMarkdown.toLowerCase().includes(q) || n.tags?.some((t) => t.toLowerCase().includes(q))
    );

    const matchedTasks = tasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.instructions.toLowerCase().includes(q) || t.evidence.toLowerCase().includes(q)
    );

    return {
      paths: structuredClone(matchedPaths),
      topics: structuredClone(matchedTopics),
      notes: structuredClone(matchedNotes),
      practiceTasks: structuredClone(matchedTasks),
    } as T;
  }

  // Mastery Analytics Endpoint
  if (pathname === '/analytics' && method === 'GET') {
    let totalTopics = 0;
    const masteryDist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    paths.forEach((p) => {
      p.topics?.forEach((t) => {
        totalTopics++;
        masteryDist[t.mastery] = (masteryDist[t.mastery] || 0) + 1;
      });
    });

    const masteredCount = (masteryDist[4] || 0) + (masteryDist[5] || 0);
    const retentionRate = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

    return {
      totalPaths: paths.length,
      totalTopics,
      masteryDist,
      retentionRate,
      totalNotes: notes.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'done').length,
    } as T;
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${path}`);
}
