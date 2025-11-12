export interface Food {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  img?: string;        
  category: string;
}