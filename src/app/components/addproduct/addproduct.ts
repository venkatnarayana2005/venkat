
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AddProductResponse {
  message: string;
  product: {
    _id: string;
    product_name: string;
    price: number;
  };
}

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addproduct.html',
  styleUrl: './addproduct.css'
})
export class Addproduct {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/products';

  product_name = '';
  price: number | null = null;
  description = '';
  category = '';
  image: File | null = null;

  imagePreview = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  onImageSelected(event: Event): void {
    console.log('[ANGULAR STEP 1] Image selection');

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.image = null;
    this.imagePreview = '';
    this.errorMessage = '';

    if (!file) {
      console.warn('[ANGULAR] No image selected');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.errorMessage = 'Select a JPEG, PNG, or WebP image.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image must be 5 MB or smaller.';
      input.value = '';
      return;
    }

    this.image = file;
    console.log('[ANGULAR STEP 2] Image validated:', file.name);

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview = reader.result as string;
      console.log('[ANGULAR STEP 3] Image preview ready');
    };

    reader.onerror = () => {
      this.errorMessage = 'Could not read the selected image.';
      console.error('[ANGULAR] Image preview failed');
    };

    reader.readAsDataURL(file);
  }

  addProduct(): void {
    console.log('===== ADD PRODUCT START =====');
    this.successMessage = '';
    this.errorMessage = '';

    console.log('[ANGULAR STEP 4] Validate form');

    if (
      !this.product_name.trim() ||
      this.price === null ||
      !Number.isFinite(this.price) ||
      this.price <= 0 ||
      !this.description.trim() ||
      !this.image
    ) {
      this.errorMessage =
        'Enter the product name, valid price, description, and image.';
      console.error('[ANGULAR] Validation failed');
      return;
    }

    console.log('[ANGULAR STEP 5] Form validation passed');

    const formData = new FormData();
    formData.append('product_name', this.product_name.trim());
    formData.append('price', String(this.price));
    formData.append('description', this.description.trim());
    formData.append('category', this.category.trim() || 'Other');
    formData.append('image', this.image, this.image.name);

    console.log('[ANGULAR STEP 6] FormData created');

    formData.forEach((value, key) => {
      console.log(
        `[ANGULAR FORM DATA] ${key}:`,
        value instanceof File ? value.name : value
      );
    });

    console.log('[ANGULAR STEP 7] POST request:', this.apiUrl);
    this.loading = true;

    this.http.post<AddProductResponse>(this.apiUrl, formData).subscribe({
      next: (response) => {
        console.log('[ANGULAR STEP 8] Backend response:', response);

        this.loading = false;
        this.successMessage = response.message;

        console.log('[ANGULAR STEP 9] Product saved:', response.product);

        this.product_name = '';
        this.price = null;
        this.description = '';
        this.category = '';
        this.image = null;
        this.imagePreview = '';

        const input = document.getElementById(
          'productImage'
        ) as HTMLInputElement | null;

        if (input) {
          input.value = '';
        }

        console.log('===== ADD PRODUCT COMPLETE =====');
      },
      error: (error) => {
        this.loading = false;

        console.error('[ANGULAR REQUEST FAILED]');
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        console.error('Response:', error.error);
        console.error('Full error:', error);

        this.errorMessage =
          error.error?.message ||
          `Request failed with HTTP ${error.status}. Check the backend terminal.`;
      }
    });
  }
}
