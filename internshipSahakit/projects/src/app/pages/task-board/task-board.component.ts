import { Component, computed, inject } from '@angular/core';
import { TaskBoardService } from '../../service/task-board.service';
import { TaskCard, TaskStatus } from '../../model/kanban';
import Swal from 'sweetalert2';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css'
})
export class TaskBoardComponent {
  private readonly svc = inject(TaskBoardService);
  readonly columns = this.svc.columns;
  readonly totalTasks = this.svc.totalTasks;

  // ใช้ทำ progress dots 12 จุด
  readonly progressDots = Array.from({ length: 12 });

  getTasks(col: TaskStatus) {
    return this.svc.getTasksByStatus(col);
  }

  /** ปุ่ม + ในแต่ละคอลัมน์ */
  async onAddTask(col: TaskStatus) {
    const { value: formValues } = await Swal.fire({
      title: 'Create task',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Description"></textarea>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const desc = (document.getElementById('swal-desc') as HTMLTextAreaElement).value;
        if (!title) return Swal.showValidationMessage('Title is required');
        return { title, desc };
      },
      confirmButtonText: 'Save',
      showCancelButton: true,
    });

    if (formValues) {
      this.svc.addTask(col, formValues.title, formValues.desc);
      Swal.fire('Added!', 'Task created successfully.', 'success');
    }
  }

  /** ปุ่ม Create task ด้านขวาบน */
  onCreateTaskMain() {
    // ให้ไปเพิ่มในคอลัมน์ Todo list เป็น default
    this.onAddTask('todo');
  }

  /** ดับเบิลคลิก / คลิกที่การ์ดเพื่อแก้ข้อมูล */
  async onEditTask(task: TaskCard) {
  const { value: form } = await Swal.fire({
    title: 'Edit Task',
    html: `
      <div style="text-align:left">
        <label style="font-size:12px;color:#555;">Title</label>
        <input id="t-title" class="swal2-input" value="${task.title}">
        
        <label style="font-size:12px;color:#555;">Description</label>
        <textarea id="t-desc" class="swal2-textarea">${task.description}</textarea>
        
        <label style="font-size:12px;color:#555;">Tags (comma separated)</label>
        <input id="t-tags" class="swal2-input" value="${task.tags.join(', ')}">
        
        <label style="font-size:12px;color:#555;">Progress (%)</label>
        <input id="t-prog" type="number" class="swal2-input" value="${task.progressPercent || 0}">
        
        <label style="font-size:12px;color:#555;">Status</label>
        <select id="t-status" class="swal2-select">
          <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Todo / New</option>
          <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="review" ${task.status === 'review' ? 'selected' : ''}>In Review</option>
          <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
      </div>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const title = (document.getElementById('t-title') as HTMLInputElement).value.trim();
      const desc  = (document.getElementById('t-desc') as HTMLTextAreaElement).value.trim();
      const tagsRaw = (document.getElementById('t-tags') as HTMLInputElement).value.trim();
      const prog = Number((document.getElementById('t-prog') as HTMLInputElement).value);
      const statusValue = (document.getElementById('t-status') as HTMLSelectElement).value as TaskStatus;
      const time = (document.getElementById('t-time') as HTMLInputElement).value.trim();

      if (!title) return Swal.showValidationMessage('Title required');

      return {
        title,
        description: desc,
        tags: tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [],
        progressPercent: Math.min(Math.max(prog, 0), 100),
        status: statusValue,
      } as Partial<TaskCard>;
    },
    confirmButtonText: 'Save changes',
    showCancelButton: true,
  });

  if (form) {
    this.svc.editTaskFull(task.id, form);
    Swal.fire('Saved!', 'Task updated successfully.', 'success');
  }
}

  async onAdjustTaskMeta(task: TaskCard, event: MouseEvent) {
    event.stopPropagation(); // กันไม่ให้ไปเปิด popup edit title/description

    const currentPercent = task.progressPercent ?? 0;
    const tagsString = task.tags?.join(', ') ?? '';

    const { value: formValues } = await Swal.fire({
      title: 'ปรับ Progress / ประเภทงาน',
      html: `
        <div style="text-align:left; font-size:12px; margin-bottom:4px;">Progress (%)</div>
        <input id="swal-progress" type="range" min="0" max="100" step="10"
               class="swal2-range" value="${currentPercent}">
        <div style="text-align:left; font-size:12px; margin-top:10px;">ประเภทงาน (คั่นด้วย , )</div>
        <input id="swal-tags" class="swal2-input" placeholder="#website, #client" value="${tagsString}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const progressInput = document.getElementById('swal-progress') as HTMLInputElement;
        const tagsInput = document.getElementById('swal-tags') as HTMLInputElement;

        const percent = Number(progressInput.value) || 0;

        const tags =
          tagsInput.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // แปลง % เป็นจำนวนจุด (0–12)
        const progressDots = Math.round((percent / 100) * 12);

        return {
          progressPercent: percent,
          progress: progressDots,
          tags,
        };
      },
      confirmButtonText: 'Save',
      showCancelButton: true,
    });

    if (formValues) {
      this.svc.updateTaskMeta(task.id, formValues);
      Swal.fire('Updated!', 'Progress & ประเภทงานถูกแก้ไขแล้ว.', 'success');
    }
  }

  /** ปุ่มลบการ์ด */
  async onDeleteTask(task: TaskCard, event: MouseEvent) {
    event.stopPropagation(); // กันไม่ให้ไป trigger onEditTask

    const confirm = await Swal.fire({
      title: 'Delete task?',
      text: `Do you want to delete "${task.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });

    if (confirm.isConfirmed) {
      this.svc.deleteTask(task.id);
      Swal.fire('Deleted!', '', 'success');
    }
  }

  /** ปุ่มเมนู sidebar / header ทั่วไป */
  onNav(section: string) {
    Swal.fire({
      title: section,
      text: `You clicked "${section}". You can hook router / feature here.`,
      icon: 'info',
    });
  }

  onFilterClick() {
    Swal.fire({
      title: 'Filters',
      text: 'Open filter panel here.',
      icon: 'info',
    });
  }

  onNotificationClick() {
    Swal.fire({
      title: 'Notifications',
      text: 'Show notifications panel here.',
      icon: 'info',
    });
  }

  onSettingsClick() {
    Swal.fire({
      title: 'Settings',
      text: 'Open settings screen here.',
      icon: 'info',
    });
  }

  onSearchShortcut() {
    Swal.fire({
      title: 'Search',
      text: 'Implement global search here.',
      icon: 'info',
    });
  }
}