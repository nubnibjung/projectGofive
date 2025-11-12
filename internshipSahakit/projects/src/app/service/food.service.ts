import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Food } from '../model/burger';

const LS_FOODS = 'burger_foods';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
/** state หลัก: เริ่มจาก localStorage (ถ้าไม่มี ใช้ MOCK_FOODS) */
  private readonly _foods = signal<Food[]>(safeLoad(LS_FOODS, MOCK_FOODS));

  /** อ่านทั้งหมด */
  readonly foods = computed(() => this._foods());

  /** หมวดหมู่ */
  readonly categories = computed(() => {
    const set = new Set(this._foods().map(f => f.category));
    return Array.from(set);
  });

  /** persist อัตโนมัติทุกครั้งที่ foods เปลี่ยน */
  private _persist = effect(() => {
    localStorage.setItem(LS_FOODS, JSON.stringify(this._foods()));
  });

  /** ฟิลเตอร์ */
  filterFoods(query = '', category?: string): Food[] {
    const q = query.trim().toLowerCase();
    return this._foods().filter(f =>
      (!category || f.category === category) &&
      (!q || f.name.toLowerCase().includes(q))
    );
  }

  /** เพิ่ม/แก้ (ไม่มี id หรือ id=0 → gen id ใหม่) */
  upsert(food: Food) {
    this._foods.update(list => {
      if (!food.id || food.id === 0) {
        const nextId = (list.length ? Math.max(...list.map(x => x.id)) : 0) + 1;
        return [...list, { ...food, id: nextId }];
      }
      const exists = list.some(x => x.id === food.id);
      return exists
        ? list.map(x => (x.id === food.id ? { ...x, ...food } : x))
        : [...list, food];
    });
  }

  /** ลบ */
  remove(id: number) {
    this._foods.update(list => list.filter(x => x.id !== id));
  }

  /** ล้างทั้งหมด */
  clearAll() { this._foods.set([]); }

  /** รีเซ็ตกลับ mock */
  resetToMock() { this._foods.set(MOCK_FOODS); }
}

/* ---------- Utils ---------- */
function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

const MOCK_FOODS: Food[] = [
  { id: 1, name: 'Vegetable Burger',   price: 25, oldPrice: 28.3, rating: 2.5, img: '/burger/Burgers-1.png', category: 'Burger' },
  { id: 2, name: 'Meat Burger',        price: 28, oldPrice: 30,   rating: 2.5, img: '/burger/Burgers-2.png', category: 'Burger' },
  { id: 3, name: 'Cheese Burger',      price: 32, oldPrice: 33,   rating: 2.5, img: '/burger/Burgers-3.png', category: 'Burger' },
  { id: 4, name: 'Vegetable Burger',   price: 15, oldPrice: 18,   rating: 2.5, img: '/burger/Burgers-4.png', category: 'Burger' },
  { id: 5, name: 'Bean Burger',        price: 18, oldPrice: 20,   rating: 2.5, img: '/burger/Burgers-5.png', category: 'Burger' },
  { id: 6, name: 'Wild Salmon Burger', price: 40, oldPrice: 42,   rating: 2.5, img: '/burger/Burgers-6.png', category: 'Burger' },
  { id: 7, name: 'Donut Choco',        price:  6,                 rating: 4.3, img: '/donut/donut-1.png', category: 'Donuts' },
  { id: 8, name: 'Donut Almon',        price:  12,                 rating: 4.3, img: '/donut/donut-2.png', category: 'Donuts' },
  { id: 9, name: 'Donut Strawberry',        price:  8,                 rating: 4.3, img: '/donut/donut-3.png', category: 'Donuts' },
  { id: 10, name: 'Donut White Chocolate',        price:  10,                 rating: 4.3, img: '/donut/donut-4.png', category: 'Donuts' },
  { id: 11, name: 'Donut Matcha',        price:  11,                 rating: 4.3, img: '/donut/donut-5.png', category: 'Donuts' },
  { id: 12, name: 'Donut Mushmellow',        price:  23,                 rating: 4.3, img: '/donut/donut-6.png', category: 'Donuts' },
  { id: 13, name: 'Hot Dog Grill Master',    price: 12,                 rating: 3.8, img: '/hotdog/hotdog-1.png', category: 'Hot dog' },
  { id: 14, name: 'Hot Dog Honey Smoke ',    price: 24,                 rating: 3.8, img: '/hotdog/hotdog-2.png', category: 'Hot dog' },
  { id: 15, name: 'Hot Dog Classic Bite',    price: 27,                 rating: 3.8, img: '/hotdog/hotdog-3.png', category: 'Hot dog' },
  { id: 16, name: 'Hot Dog Street Pup',    price: 30,                 rating: 3.8, img: '/hotdog/hotdog-4.png', category: 'Hot dog' },
  { id: 17, name: 'Hot Dog Cheesy Melt',    price: 40,                 rating: 3.8, img: '/hotdog/hotdog-5.png', category: 'Hot dog' },
  { id: 18, name: 'Hot Dog Spicy Boom',    price: 35,                 rating: 3.8, img: '/hotdog/hotdog-6.png', category: 'Hot dog' },
];