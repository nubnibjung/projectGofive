import { computed, Injectable, signal } from '@angular/core';
import { BoardColumn, TaskCard, TaskStatus } from '../model/kanban';

const STORAGE_KEY = 'kanban-tasks-v1';

@Injectable({
  providedIn: 'root'
})
export class TaskBoardService {
 private readonly _columns = signal<BoardColumn[]>([
    { id: 'todo',        title: 'Todo list' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review',      title: 'In Review' },
    { id: 'done',        title: 'Done' },
  ]);

  private readonly _tasks = signal<TaskCard[]>([]);
  readonly columns = this._columns.asReadonly();
  readonly tasks = this._tasks.asReadonly();
  readonly totalTasks = computed(() => this._tasks().length);

  constructor() {
    this.loadFromStorage();
  }

  // ---------- storage ----------
  private saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._tasks()));
  }

  private loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      this._tasks.set(JSON.parse(raw) as TaskCard[]);
    } else {
      this._tasks.set(this.seedData());
      this.saveToStorage();
    }
  }

  private seedData(): TaskCard[] {
    return [
      {
        id: 1,
        title: 'Search inspirations for upcoming project',
        description: 'Search inspirations for new finance product Mino project.',
        tags: ['#website', '#client'],
        status: 'todo',
        time: 'Progress',
        comments: 12,
        attachments: 8,
        people: ['BS', 'AJ', 'LK'],
        progress: 4,
        progressPercent: 40,
        note: '',
        bg: 'from-sky-100 to-indigo-100',
      },
      {
        id: 2,
        title: 'Ginko mobile app design',
        description: 'Create user flow • Create wireframe • Design onboarding screens',
        tags: ['#mobile app', '#client'],
        status: 'todo',
        time: 'Note: We have a meeting 2:15 AM',
        comments: 7,
        attachments: 2,
        people: ['BS', 'MJ'],
        progress: 6,
        progressPercent: 60,
        bg: 'from-violet-100 to-purple-100',
      },
      {
        id: 3,
        title: 'Weihu product task and the task process pages',
        description: 'Have to finish this before weekend.',
        tags: ['#website detail', '#product'],
        status: 'in-progress',
        time: '',
        comments: 9,
        attachments: 4,
        people: ['BS', 'AJ', 'LK', 'MJ'],
        progress: 9,
        progressPercent: 90,
        bg: 'from-amber-100 to-orange-100',
      },
      {
        id: 4,
        title: 'Design CRM shop product page responsive website',
        description: '',
        tags: ['#webtool', '#client'],
        status: 'in-progress',
        time: '',
        comments: 6,
        attachments: 3,
        people: ['BS'],
        progress: 4,
        progressPercent: 40,
        bg: 'from-emerald-100 to-green-100',
      },
      {
        id: 5,
        title: 'Crypto product landing page create in webflow',
        description: '',
        tags: ['#development', '#client'],
        status: 'review',
        time: '',
        comments: 10,
        attachments: 2,
        people: ['AJ', 'MJ'],
        progress: 7,
        progressPercent: 70,
        bg: 'from-pink-100 to-fuchsia-100',
      },
      {
        id: 6,
        title: 'Natvrek video platform web app design and develop',
        description: '',
        tags: ['#product', '#client'],
        status: 'review',
        time: '',
        comments: 5,
        attachments: 1,
        people: ['BS'],
        progress: 5,
        progressPercent: 50,
        bg: 'from-sky-100 to-indigo-100',
      },
      {
        id: 7,
        title: 'Affiliate product full service',
        description: 'Branding • Landing page design & development • Marketing',
        tags: ['#mobile app', '#client'],
        status: 'done',
        time: '',
        comments: 8,
        attachments: 2,
        people: ['BS', 'LK'],
        progress: 12,
        progressPercent: 100,
        bg: 'from-cyan-100 to-sky-100',
      },
      {
        id: 8,
        title: 'Design Moll app product page redesign',
        description: '',
        tags: ['#product', '#client'],
        status: 'done',
        time: '',
        comments: 12,
        attachments: 3,
        people: ['MJ'],
        progress: 12,
        progressPercent: 100,
        bg: 'from-rose-100 to-orange-100',
      },
    ];
  }
private formatCreatedTime(date = new Date()): string {
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isSameDay) {
    return `Today · ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${dateStr} · ${timeStr}`;
}

  // ---------- queries ----------
  getTasksByStatus(status: TaskStatus) {
    return this._tasks().filter(t => t.status === status);
  }

  // ---------- commands ----------
addTask(status: TaskStatus, title: string, description: string) {
  const created = new Date();

  const newTask: TaskCard = {
    id: Date.now(),
    title,
    description,
    tags: ['#new'],
    status,
    progressPercent: 0,
    comments: 0,
    attachments: 0,
    people: ['BS'],
    time: this.formatCreatedTime(created),   // 👈 ใช้เวลาที่สร้าง
    bg: this.statusToBg(status),
  };

  this._tasks.update(list => [...list, newTask]);
  this.saveToStorage();
}

  editTaskFull(taskId: number, updated: Partial<TaskCard>) {
  this._tasks.update(list =>
    list.map(t => {
      if (t.id !== taskId) return t;

      const merged: TaskCard = { ...t, ...updated };

      // ถ้ามีการเปลี่ยน status ให้เปลี่ยนสี bg ตามคอลัมน์ใหม่ด้วย
      if (updated.status) {
        merged.bg = this.statusToBg(updated.status);
      }

      return merged;
    }),
  );
  this.saveToStorage();
}


  deleteTask(taskId: number) {
    this._tasks.update(list => list.filter(t => t.id !== taskId));
    this.saveToStorage();
  }

  moveTask(taskId: number, newStatus: TaskStatus) {
    this._tasks.update(list =>
      list.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, bg: this.statusToBg(newStatus) }
          : t,
      ),
    );
    this.saveToStorage();
  }

  private statusToBg(status: TaskStatus): string {
    switch (status) {
      case 'todo':
        return 'from-sky-100 to-indigo-100';
      case 'in-progress':
        return 'from-amber-100 to-orange-100';
      case 'review':
        return 'from-pink-100 to-fuchsia-100';
      case 'done':
        return 'from-emerald-100 to-teal-100';
      default:
        return 'from-slate-100 to-slate-200';
    }
  }
    updateTaskMeta(
    taskId: number,
    meta: { progress?: number; progressPercent?: number; tags?: string[] }
  ) {
    this._tasks.update(list =>
      list.map(t =>
        t.id === taskId
          ? { ...t, ...meta }
          : t
      )
    );
    this.saveToStorage();
  }

}