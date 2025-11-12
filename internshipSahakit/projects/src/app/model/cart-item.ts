import { Food } from "./burger";

export interface CartItem extends Food {
  quantity: number;
}