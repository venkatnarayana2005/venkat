import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly orderService = inject(OrderService);

  showOrderHistory = false;
  ordersLoading = false;
  ordersError = '';
  orders: Order[] = [];

  toggleOrderHistory(): void {
    this.showOrderHistory = !this.showOrderHistory;

    if (this.showOrderHistory) {
      this.loadOrderHistory();
    }
  }

  private getUserId(): string | null {
    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const id = user?._id ?? user?.id ?? user?.userId;

        if (id != null && String(id).trim()) {
          return String(id).trim();
        }
      } catch {
        console.error('Invalid stored user.');
      }
    }

    return (
      localStorage.getItem('userId') ||
      sessionStorage.getItem('userId')
    );
  }

  loadOrderHistory(): void {
    const userId = this.getUserId();

    if (!userId) {
      this.orders = [];
      this.ordersError = 'Please log in to view your orders.';
      return;
    }

    this.ordersLoading = true;
    this.ordersError = '';

    this.orderService.getOrderHistory(userId).subscribe({
      next: (response) => {
        this.orders = Array.isArray(response) ? response : [];
        this.ordersLoading = false;
      },
      error: (error) => {
        console.error('Order history error:', error);
        this.orders = [];
        this.ordersError =
          error.error?.message ||
          'Unable to load your orders. Please try again.';
        this.ordersLoading = false;
      }
    });
  }
}