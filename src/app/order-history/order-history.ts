
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../services/order';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html'
})
export class OrderHistory implements OnInit {
  private readonly orderService = inject(OrderService);

  orders: Order[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const storedUser = sessionStorage.getItem('user');

    if (!storedUser) {
      this.errorMessage = 'Please log in to view your orders.';
      return;
    }

    let userId: string | null = null;

    try {
      const user = JSON.parse(storedUser);
      const id = user?._id ?? user?.id ?? user?.userId;

      userId = id == null ? null : String(id);
    } catch {
      userId = storedUser.trim() || null;
    }

    if (!userId) {
      this.errorMessage = 'Unable to identify your account.';
      return;
    }

    this.loading = true;

    this.orderService.getOrderHistory(userId).subscribe({
      next: orders => {
        this.orders = orders;
        this.loading = false;
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Unable to load your order history.';
        this.loading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return '₹' + Number(price).toLocaleString('en-IN');
  }
}
