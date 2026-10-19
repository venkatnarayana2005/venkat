
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../services/order';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistory implements OnInit {
  private readonly orderService = inject(OrderService);

  orders: Order[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadOrders();
  }

  private getLoggedInUserId(): string | null {
    // Read the user saved during login.
    const storedUser =
      sessionStorage.getItem('user') ||
      localStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const id = user?._id ?? user?.id ?? user?.userId;

        if (id != null && String(id).trim()) {
          return String(id).trim();
        }
      } catch {
        console.error('Could not parse the stored user.');
      }
    }

    // Support applications that store the ID separately.
    return (
      sessionStorage.getItem('userId') ||
      localStorage.getItem('userId')
    );
  }

  loadOrders(): void {
    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.errorMessage = 'Please log in to view your order history.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrderHistory(userId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        console.log('[ORDER HISTORY] Loaded orders:', orders);
      },
      error: (error) => {
        console.error('[ORDER HISTORY ERROR]', error);
        this.errorMessage =
          error.error?.message || 'Unable to load your order history.';
        this.loading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return '₹' + Number(price).toLocaleString('en-IN');
  }
}
