
// import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { finalize, timeout } from 'rxjs';
// import { CartService, Product } from '../../services/cart';

// @Component({
//   selector: 'app-products',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './products.html',
//   styleUrl: './products.css'
// })
// export class Products implements OnInit {
//   private readonly http = inject(HttpClient);
//   readonly cart = inject(CartService);

//   products: Product[] = [];
//   loading = false;
//   errorMessage = '';

//   constructor(
//     private cdr: ChangeDetectorRef

//   ){}
//   ngOnInit(): void {
//     this.loadProducts();
//     this.cdr.detectChanges();
//   }

//   // loadProducts(): void {
//   //   this.loading = true;
//   //   this.errorMessage = '';

//   //   this.http.get<unknown>('http://localhost:5000/products')
//   //     .pipe(
//   //       timeout(10000),
//   //       finalize(() => {
//   //         this.loading = false;
//   //       })
//   //     )
//   //     .subscribe({
//   //       next: (response) => {
//   //         console.log('Angular API response:', response);

//   //         let data: Product[] = [];

//   //         if (Array.isArray(response)) {
//   //           data = response as Product[];
//   //           this.loading = false;
//   //           console.log(data);
//   //         } else if (
//   //           response !== null &&
//   //           typeof response === 'object'
//   //         ) {
//   //           const result = response as {
//   //             products?: Product[];
//   //             result?: Product[];
//   //           };

//   //           if (Array.isArray(result.products)) {
//   //             data = result.products;
//   //             this.loading = false;
//   //           } else if (Array.isArray(result.result)) {
//   //             data = result.result;
//   //             this.loading = false;
//   //           }
//   //         }

//   //         this.products = data.map((product) => ({
//   //           ...product,
//   //           image: this.getImageUrl(product.image)
//   //         }));

//   //         console.log('Angular products:', this.products.length);
//   //         console.log('Angular loading:', this.loading);
//   //       },
//   //       error: (error) => {
//   //         console.error('Products API error:', error);

//   //         this.errorMessage =
//   //           error.name === 'TimeoutError'
//   //             ? 'The request timed out. Check your backend.'
//   //             : `Unable to load products. HTTP status: ${error.status}`;
//   //       }
//   //     });
//   // }
  

// loadProducts(): void {
//   console.log('1. Starting product request');

//   this.loading = true;
//   this.errorMessage = '';
//   this.cdr.markForCheck();

//   this.http.get<unknown>('http://localhost:5000/products')
//     .pipe(
//       finalize(() => {
//         console.log('5. Request completed');

//         this.loading = false;

//         console.log('6. Loading:', this.loading);
//         console.log('7. Final product count:', this.products.length);

//         // Notify Angular after loading changes.
//         this.cdr.markForCheck();
//       })
//     )
//     .subscribe({
//       next: (response) => {
//         console.log('2. API response received:', response);

//         let data: Product[] = [];

//         if (Array.isArray(response)) {
//           data = response as Product[];
//         } else if (
//           response !== null &&
//           typeof response === 'object'
//         ) {
//           const result = response as {
//             products?: Product[];
//             result?: Product[];
//           };

//           if (Array.isArray(result.products)) {
//             data = result.products;
//           } else if (Array.isArray(result.result)) {
//             data = result.result;
//           }
//         }

//         console.log('3. Extracted products:', data);
//         console.log('3. Extracted count:', data.length);

//         this.products = data.map((product) => ({
//           ...product,
//           image: this.getImageUrl(product.image)
//         }));

//         console.log('4. Products assigned:', this.products);
//         console.log('4. Product count:', this.products.length);

//         // Notify Angular after products are assigned.
//         this.cdr.markForCheck();
//       },

//       error: (error) => {
//         console.error('Product request failed:', error);

//         this.errorMessage =
//           `Unable to load products. HTTP status: ${error.status}`;

//         this.cdr.markForCheck();
//       }
//     });
// }



//   private getImageUrl(image: Product['image']): string {
//     if (!image) return '';

//     if (typeof image === 'string') {
//       if (
//         image.startsWith('data:image/') ||
//         image.startsWith('http://') ||
//         image.startsWith('https://') ||
//         image.startsWith('/')
//       ) {
//         return image;
//       }

//       return `data:image/jpeg;base64,${image}`;
//     }

//     if (Array.isArray(image.data) && image.data.length > 0) {
//       const bytes = new Uint8Array(image.data);
//       let binary = '';

//       for (const byte of bytes) {
//         binary += String.fromCharCode(byte);
//       }

//       const base64 = btoa(binary);
//       let mimeType = 'image/jpeg';

//       // PNG signature
//       if (
//         bytes[0] === 137 &&
//         bytes[1] === 80 &&
//         bytes[2] === 78 &&
//         bytes[3] === 71
//       ) {
//         mimeType = 'image/png';
//       }

//       // WebP signature
//       else if (
//         bytes[0] === 82 &&
//         bytes[1] === 73 &&
//         bytes[2] === 70 &&
//         bytes[3] === 70 &&
//         bytes[8] === 87 &&
//         bytes[9] === 69 &&
//         bytes[10] === 66 &&
//         bytes[11] === 80
//       ) {
//         mimeType = 'image/webp';
//       }

//       return `data:${mimeType};base64,${base64}`;
//     }

//     console.warn('Unsupported image format:', image);
//     return '';
//   }

//   addToCart(product: Product): void {
//     this.cart.addToCart(product);
//   }

//   getQuantity(productId: string): number {
//     return this.cart.items()
//       .find(item => item.product._id === productId)?.quantity ?? 0;
//   }

//   increase(productId: string): void {
//     this.cart.increaseQuantity(productId);
//   }

//   decrease(productId: string): void {
//     this.cart.decreaseQuantity(productId);
//   }

//   formatPrice(price: number): string {
//     return '₹' + Number(price).toLocaleString('en-IN');
//   }

//   onImageError(product: Product): void {
//   console.error(
//     'Image failed to display for:',
//     product.product_name,
//     product.image
//   );

//   product.image = '';
// }
// }



import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';

import { CartService, Product } from '../../services/cart';
import { ProductService } from '../../services/product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly cart = inject(CartService);

  products: Product[] = [];

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    console.log('[COMPONENT] Products page initialized');
    this.loadProducts();
  }

  // 1. Load products through ProductService
  loadProducts(): void {
    console.log('[STEP 1] Starting product request');

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.productService.getProducts()
      .pipe(
        finalize(() => {
          this.loading = false;

          console.log('[STEP 5] Request completed');
          console.log('[STEP 6] Loading:', this.loading);
          console.log('[STEP 7] Product count:', this.products.length);

          this.cdr.markForCheck();
        })
      )
      .subscribe({
        
next: (response) => {
  console.log('[API RESPONSE]', response);

  const data: any[] = Array.isArray(response) ? response : [];

  this.products = data.map((item, index) => {
    const id = item._id ?? item.id;

    if (id === undefined || id === null || String(id).trim() === '') {
      console.error('Product missing ID in API response:', item);
    }

    return {
      ...item,
      _id: id == null ? '' : String(id),
      image: this.productService.getImageUrl(item.image)
    } as Product;
  });

  console.log(
    '[PRODUCT IDs]',
    this.products.map(p => ({
      name: p.product_name,
      id: p._id
    }))
  );

  this.cdr.markForCheck();
},


        error: (error) => {
          console.error('[COMPONENT] Product request failed:', error);

          this.errorMessage =
            error.name === 'TimeoutError'
              ? 'The request timed out. Check your backend.'
              : `Unable to load products. HTTP status: ${error.status}`;

          this.cdr.markForCheck();
        }
      });
  }

  // 2. Add product to cart
  addToCart(product: Product): void {
    this.cart.addToCart(product);
  }

  // 3. Get cart quantity for a product
  getQuantity(productId: string): number {
    return this.cart.items()
      .find(item => item.product._id === productId)?.quantity ?? 0;
  }

  // 4. Increase cart quantity
  increase(productId: string): void {
    this.cart.increaseQuantity(productId);
  }

  // 5. Decrease cart quantity
  decrease(productId: string): void {
    this.cart.decreaseQuantity(productId);
  }

  // 6. Format price in Indian Rupees
  formatPrice(price: number): string {
    return '₹' + Number(price).toLocaleString('en-IN');
  }

  // 7. Handle broken product images
  onImageError(product: Product): void {
    console.error(
      '[IMAGE ERROR]',
      product.product_name,
      product.image
    );

    product.image = '';
  }

  
searchText = '';
filteredProducts: Product[] = [];
hasSearched = false;

filterProducts(): void {
  const search = this.searchText.trim().toLowerCase();

  // Empty search: display every product
  if (!search) {
    this.filteredProducts = [...this.products];
    this.hasSearched = false;
    return;
  }

  this.hasSearched = true;

  // Search by product name OR category
  this.filteredProducts = this.products.filter(product =>
    (product.product_name || '').toLowerCase().includes(search) ||
    (product.category || '').toLowerCase().includes(search)
  );
}

refreshProducts(): void {
  this.searchText = '';
  this.hasSearched = false;
  this.filteredProducts = [...this.products];

  // Reload the latest products from the backend
  this.loadProducts();
}

}
