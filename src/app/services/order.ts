import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  delivery: DeliveryDetails;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/orders';

  placeOrder(
    userId: string,
    delivery: DeliveryDetails,
    items: OrderItem[]
  ): Observable<{ message: string; order: Order }> {
    return this.http.post<{ message: string; order: Order }>(
      this.apiUrl,
      { userId, delivery, items }
    );
  }

  
  getOrderHistory(userId: string): Observable<Order[]> {
  return this.http
    .get<{ success: boolean; orders: Order[] }>(
      `${this.apiUrl}/user/${encodeURIComponent(userId)}`
    )
    .pipe(
      map(response => response.orders ?? [])
    );
}

}
