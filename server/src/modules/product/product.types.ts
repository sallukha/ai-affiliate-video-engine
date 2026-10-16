export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  productUrl?: string;
  affiliateUrl?: string;
  source?: string;
  createdAt: Date;
}