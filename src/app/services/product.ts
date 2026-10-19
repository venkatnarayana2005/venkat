import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './cart';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5000/products';

  // 1. GET ALL PRODUCTS
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // // 2. GET PRODUCT BY ID
  // getProductById(id: string): Observable<Product> {
  //   return this.http.get<Product>(
  //     `${this.apiUrl}/${encodeURIComponent(id)}`
  //   );
  // }

  // // 3. ADD PRODUCT
  // addProduct(formData: FormData): Observable<{
  //   message: string;
  //   product: Product;
  // }> {
  //   return this.http.post<{
  //     message: string;
  //     product: Product;
  //   }>(this.apiUrl, formData);
  // }

  // // 4. UPDATE PRODUCT
  // updateProduct(
  //   id: string,
  //   data: FormData | Partial<Product>
  // ): Observable<{
  //   message: string;
  //   product: Product;
  // }> {
  //   return this.http.put<{
  //     message: string;
  //     product: Product;
  //   }>(
  //     `${this.apiUrl}/${encodeURIComponent(id)}`,
  //     data
  //   );
  // }

  // // 5. DELETE PRODUCT
  // deleteProduct(id: string): Observable<{
  //   message: string;
  // }> {
  //   return this.http.delete<{
  //     message: string;
  //   }>(
  //     `${this.apiUrl}/${encodeURIComponent(id)}`
  //   );
  // }

  // 6. CONVERT IMAGE DATA TO IMAGE URL
  getImageUrl(image: unknown): string {
  if (!image) {
    return '';
  }

  // Case 1: Image is already a string
  if (typeof image === 'string') {
    return this.resolveImageString(image);
  }

  if (typeof image !== 'object') {
    return '';
  }

  const img = image as {
    data?: unknown;
    type?: string;
    contentType?: string;
  };

  let data: number[] | undefined;

  // Case 2: MongoDB image object { data: [...] }
  if (Array.isArray(img.data)) {
    data = img.data;
  }

  // Case 3: Serialized Buffer { data: { type, data: [...] } }
  else if (
    img.data &&
    typeof img.data === 'object' &&
    'data' in img.data &&
    Array.isArray((img.data as { data: unknown }).data)
  ) {
    data = (img.data as { data: number[] }).data;
  }

  if (!data?.length) {
    return '';
  }

  // Convert bytes to text to detect a URL stored inside a Buffer
  const bytes = new Uint8Array(data);

  const decodedText = new TextDecoder()
    .decode(bytes)
    .trim();

  if (
    decodedText.startsWith('https://') ||
    decodedText.startsWith('http://')
  ) {
    return decodedText;
  }

  // Actual binary image data
  let mimeType = img.contentType || 'image/jpeg';

  if (
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71
  ) {
    mimeType = 'image/png';
  } else if (
    bytes[0] === 82 &&
    bytes[1] === 73 &&
    bytes[2] === 70 &&
    bytes[3] === 70 &&
    bytes[8] === 87 &&
    bytes[9] === 69 &&
    bytes[10] === 66 &&
    bytes[11] === 80
  ) {
    mimeType = 'image/webp';
  }

  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

private resolveImageString(value: string): string {
  const image = value.trim();

  if (
    image.startsWith('https://') ||
    image.startsWith('http://') ||
    image.startsWith('/') ||
    image.startsWith('data:image/')
  ) {
    return image;
  }

  return `data:image/jpeg;base64,${image}`;
}
}