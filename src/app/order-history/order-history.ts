
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
  
    console.log('Stored user:', sessionStorage.getItem('user'));

    const storedUser = this.getLoggedInUserId();

    console.log('Logged-in user ID:', storedUser);

  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);
    const id = user?._id ?? user?.id ?? user?.userId;

    return id ? String(id) : null;
  } catch {
    return null;
  }
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
    next: orders => {
      this.orders = orders;
      this.loading = false;
    },
    error: error => {
      console.error('Failed to load orders:', error);
      this.errorMessage = 'Unable to load your order history.';
      this.loading = false;
    }
  });
}

  formatPrice(price: number): string {
    return '₹' + Number(price || 0).toLocaleString('en-IN');
  }
}
