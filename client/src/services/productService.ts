import { apiClient, getDataMode } from './api';
import { ProductItem } from '../types';
import { INITIAL_PRODUCTS } from '../utils/mockData';

let localProducts: ProductItem[] = [...INITIAL_PRODUCTS];

export const productService = {
  /**
   * Fetch all saved products
   */
  async getProducts(): Promise<{ data: ProductItem[]; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.get<ProductItem[]>('/products');
        return { data: response.data, isDemo: false };
      } catch (err) {
        console.warn('Backend GET /products failed:', err);
        throw err;
      }
    }
    return { data: localProducts, isDemo: true };
  },

  /**
   * Add a new product manually
   */
  async createProduct(
    productData: Omit<ProductItem, 'id' | 'videoCount' | 'createdAt'>
  ): Promise<{ data: ProductItem; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        const response = await apiClient.post<ProductItem>('/products', productData);
        return { data: response.data, isDemo: false };
      } catch (err) {
        console.error('Backend POST /products failed:', err);
        throw err;
      }
    }

    const newProduct: ProductItem = {
      ...productData,
      id: `prod-${Date.now().toString().slice(-4)}`,
      videoCount: 0,
      createdAt: new Date().toISOString()
    };
    localProducts = [newProduct, ...localProducts];
    return { data: newProduct, isDemo: true };
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id: string): Promise<{ success: boolean; isDemo: boolean }> {
    const mode = getDataMode();
    if (mode === 'live') {
      try {
        await apiClient.delete(`/products/${id}`);
        return { success: true, isDemo: false };
      } catch (err) {
        console.error(`Backend DELETE /products/${id} failed:`, err);
        throw err;
      }
    }

    localProducts = localProducts.filter((p) => p.id !== id);
    return { success: true, isDemo: true };
  },

  /**
   * Import products via CSV file
   */
  async importProductsCsv(file: File): Promise<{
    importedCount: number;
    errors?: string[];
    isDemo: boolean;
  }> {
    const mode = getDataMode();
    // Parse simple CSV in the browser, then send structured product JSON to the API.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const importedProducts: Omit<ProductItem, 'id' | 'videoCount' | 'createdAt'>[] = [];

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 2 && cols[0]) {
              const name = cols[0];
              const price = parseFloat(cols[1]) || 999;
              const affiliateUrl = cols[2] || 'https://affiliate.example.com';
              const description = cols[3] || 'Imported via CSV file';
              importedProducts.push({
                name,
                price,
                currency: 'INR',
                description,
                features: ['Imported via CSV', 'Quick Campaign Ready'],
                affiliateUrl,
                imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
              });
            }
          }

          if (mode === 'live') {
            const response = await apiClient.post<{ importedCount: number; errors?: string[] }>(
              '/products/import',
              { products: importedProducts }
            );
            resolve({ ...response.data, isDemo: false });
            return;
          }

          importedProducts.forEach((product, index) => {
            localProducts.push({
              ...product,
              id: `prod-csv-${Date.now().toString().slice(-4)}-${index}`,
              videoCount: 0,
              createdAt: new Date().toISOString()
            });
          });
          resolve({ importedCount: importedProducts.length, isDemo: true });
        } catch {
          resolve({ importedCount: 0, errors: ['Failed to parse CSV file content.'], isDemo: true });
        }
      };
      reader.readAsText(file);
    });
  }
};
