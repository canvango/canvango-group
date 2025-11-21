import { Layers, DollarSign, Smartphone, MessageCircle, TrendingUp } from 'lucide-react';
import { FaMeta } from 'react-icons/fa6';
import { Tab } from '../components/products/CategoryTabs';
import { ProductType } from '../types/product';

export interface BMCategoryConfig {
  id: string;
  label: string;
  icon: any;
  type?: ProductType;
}

export const BM_CATEGORIES: BMCategoryConfig[] = [
  {
    id: 'all',
    label: 'All Accounts',
    icon: Layers, // Icon berbeda untuk All Accounts
  },
  {
    id: 'verified',
    label: 'BM Verified',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.VERIFIED,
  },
  {
    id: 'limit_250',
    label: 'BM Limit 250$',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.LIMIT_250,
  },
  {
    id: 'limit_500',
    label: 'BM Limit 500$',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.LIMIT_500,
  },
  {
    id: 'limit_1000',
    label: 'BM Limit 1000$',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.LIMIT_1000,
  },
  {
    id: 'bm50',
    label: 'BM50',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.BM50,
  },
  {
    id: 'whatsapp_api',
    label: 'BM WhatsApp API',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.WHATSAPP_API,
  },
  {
    id: 'limit_140',
    label: 'BM 140 Limit',
    icon: FaMeta, // Meta icon dari Font Awesome
    type: ProductType.LIMIT_140,
  },
];

export const getBMCategoryTabs = (productCounts?: Record<string, number>): Tab[] => {
  return BM_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    count: productCounts?.[category.id],
  }));
};
