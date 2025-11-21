/**
 * Product Type Definitions
 * Centralized types for product-related data structures
 */

export enum ProductCategory {
  BM = 'bm',
  PERSONAL = 'personal'
}

export enum ProductType {
  // BM Types
  BM_250 = 'bm_250',
  BM_350 = 'bm_350',
  BM_FARM = 'bm_farm',
  BM_AGENCY = 'bm_agency',
  
  // Personal Types
  PERSONAL_NEW = 'personal_new',
  PERSONAL_AGED = 'personal_aged',
  PERSONAL_VERIFIED = 'personal_verified'
}

export enum ProductStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LIMITED = 'limited',
  COMING_SOON = 'coming_soon'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  type: ProductType;
  inStock: boolean;
  status: ProductStatus;
  features: string[];
  warranty: ProductWarranty;
  stock?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWarranty {
  duration: number; // in days
  type: 'replacement' | 'refund' | 'both';
  conditions: string[];
}

export interface ProductFilters {
  category?: ProductCategory;
  type?: ProductType;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  status?: ProductStatus;
}

export interface ProductSortOptions {
  sortBy: 'name' | 'price' | 'createdAt' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export interface PurchaseRequest {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  orderId: string;
  transactionId: string;
  totalAmount: number;
  accounts?: ProductAccount[];
}

export interface ProductAccount {
  id: string;
  email: string;
  password: string;
  additionalInfo?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface ProductCategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  productCount: number;
}
