import { CartItem } from './cart-item';

export interface Order {
  id: string;             // eg. 'ORD-AB1234'
  createdAt: string;      // ISO string เช่น "2025-11-05T10:33:12.000Z"
  items: CartItem[];      // รายการสินค้าที่สั่งซื้อ
  subTotal: number;       // รวมราคาก่อนภาษี
  tax: number;            // ภาษี
  total: number;          // รวมทั้งหมด (final)
}
