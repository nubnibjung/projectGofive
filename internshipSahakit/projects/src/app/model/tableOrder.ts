export type OrderStatus = 'Pending' | 'Dispatch' | 'Completed';

export interface Order {
  id: number;
  code: string;        // "#2632"
  name: string;
  avatar: string;      // URL รูปโปรไฟล์
  address: string;
  date: string;        // ISO: "2020-08-01"
  price: number;
  status: OrderStatus;
}
