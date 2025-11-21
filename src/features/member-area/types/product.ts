export enum ProductCategory {
  BM = 'bm',
  PERSONAL = 'personal'
}

export enum ProductType {
  VERIFIED = 'verified',
  LIMIT_250 = 'limit_250',
  LIMIT_500 = 'limit_500',
  LIMIT_1000 = 'limit_1000',
  LIMIT_140 = 'limit_140',
  LIMIT_50 = 'limit_50',
  BM50 = 'bm50',
  WHATSAPP_API = 'whatsapp_api',
  OLD = 'old',
  NEW = 'new',
  AGED_1YEAR = 'aged_1year',
  AGED_2YEARS = 'aged_2years'
}

export interface DetailField {
  label: string;
  value: string;
  icon?: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  type: ProductType;
  title: string;
  description: string;
  price: number;
  stock: number;
  features: string[];
  limitations?: string[];
  warranty: {
    enabled: boolean;
    duration: number;
    terms?: string[];
  };
  ad_limit?: string;
  verification_status?: string;
  ad_account_type?: string;
  detail_fields?: DetailField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: ProductCategory;
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}
