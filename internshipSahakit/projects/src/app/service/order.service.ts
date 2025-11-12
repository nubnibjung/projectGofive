import { Injectable } from '@angular/core';
import { Order } from '../model/tableOrder';

const STORAGE_KEY = 'orders-data';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
 private data: Order[] = [];

  constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      this.data = JSON.parse(raw) as Order[];
    } else {
      // seed ครั้งแรก
      this.data = [
        { id: 2632, code: '#2632', name: 'Brooklyn Zoe',  avatar: 'https://i.pravatar.cc/40?img=12', address: '302 Snider Street, RUTLAND, VT, 05701', date: '2020-07-31', price: 64, status: 'Pending' },
        { id: 9633, code: '#9633', name: 'John McCormick',avatar: 'https://i.pravatar.cc/40?img=5',  address: '1096 Wiesman Street, CALMAR, IA, 52132', date: '2020-08-01', price: 35, status: 'Dispatch' },
        { id: 2634, code: '#2634', name: 'Sandra Pugh',   avatar: 'https://i.pravatar.cc/40?img=37', address: '1640 Thorn Street, SAUL CITY, GA, 98905', date: '2020-08-02', price: 74, status: 'Completed' },
        { id: 2689, code: '#2689', name: 'Vernie Hart',   avatar: 'https://i.pravatar.cc/40?img=48', address: '3898 Oak Drive, DOVER, DE, 19905', date: '2020-08-02', price: 82, status: 'Pending' },
        { id: 2956, code: '#2956', name: 'Mark Clark',    avatar: 'https://i.pravatar.cc/40?img=21', address: '1855 Augusta Park, NASSAU, NY, 12062', date: '2020-08-03', price: 39, status: 'Dispatch' },
        { id: 2637, code: '#2637', name: 'Rebekah Foster',avatar: 'https://i.pravatar.cc/40?img=14', address: '3445 Park Boulevard, BOLA, CA, 95086', date: '2020-08-03', price: 57, status: 'Pending' },
      ];
      this.persist();
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  list(): Order[] {
    return [...this.data];
  }

  getById(id: number): Order | undefined {
    return this.data.find(x => x.id === id);
  }

  update(updated: Order): void {
    const i = this.data.findIndex(x => x.id === updated.id);
    if (i !== -1) {
      this.data[i] = { ...updated };
      this.persist();
    }
  }

  add(newOrder: Order): void {
    this.data.push({ ...newOrder });
    this.persist();
  }

  delete(id: number): void {
    this.data = this.data.filter(x => x.id !== id);
    this.persist();
  }
}