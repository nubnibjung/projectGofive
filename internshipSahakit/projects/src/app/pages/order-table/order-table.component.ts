import { Component, computed, signal, effect, inject } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Order, OrderStatus } from '../../model/tableOrder';
import { OrderService } from '../../service/order.service';
import { FormsModule } from '@angular/forms';

type Tab = 'All' | OrderStatus;
type SortKey = 'code' | 'name' | 'address' | 'date' | 'price' | 'status';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './order-table.component.html',
  styleUrl: './order-table.component.css'
})
export class OrderTableComponent {
 // data
  private readonly svc = inject(OrderService);
  readonly allOrders = signal<Order[]>(this.svc.list());

  // filters
  readonly activeRowId = signal<number>(9633);
  readonly tab = signal<Tab>('All');
  readonly q = signal('');
  readonly dateFrom = signal<string>('2020-07-31');
  readonly dateTo   = signal<string>('2020-08-03');

  // sort
  readonly sortKey = signal<SortKey>('code');
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  // modal edit state
  readonly editOpen   = signal(false);
  readonly editId     = signal<number | null>(null);
  readonly editCode   = signal('');
  readonly editName   = signal('');
  readonly editAddress= signal('');
  readonly editDate   = signal('');       // yyyy-MM-dd
  readonly editPrice  = signal(0);
  readonly editStatus = signal<OrderStatus>('Pending');

   constructor() {
    effect(() => { this.filtered(); this.page.set(1); });
  }

  // ---------- Sorting ----------
  setSort(key: SortKey) {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }
  private valueOf(o: Order, key: SortKey): string | number {
    switch (key) {
      case 'price': return o.price;
      case 'date':  return new Date(o.date).getTime();
      default:      return (o as any)[key] ?? '';
    }
  }

  // ---------- Filters + derive ----------
  readonly filtered = computed(() => {
    const q = this.q().trim().toLowerCase();
    const tab = this.tab();
    const from = this.dateFrom() ? new Date(this.dateFrom()) : null;
    const to   = this.dateTo()   ? new Date(this.dateTo())   : null;

    return this.allOrders().filter(o => {
      const okTab  = tab === 'All' ? true : o.status === tab;
      const okQ    = !q || o.name.toLowerCase().includes(q)
                       || o.code.toLowerCase().includes(q)
                       || o.address.toLowerCase().includes(q);
      const d = new Date(o.date);
      const okDate = (!from || d >= from) && (!to || d <= to);
      return okTab && okQ && okDate;
    });
  });

  readonly sorted = computed(() => {
    const arr = [...this.filtered()];
    const key = this.sortKey();
    const dir = this.sortDir();
    arr.sort((a, b) => {
      const va = this.valueOf(a, key);
      const vb = this.valueOf(b, key);
      const cmp = (typeof va === 'number' && typeof vb === 'number')
        ? va - vb
        : String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
    return arr;
  });

  // ---------- Paging ----------
  readonly page = signal(1);
  readonly pageSize = 6;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly pageItems = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });
  prev() { this.page.update(p => Math.max(1, p - 1)); }
  next() { this.page.update(p => Math.min(this.totalPages(), p + 1)); }
  goto(p: number) { this.page.set(Math.min(Math.max(1, p), this.totalPages())); }

  setTab(t: Tab) { this.tab.set(t); }
  clear() { this.q.set(''); this.tab.set('All'); this.dateFrom.set(''); this.dateTo.set(''); }

  statusClass(s: OrderStatus) {
    return {
      'text-emerald-700 border-emerald-200 bg-emerald-50': s === 'Dispatch',
      'text-amber-800 border-amber-200 bg-amber-50': s === 'Pending',
      'text-slate-600 border-slate-200 bg-slate-50': s === 'Completed',
    };
  }

  readonly startIndex = computed(() => (this.page() - 1) * this.pageSize + 1);
  readonly endIndex   = computed(() => Math.min(this.page() * this.pageSize, this.filtered().length));

  // ---------- Edit Modal ----------
  onEdit(o: Order) {
    this.editId.set(o.id);
    this.editCode.set(o.code);
    this.editName.set(o.name);
    this.editAddress.set(o.address);
    this.editDate.set(o.date);         // yyyy-MM-dd
    this.editPrice.set(o.price);
    this.editStatus.set(o.status);
    this.editOpen.set(true);
  }

  onCancelEdit() {
    this.editOpen.set(false);
  }

  onSaveEdit() {
    const id = this.editId();
    if (id == null) return;

    // validation ง่าย ๆ
    if (!this.editName().trim()) return;
    if (!this.editAddress().trim()) return;
    if (!this.editDate()) return;

    const original = this.svc.getById(id);
    const updated: Order = {
      id,
      code: this.editCode(), // ไม่ให้แก้ code ก็ได้
      name: this.editName().trim(),
      address: this.editAddress().trim(),
      date: this.editDate(),                // 'yyyy-MM-dd'
      price: Number(this.editPrice()),
      status: this.editStatus(),
      avatar: original?.avatar ?? 'https://i.pravatar.cc/40?img=1'
    };

    this.svc.update(updated);          // <-- บันทึกจริงลง localStorage
    this.allOrders.set(this.svc.list()); // รีโหลดรายการ
    this.editOpen.set(false);
  }
}