
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  readonly cart = inject(CartService);

  formatPrice(price: number): string {
    return '₹' + Number(price).toLocaleString('en-IN');
  }


  private readonly orderService = inject(OrderService);

ordering = false;
orderMessage = '';
orderError = '';

private getLoggedInUserId(): string | null {
  const storedUser = sessionStorage.getItem('user');

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);
    const id = user?._id ?? user?.id ?? user?.userId;

    return id == null ? null : String(id);
  } catch {
    return storedUser.trim() || null;
  }
}

orderNow(): void {
  this.orderMessage = '';
  this.orderError = '';

  if (this.ordering) return;

  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.orderError = 'Please log in again.';
    return;
  }

  const cartItems = this.cart.items();

  if (cartItems.length === 0) {
    this.orderError = 'Your cart is empty.';
    return;
  }

  const invalidItem = cartItems.find(item =>
    !item.product._id ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1
  );

  if (invalidItem) {
    this.orderError =
      'A product is missing its database ID. Please fix the product data.';
    return;
  }

  const items = cartItems.map(item => ({
    productId: String(item.product._id),
    product_name: item.product.product_name,
    price: Number(item.product.price),
    quantity: item.quantity
  }));

  this.ordering = true;

  this.orderService.placeOrder(userId, items).subscribe({
    next: response => {
      this.cart.clearCart();
      this.orderMessage = response.message;
      this.ordering = false;
    },
    error: error => {
      console.error('Order error:', error);
      this.orderError =
        error.error?.message || 'Unable to place order.';
      this.ordering = false;
    }
  });
  }
}
