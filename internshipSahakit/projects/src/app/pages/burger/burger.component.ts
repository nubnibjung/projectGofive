import { Component, computed, effect, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { Food } from '../../model/burger';
import { FoodService } from '../../service/food.service';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../model/cart-item';
import Swal from 'sweetalert2';
import { Order } from '../../model/order';

const LS_CART = 'burger_cart';
const LS_WISHLIST = 'burger_wishlist';
const LS_ORDERS = 'burger_orders';

@Component({
  selector: 'app-burger',
  standalone: true,
  templateUrl: './burger.component.html',
  imports: [NgFor, NgIf, CurrencyPipe, FormsModule],
  styleUrl: './burger.component.css'

})
export class BurgerComponent {
 private readonly foodSvc = inject(FoodService);

  search = signal('');
  selectedCategory = signal<string>('Burger');

  showWishlistMenu = signal(false);
  @ViewChild('wishWrapper', { read: ElementRef }) wishWrapper?: ElementRef<HTMLElement>;

  showOrdersMenu = signal(false);
  @ViewChild('ordersWrapper', { read: ElementRef }) ordersWrapper?: ElementRef<HTMLElement>;

  cart     = signal<CartItem[]>(safeLoad(LS_CART, [] as CartItem[]));
  wishlist = signal<Food[]>(safeLoad(LS_WISHLIST, [] as Food[]));
  orders   = signal<Order[]>(safeLoad(LS_ORDERS, [] as Order[]));

  private _persistCart = effect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(this.cart()));
  });
  private _persistWishlist = effect(() => {
    localStorage.setItem(LS_WISHLIST, JSON.stringify(this.wishlist()));
  });
  private _persistOrders = effect(() => {
    localStorage.setItem(LS_ORDERS, JSON.stringify(this.orders()));
  });

  categories = this.foodSvc.categories; 
  foods = computed(() => {
  const q = this.search().trim();
  const cat = this.selectedCategory();
  const categoryForFilter = q ? undefined : cat; 
  return this.foodSvc.filterFoods(this.search(), categoryForFilter);
});
  wishlistCount = computed(() => this.wishlist().length);
  cartCount = computed(() => this.cart().reduce((n, it) => n + it.quantity, 0));
  editWishlist = signal(false);
  selectedWish = signal<Set<number>>(new Set());
  subTotal = computed(() => this.cart().reduce((sum, it) => sum + it.price * it.quantity, 0));
  taxRate = 0.07;
  taxAmount = computed(() => +(this.subTotal() * this.taxRate).toFixed(2));
  totalPayment = computed(() => this.subTotal() + this.taxAmount());

  categoryIcon(c: string) {
    const map: Record<string, string> = {
      Donuts: '🍩', Burger: '🍔', Ice: '🍨', Potato: '🍟',
      Pizza: '🍕', 'Hot dog': '🌭', Chicken: '🍗'
    };
    return map[c] ?? '🍽️';
  }
  categoryClass(c: string) {
    const active = this.selectedCategory() === c;
    return [
      'px-3 py-2 rounded-xl border text-sm transition',
      active ? 'bg-orange-50 border-orange-200 text-orange-700'
             : 'bg-white border-gray-200 hover:bg-gray-50'
    ].join(' ');
  }
  formatDate(iso: string) { return new Date(iso).toLocaleString(); }

  isInCart = (id: number) => this.cart().some(x => x.id === id);
  addToCart(food: Food) {
    this.cart.update(c => {
      const ex = c.find(x => x.id === food.id);
      return ex
        ? c.map(x => x.id === food.id ? { ...x, quantity: x.quantity + 1 } : x)
        : [...c, { ...food, quantity: 1 }];
    });
  }
  removeFromCart(id: number) { this.cart.update(c => c.filter(x => x.id !== id)); }
  increaseQty(id: number) { this.cart.update(c => c.map(x => x.id === id ? { ...x, quantity: x.quantity + 1 } : x)); }
  decreaseQty(id: number) {
    this.cart.update(c =>
      c.map(x => x.id === id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x)
       .filter(x => x.quantity > 0)
    );
  }

  isInWishlist(id: number) { return this.wishlist().some(x => x.id === id); }
  toggleWishlist(food: Food) {
    this.wishlist.update(w => this.isInWishlist(food.id) ? w.filter(x => x.id !== food.id) : [...w, food]);
  }

  toggleWishlistMenu() { this.showWishlistMenu.update(v => !v); }
  toggleOrdersMenu()   { this.showOrdersMenu.update(v => !v); }
  closeWishlistMenu()  { if (this.showWishlistMenu()) this.showWishlistMenu.set(false); }
  closeOrdersMenu()    { if (this.showOrdersMenu()) this.showOrdersMenu.set(false); }

  @HostListener('document:keydown.escape') onEsc() {
    this.closeWishlistMenu();
    this.closeOrdersMenu();
  }
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const target = ev.target as Node;
    if (this.showWishlistMenu() && this.wishWrapper?.nativeElement && !this.wishWrapper.nativeElement.contains(target)) {
      this.closeWishlistMenu();
    }
    if (this.showOrdersMenu() && this.ordersWrapper?.nativeElement && !this.ordersWrapper.nativeElement.contains(target)) {
      this.closeOrdersMenu();
    }
  }
isImageSource(v?: string): boolean {
  if (!v) return false;
  // ถ้ามี .png/.jpg/.webp/.svg หรือเป็น http(s)/data: ให้ถือว่าเป็นรูป
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(v) || /^(https?:|data:|\/)/.test(v);
}
toggleEditWishlist() {
  // สลับเข้า/ออกโหมดแก้ไข
  this.editWishlist.update(v => !v);
  if (!this.editWishlist()) this.selectedWish.set(new Set()); // ออกจากโหมด → ล้างที่เลือก
}

isWishSelected(id: number) {
  return this.selectedWish().has(id);
}
async clearWishlistAll() {
  if (!this.wishlist().length) return;

  // (มีหรือไม่มีก็ได้) กล่องยืนยัน
  const ok = await Swal.fire({
    title: 'Clear all wishlist?',
    text: 'This will remove all items from your wishlist.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f97316',
    confirmButtonText: 'Yes, clear',
  }).then(r => r.isConfirmed);

  if (!ok) return;

  this.wishlist.set([]);                // เคลียร์ทุกรายการ
  this.selectedWish.set(new Set());     // ล้างที่เลือก
  this.editWishlist.set(false);         // ออกจากโหมดแก้ไข (ถ้าอยู่)
}

toggleWishSelect(id: number) {
  this.selectedWish.update(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
}

selectAllWishlist() {
  const all = new Set(this.wishlist().map(f => f.id));
  this.selectedWish.set(all);
}

clearWishSelection() {
  this.selectedWish.set(new Set());
}

removeSelectedWishlist() {
  const ids = [...this.selectedWish()];
  if (!ids.length) return;
  this.wishlist.update(w => w.filter(f => !ids.includes(f.id)));
  this.clearWishSelection();
  this.editWishlist.set(false); // ปิดโหมดแก้ไข
}
clearSearch() {
  this.search.set('');
}

resetFilters() {
  this.search.set('');
  this.selectedCategory.set(''); // หรือ undefined ถ้าใช้แบบไม่มีหมวด
}
onEnterSearch(event: Event) {
  const input = event.target as HTMLInputElement;
  input?.blur();
}
filteredFoods = computed(() => {
  const q = this.search().trim().toLowerCase();
  const cat = this.selectedCategory();
  return this.foods().filter(f =>
    (!cat || f.category === cat) &&
    (!q || f.name.toLowerCase().includes(q))
  );
});



resolveImg(path: string): string {
  // ถ้าเป็น http(s)/data:/absolute path ก็ส่งกลับตรง ๆ
  if (/^(https?:|data:|\/)/.test(path)) return path;
  // ถ้าเป็นชื่อไฟล์เฉย ๆ ให้ชี้ไปที่ assets
  return `assets/${path}`;
}
  async placeOrder() {
    if (this.cart().length === 0) {
      Swal.fire('Oops!', 'Please add some items to your cart first.', 'warning');
      return;
    }

    const order: Order = {
      id: 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      items: this.cart(),
      subTotal: this.subTotal(),
      tax: this.taxAmount(),
      total: this.totalPayment(),
    };

    this.orders.update(o => [order, ...o]);
    this.cart.set([]);

    await Swal.fire({
      title: 'Order placed successfully!',
      html: `Order ID: <b>${order.id}</b><br/>Total: <b>$${order.total.toFixed(2)}</b>`,
      icon: 'success',
      confirmButtonColor: '#f97316',
      confirmButtonText: 'OK',
    });
  }

  removeOrder(id: string) { this.orders.update(o => o.filter(x => x.id !== id)); }
}

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}