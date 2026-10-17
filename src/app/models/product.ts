export interface Product {
  _id: string;
  product_name: string;
  price: number;
  description: string;
  category?: string;
  image?: string | { type?: string; data?: number[] } | null;
}