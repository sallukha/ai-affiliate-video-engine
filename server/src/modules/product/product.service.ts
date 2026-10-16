import { Product } from "./product.types";

const products: Product[] = [];

export const createProduct = (
  data: Omit<Product, "id" | "createdAt">,
): Product => {
  const product: Product = {
    id: `product_${Date.now()}`,
    ...data,
    createdAt: new Date(),
  };

  products.push(product);

  return product;
};

export const getProducts = (): Product[] => {
  return products;
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const deleteProduct = (id: string): boolean => {
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return false;
  }

  products.splice(index, 1);

  return true;
};