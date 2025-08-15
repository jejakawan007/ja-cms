// Template System Components
export { TemplateGallery } from './TemplateGallery';
export { TemplateCard } from './TemplateCard';

// Template Types
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  blocks: any[];
  rating: number;
  downloads: number;
  isNew?: boolean;
  isPopular?: boolean;
  tags: string[];
}

// Template Categories
export const TEMPLATE_CATEGORIES = [
  'All',
  'Blog Posts',
  'Landing Pages',
  'Product Pages',
  'News Articles',
  'Tutorials',
  'Reviews',
  'Interviews'
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];
