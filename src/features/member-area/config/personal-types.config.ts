import { User, Clock, Sparkles } from 'lucide-react';
import { Tab } from '../components/products/CategoryTabs';
import { ProductType } from '../types/product';

export interface PersonalTypeConfig {
  id: string;
  label: string;
  icon: any;
  type?: ProductType;
}

export const PERSONAL_TYPES: PersonalTypeConfig[] = [
  {
    id: 'all',
    label: 'All Accounts',
    icon: User,
  },
  {
    id: 'old',
    label: 'Old Accounts',
    icon: Clock,
    type: ProductType.OLD,
  },
  {
    id: 'new',
    label: 'New Accounts',
    icon: Sparkles,
    type: ProductType.NEW,
  },
];

export const getPersonalTypeTabs = (productCounts?: Record<string, number>): Tab[] => {
  return PERSONAL_TYPES.map((type) => ({
    id: type.id,
    label: type.label,
    icon: type.icon,
    count: productCounts?.[type.id],
  }));
};
