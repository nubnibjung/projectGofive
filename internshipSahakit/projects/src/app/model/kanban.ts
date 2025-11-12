export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface TaskCard {
  id: number;
  title: string;
  description: string;
  tags: string[];
  status: TaskStatus;
  category?: string;
  time?: string;
  comments?: number;
  attachments?: number;
  people?: string[];
  progress?: number;        // จำนวนจุด (0–12)
  progressPercent?: number; // ตัวเลข %
  note?: string;            // ข้อความ Note เล็ก ๆ

  bg: string;               // gradient ของการ์ด
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
}
