/**
 * Component Types & Props for JA-CMS Frontend
 * Based on ShadCN/UI and custom components
 */

import { ReactNode } from 'react';
import { User, Post, Category, Tag, MediaFile, DashboardStats, ChartDataPoint } from './api';

// =============================================
// COMMON COMPONENT TYPES
// =============================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface LoadingState {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ErrorState {
  error?: string | null;
  onRetry?: () => void;
}

export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

// =============================================
// DASHBOARD COMPONENT TYPES
// =============================================

export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'stable';
    period: string;
  };
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface StatsCardsProps extends BaseComponentProps, LoadingState {
  stats: DashboardStats;
}

export interface AnalyticsChartProps extends BaseComponentProps {
  title?: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'area' | 'pie' | 'doughnut';
  height?: number;
  loading?: boolean;
  error?: string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  responsive?: boolean;
}

export interface ActivityFeedProps extends BaseComponentProps, LoadingState {
  activities: ActivityItem[];
  maxItems?: number;
  showTimestamp?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'user' | 'post' | 'comment' | 'system';
  title: string;
  description?: string;
  user?: User;
  timestamp: string;
  icon?: ReactNode;
  link?: string;
}

export interface DraggableWidgetProps extends BaseComponentProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  isDragging?: boolean;
  isEditable?: boolean;
}

// =============================================
// DATA TABLE COMPONENT TYPES
// =============================================

export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface DataTableProps<T> extends BaseComponentProps, LoadingState, ErrorState {
  data: T[];
  columns: DataTableColumn<T>[];
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => any;
  };
  sorting?: {
    field: string;
    order: 'asc' | 'desc';
    onChange: (field: string, order: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onChange: (filters: Record<string, any>) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  size?: ComponentSize;
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  expandable?: {
    expandedRowRender: (record: T) => ReactNode;
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
  };
  actions?: {
    render: (record: T, index: number) => ReactNode;
    width?: string | number;
    fixed?: 'right';
  };
  emptyText?: string;
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
}

// =============================================
// FORM COMPONENT TYPES
// =============================================

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export interface InputFieldProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  size?: ComponentSize;
  prefix?: ReactNode;
  suffix?: ReactNode;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
}

export interface TextareaFieldProps extends FormFieldProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
}

export interface SelectFieldProps extends FormFieldProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  size?: ComponentSize;
  maxTagCount?: number;
  onSearch?: (value: string) => void;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
  icon?: ReactNode;
  group?: string;
}

export interface CheckboxFieldProps extends FormFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  size?: ComponentSize;
}

export interface RadioFieldProps extends FormFieldProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  direction?: 'horizontal' | 'vertical';
  size?: ComponentSize;
}

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface FileUploadProps extends FormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (file: File | string) => void;
  value?: (File | string)[];
  showPreview?: boolean;
  dragAndDrop?: boolean;
  uploadText?: string;
  dragText?: string;
  previewType?: 'list' | 'grid' | 'card';
}

// =============================================
// CONTENT COMPONENT TYPES
// =============================================

export interface PostCardProps extends BaseComponentProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showAuthor?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onView?: (post: Post) => void;
  loading?: boolean;
}

export interface PostListProps extends BaseComponentProps, LoadingState, ErrorState {
  posts: Post[];
  variant?: 'list' | 'grid' | 'card';
  showFilters?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  filters?: {
    status?: string[];
    category?: string[];
    author?: string[];
    tags?: string[];
  };
  onFiltersChange?: (filters: any) => void;
  onSearch?: (query: string) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export interface CategoryTreeProps extends BaseComponentProps {
  categories: Category[];
  selectedIds?: string[];
  onSelect?: (categoryIds: string[]) => void;
  multiple?: boolean;
  checkable?: boolean;
  draggable?: boolean;
  onDrop?: (dragNode: Category, dropNode: Category, position: number) => void;
  expandedKeys?: string[];
  onExpand?: (expandedKeys: string[]) => void;
  showActions?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onAdd?: (parentId?: string) => void;
}

export interface TagSelectorProps extends BaseComponentProps {
  tags: Tag[];
  selectedTags?: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
  onCreateTag?: (name: string) => Promise<Tag>;
  placeholder?: string;
  maxTags?: number;
  allowCreate?: boolean;
  size?: ComponentSize;
  variant?: 'default' | 'outline' | 'filled';
}

// =============================================
// MEDIA COMPONENT TYPES
// =============================================

export interface MediaGridProps extends BaseComponentProps, LoadingState, ErrorState {
  files: MediaFile[];
  selectedFiles?: MediaFile[];
  onSelect?: (files: MediaFile[]) => void;
  multiple?: boolean;
  viewMode?: 'grid' | 'list';
  gridSize?: 'small' | 'medium' | 'large';
  showActions?: boolean;
  showDetails?: boolean;
  onUpload?: (files: File[]) => void;
  onDelete?: (files: MediaFile[]) => void;
  onEdit?: (file: MediaFile) => void;
  onPreview?: (file: MediaFile) => void;
  filters?: {
    type?: string[];
    folder?: string;
    tags?: string[];
  };
  onFiltersChange?: (filters: any) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export interface MediaFolderTreeProps extends BaseComponentProps {
  folders: any[]; // MediaFolder type
  selectedFolder?: string;
  onSelectFolder?: (folderId: string) => void;
  onCreateFolder?: (name: string, parentId?: string) => void;
  onRenameFolder?: (folderId: string, name: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onMoveFolder?: (folderId: string, targetId: string) => void;
  expandedFolders?: string[];
  onExpandFolder?: (folderIds: string[]) => void;
  showActions?: boolean;
  draggable?: boolean;
}

export interface MediaPreviewProps extends BaseComponentProps {
  file: MediaFile;
  visible: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  showActions?: boolean;
  onEdit?: (file: MediaFile) => void;
  onDelete?: (file: MediaFile) => void;
  onDownload?: (file: MediaFile) => void;
}

// =============================================
// USER COMPONENT TYPES
// =============================================

export interface UserCardProps extends BaseComponentProps {
  user: User;
  variant?: 'default' | 'compact' | 'detailed';
  showRole?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
  loading?: boolean;
}

export interface UserAvatarProps extends BaseComponentProps {
  user: User;
  size?: ComponentSize | number;
  showName?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
  clickable?: boolean;
  onClick?: (user: User) => void;
}

export interface RoleSelectProps extends BaseComponentProps {
  value?: string;
  onChange?: (role: string) => void;
  disabled?: boolean;
  size?: ComponentSize;
  allowedRoles?: string[];
  showDescription?: boolean;
}

// =============================================
// LAYOUT COMPONENT TYPES
// =============================================

export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  width?: number;
  collapsedWidth?: number;
  theme?: 'light' | 'dark';
  position?: 'left' | 'right';
}

export interface HeaderProps extends BaseComponentProps {
  user?: User;
  onUserMenuClick?: (action: string) => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  showNotifications?: boolean;
  notifications?: any[];
  onNotificationClick?: (notification: any) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

// =============================================
// MODAL & DIALOG TYPES
// =============================================

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  footer?: ReactNode;
  loading?: boolean;
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// =============================================
// SEARCH & FILTER TYPES
// =============================================

export interface SearchBarProps extends BaseComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  size?: ComponentSize;
  showFilters?: boolean;
  filters?: FilterConfig[];
  onFiltersChange?: (filters: Record<string, any>) => void;
  loading?: boolean;
  clearable?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiSelect' | 'date' | 'dateRange' | 'number' | 'text';
  options?: SelectOption[];
  placeholder?: string;
  defaultValue?: any;
}

// =============================================
// EXPORT COMPONENT PROPS TYPE
// =============================================

export type ComponentProps<T extends keyof JSX.IntrinsicElements> = 
  JSX.IntrinsicElements[T] & BaseComponentProps;
