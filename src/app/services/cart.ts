
import { Injectable, computed, signal } from '@angular/core';

export interface Product {
  _id: string;
  product_name: string;
  price: number;
  description: string;
  category?: string;
  image?: string | {
    type?: string;
    data?: number[];
  } | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly itemsState = signal<CartItem[]>([]);

  readonly items = this.itemsState.asReadonly();

  readonly cartCount = computed(() => {
    const count = this.itemsState().reduce(
      (total, item) => total + item.quantity,
      0
    );

    console.log('[CART STEP 1] Total item count:', count);
    return count;
  });

  readonly cartTotal = computed(() => {
    const total = this.itemsState().reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    console.log('[CART STEP 2] Cart total:', total);
    return total;
  });

  // ADD PRODUCT
  addToCart(product: Product): void {
    console.log('[ADD STEP 1] Add to Cart clicked');
    console.log('[ADD STEP 2] Received product:', product);

    const productId = String(product?._id ?? '').trim();

    console.log('[ADD STEP 3] Product ID:', productId);

    if (!productId) {
      console.error('[ADD ERROR] Product has no ID:', product);
      return;
    }

    if (!Number.isFinite(Number(product.price)) ||
        Number(product.price) < 0) {
      console.error('[ADD ERROR] Invalid product price:', product.price);
      return;
    }

    this.itemsState.update(items => {
      console.log('[ADD STEP 4] Current cart:', items);

      const existing = items.find(
        item => String(item.product._id) === productId
      );

      if (existing) {
        console.log('[ADD STEP 5] Product already exists in cart');
        console.log('[ADD STEP 6] Old quantity:', existing.quantity);

        const updatedItems = items.map(item =>
          String(item.product._id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        console.log('[ADD STEP 7] Quantity increased');
        console.log('[ADD STEP 8] Updated cart:', updatedItems);

        return updatedItems;
      }

      const updatedItems = [
        ...items,
        { product: { ...product, _id: productId }, quantity: 1 }
      ];

      console.log('[ADD STEP 5] New product added');
      console.log('[ADD STEP 6] Initial quantity: 1');
      console.log('[ADD STEP 7] Updated cart:', updatedItems);

      return updatedItems;
    });

    console.log('[ADD STEP 9] Add operation completed');
  }

  // INCREASE QUANTITY
  increaseQuantity(productId: string): void {
    console.log('[INCREASE STEP 1] Increase clicked');
    console.log('[INCREASE STEP 2] Product ID:', productId);

    const exists = this.itemsState().some(
      item => String(item.product._id) === String(productId)
    );

    if (!exists) {
      console.error('[INCREASE ERROR] Product not found:', productId);
      return;
    }

    this.itemsState.update(items =>
      items.map(item =>
        String(item.product._id) === String(productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

    console.log('[INCREASE STEP 3] Updated cart:', this.itemsState());
  }

  // DECREASE QUANTITY
  decreaseQuantity(productId: string): void {
    console.log('[DECREASE STEP 1] Decrease clicked');
    console.log('[DECREASE STEP 2] Product ID:', productId);

    const exists = this.itemsState().some(
      item => String(item.product._id) === String(productId)
    );

    if (!exists) {
      console.error('[DECREASE ERROR] Product not found:', productId);
      return;
    }

    this.itemsState.update(items =>
      items
        .map(item =>
          String(item.product._id) === String(productId)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );

    console.log('[DECREASE STEP 3] Updated cart:', this.itemsState());
  }

  // REMOVE PRODUCT
  removeFromCart(productId: string): void {
    console.log('[REMOVE STEP 1] Remove clicked');
    console.log('[REMOVE STEP 2] Product ID:', productId);
    console.log('[REMOVE STEP 3] Cart before removal:', this.itemsState());

    this.itemsState.update(items =>
      items.filter(
        item => String(item.product._id) !== String(productId)
      )
    );

    console.log('[REMOVE STEP 4] Cart after removal:', this.itemsState());
  }

  // CLEAR CART
  clearCart(): void {
    console.log('[CLEAR STEP 1] Clear cart requested');
    console.log('[CLEAR STEP 2] Cart before clearing:', this.itemsState());

    this.itemsState.set([]);

    console.log('[CLEAR STEP 3] Cart cleared');
    console.log('[CLEAR STEP 4] Cart after clearing:', this.itemsState());
  }
}
