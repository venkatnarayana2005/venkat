
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, Product } from '../../services/cart';
import { OrderService, DeliveryDetails } from '../../services/order';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);

  showDeliveryForm = false;
  ordering = false;
  orderMessage = '';
  orderError = '';

  delivery: DeliveryDetails = {
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };

  formatPrice(price: number): string {
    return '₹' + Number(price).toLocaleString('en-IN');
  }

  // Read the user ID saved by your login process.
  private getLoggedInUserId(): string | null {
    const storedUser = sessionStorage.getItem('user');

    if (!storedUser) return null;

    try {
      const user = JSON.parse(storedUser);
      const id = user?._id ?? user?.id ?? user?.userId;

      return id == null || String(id).trim() === ''
        ? null
        : String(id);
    } catch {
      return storedUser.trim() || null;
    }
  }

  // Order button opens the form.
  orderNow(): void {
    console.log('[ORDER STEP 1] Order button clicked');

    this.orderMessage = '';
    this.orderError = '';

    if (this.cart.items().length === 0) {
      this.orderError = 'Your cart is empty.';
      return;
    }

    if (!this.getLoggedInUserId()) {
      this.orderError = 'Please log in before placing your order.';
      return;
    }

    this.showDeliveryForm = true;
    console.log('[ORDER STEP 2] Delivery form opened');
  }

  cancelDeliveryForm(): void {
    this.showDeliveryForm = false;
    this.orderError = '';
    console.log('[ORDER STEP 3] Delivery form closed');
  }

  // Form submission saves the order.
  confirmOrder(): void {
    this.orderError = '';
    this.orderMessage = '';

    if (this.ordering) return;

    const userId = this.getLoggedInUserId();

    if (!userId) {
      this.orderError = 'Please log in again.';
      return;
    }

    const delivery = {
      fullName: this.delivery.fullName.trim(),
      phone: this.delivery.phone.trim(),
      address: this.delivery.address.trim(),
      city: this.delivery.city.trim(),
      state: this.delivery.state.trim(),
      pincode: this.delivery.pincode.trim()
    };

    if (
      !delivery.fullName ||
      !delivery.phone ||
      !delivery.address ||
      !delivery.city ||
      !delivery.state ||
      !delivery.pincode
    ) {
      this.orderError = 'Please fill in all delivery details.';
      return;
    }

    if (!/^[0-9]{10}$/.test(delivery.phone)) {
      this.orderError = 'Enter a valid 10-digit phone number.';
      return;
    }

    if (!/^[0-9]{6}$/.test(delivery.pincode)) {
      this.orderError = 'Enter a valid 6-digit PIN code.';
      return;
    }

    const cartItems = this.cart.items();

    const invalidItem = cartItems.find(
      item => !item.product._id ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    );

    if (invalidItem) {
      this.orderError =
        'A product is missing a valid database ID. Please reload products.';
      console.error('[ORDER ERROR] Invalid cart item:', invalidItem);
      return;
    }

    const items = cartItems.map(item => ({
      productId: String(item.product._id),
      product_name: item.product.product_name,
      price: Number(item.product.price),
      quantity: item.quantity
    }));

    this.ordering = true;
    console.log('[ORDER STEP 4] Sending order to backend', {
      userId, delivery, items
    });

    this.orderService.placeOrder(userId, delivery, items).subscribe({
      next: response => {
        console.log('[ORDER STEP 5] Order saved:', response.order);

        this.cart.clearCart();
        this.showDeliveryForm = false;
        this.orderMessage = response.message;
        this.ordering = false;

        this.delivery = {
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        };
      },
      error: error => {
        console.error('[ORDER STEP ERROR]', error);
        this.orderError =
          error.error?.message || 'Unable to confirm order. Please try again.';
        this.ordering = false;
      }
    });
  }
}
