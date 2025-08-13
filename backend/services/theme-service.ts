import { ThemeModel, ThemeData } from '../models/theme-model';
import { z } from 'zod';

// Validation schemas
const colorSchema = z.object({
  primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid primary color format'),
  secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid secondary color format'),
  accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid accent color format'),
  background: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid background color format'),
  surface: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid surface color format'),
  text: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid text color format'),
  textSecondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid textSecondary color format'),
  border: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid border color format'),
  success: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid success color format'),
  warning: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid warning color format'),
  error: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid error color format'),
});

const fontSizeSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  base: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
  '3xl': z.string(),
});

const typographySchema = z.object({
  fontFamily: z.string(),
  fontSize: fontSizeSchema,
});

const spacingSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
});

const borderRadiusSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  full: z.string(),
});

const metadataSchema = z.object({
  author: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  previewImage: z.string().optional(),
});

const createThemeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  category: z.enum(['dashboard', 'creative', 'light', 'dark']),
  isActive: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  colors: colorSchema,
  typography: typographySchema,
  spacing: spacingSchema,
  borderRadius: borderRadiusSchema,
  metadata: metadataSchema.optional(),
});

const updateThemeSchema = createThemeSchema.partial();

// Type for theme input data
type CreateThemeInput = z.infer<typeof createThemeSchema>;
type UpdateThemeInput = z.infer<typeof updateThemeSchema>;

// Type for export data
type ThemeExportData = {
  version: string;
  exportDate: string;
  theme: {
    name: string;
    description: string;
    category: string;
    colors: ThemeData['colors'];
    typography: ThemeData['typography'];
    spacing: ThemeData['spacing'];
    borderRadius: ThemeData['borderRadius'];
    metadata?: ThemeData['metadata'];
  };
};

// Type for import data
type ThemeImportData = {
  theme: {
    name: string;
    description?: string;
    category?: string;
    colors: ThemeData['colors'];
    typography: ThemeData['typography'];
    spacing: ThemeData['spacing'];
    borderRadius: ThemeData['borderRadius'];
    metadata?: ThemeData['metadata'];
  };
};

export class ThemeService {
  // Get all themes
  static async getAllThemes(): Promise<ThemeData[]> {
    try {
      return await ThemeModel.getAllThemes();
    } catch (error) {
      throw new Error(`Failed to get themes: ${error}`);
    }
  }

  // Get theme by ID
  static async getThemeById(id: string): Promise<ThemeData | null> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid theme ID');
      }

      return await ThemeModel.getThemeById(id);
    } catch (error) {
      throw new Error(`Failed to get theme: ${error}`);
    }
  }

  // Get active theme
  static async getActiveTheme(): Promise<ThemeData | null> {
    try {
      return await ThemeModel.getActiveTheme();
    } catch (error) {
      throw new Error(`Failed to get active theme: ${error}`);
    }
  }

  // Get themes by category
  static async getThemesByCategory(category: string): Promise<ThemeData[]> {
    try {
      if (!['dashboard', 'creative', 'light', 'dark'].includes(category)) {
        throw new Error('Invalid category');
      }

      return await ThemeModel.getThemesByCategory(category);
    } catch (error) {
      throw new Error(`Failed to get themes by category: ${error}`);
    }
  }

  // Create new theme
  static async createTheme(themeData: CreateThemeInput): Promise<ThemeData> {
    try {
      // Validate input
      const validatedData = createThemeSchema.parse(themeData);

      // Check if theme name already exists
      const existingThemes = await ThemeModel.getAllThemes();
      const nameExists = existingThemes.some(theme => theme.name === validatedData.name);
      
      if (nameExists) {
        throw new Error('Theme name already exists');
      }

      // If this is the first theme, make it default and active
      if (existingThemes.length === 0) {
        validatedData.isDefault = true;
        validatedData.isActive = true;
      }

      // If setting as active, deactivate other themes
      if (validatedData.isActive) {
        await ThemeModel.setActiveTheme('temp'); // This will deactivate all themes
      }

      return await ThemeModel.createTheme({
        name: validatedData.name ?? 'Default Theme',
        description: validatedData.description ?? 'Default theme description',
        category: validatedData.category ?? 'dashboard',
        isActive: validatedData.isActive ?? false,
        isDefault: validatedData.isDefault ?? false,
        colors: {
          primary: validatedData.colors?.primary ?? '#000000',
          secondary: validatedData.colors?.secondary ?? '#6B7280',
          accent: validatedData.colors?.accent ?? '#9CA3AF',
          background: validatedData.colors?.background ?? '#FFFFFF',
          surface: validatedData.colors?.surface ?? '#F9FAFB',
          text: validatedData.colors?.text ?? '#111827',
          textSecondary: validatedData.colors?.textSecondary ?? '#6B7280',
          border: validatedData.colors?.border ?? '#E5E7EB',
          success: validatedData.colors?.success ?? '#10B981',
          warning: validatedData.colors?.warning ?? '#F59E0B',
          error: validatedData.colors?.error ?? '#EF4444'
        },
        typography: {
          fontFamily: validatedData.typography?.fontFamily ?? 'Inter',
          fontSize: {
            xs: validatedData.typography?.fontSize?.xs ?? '0.75rem',
            sm: validatedData.typography?.fontSize?.sm ?? '0.875rem',
            base: validatedData.typography?.fontSize?.base ?? '1rem',
            lg: validatedData.typography?.fontSize?.lg ?? '1.125rem',
            xl: validatedData.typography?.fontSize?.xl ?? '1.25rem',
            '2xl': validatedData.typography?.fontSize?.['2xl'] ?? '1.5rem',
            '3xl': validatedData.typography?.fontSize?.['3xl'] ?? '1.875rem'
          }
        },
        spacing: {
          xs: validatedData.spacing?.xs ?? '0.25rem',
          sm: validatedData.spacing?.sm ?? '0.5rem',
          md: validatedData.spacing?.md ?? '1rem',
          lg: validatedData.spacing?.lg ?? '1.5rem',
          xl: validatedData.spacing?.xl ?? '2rem'
        },
        borderRadius: {
          sm: validatedData.borderRadius?.sm ?? '0.125rem',
          md: validatedData.borderRadius?.md ?? '0.375rem',
          lg: validatedData.borderRadius?.lg ?? '0.5rem',
          full: validatedData.borderRadius?.full ?? '9999px'
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to create theme: ${error}`);
    }
  }

  // Update theme
  static async updateTheme(id: string, themeData: UpdateThemeInput): Promise<ThemeData> {
    try {
      // Validate input
      const validatedData = updateThemeSchema.parse(themeData);

      // Check if theme exists
      const existingTheme = await ThemeModel.getThemeById(id);
      if (!existingTheme) {
        throw new Error('Theme not found');
      }

      // Check if name is being changed and if it conflicts with existing themes
      if (validatedData.name && validatedData.name !== existingTheme.name) {
        const allThemes = await ThemeModel.getAllThemes();
        const nameExists = allThemes.some(theme => 
          theme.name === validatedData.name && theme.id !== id
        );
        
        if (nameExists) {
          throw new Error('Theme name already exists');
        }
      }

      // If setting as active, deactivate other themes
      if (validatedData.isActive) {
        await ThemeModel.setActiveTheme('temp'); // This will deactivate all themes
      }

      const updateData: Partial<Omit<ThemeData, 'id' | 'createdAt' | 'updatedAt'>> = {};

      // Only include properties that are actually provided
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.category !== undefined) updateData.category = validatedData.category;
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
      if (validatedData.isDefault !== undefined) updateData.isDefault = validatedData.isDefault;
      if (validatedData.metadata !== undefined) updateData.metadata = validatedData.metadata;

      if (validatedData.colors) {
        updateData.colors = {
          primary: validatedData.colors.primary,
          secondary: validatedData.colors.secondary,
          accent: validatedData.colors.accent,
          background: validatedData.colors.background,
          surface: validatedData.colors.surface,
          text: validatedData.colors.text,
          textSecondary: validatedData.colors.textSecondary,
          border: validatedData.colors.border,
          success: validatedData.colors.success,
          warning: validatedData.colors.warning,
          error: validatedData.colors.error
        };
      }

      if (validatedData.typography) {
        updateData.typography = {
          fontFamily: validatedData.typography.fontFamily ?? 'Inter',
          fontSize: {
            xs: validatedData.typography.fontSize?.xs ?? '0.75rem',
            sm: validatedData.typography.fontSize?.sm ?? '0.875rem',
            base: validatedData.typography.fontSize?.base ?? '1rem',
            lg: validatedData.typography.fontSize?.lg ?? '1.125rem',
            xl: validatedData.typography.fontSize?.xl ?? '1.25rem',
            '2xl': validatedData.typography.fontSize?.['2xl'] ?? '1.5rem',
            '3xl': validatedData.typography.fontSize?.['3xl'] ?? '1.875rem'
          }
        };
      }

      if (validatedData.spacing) {
        updateData.spacing = {
          xs: validatedData.spacing.xs ?? '0.25rem',
          sm: validatedData.spacing.sm ?? '0.5rem',
          md: validatedData.spacing.md ?? '1rem',
          lg: validatedData.spacing.lg ?? '1.5rem',
          xl: validatedData.spacing.xl ?? '2rem'
        };
      }

      if (validatedData.borderRadius) {
        updateData.borderRadius = {
          sm: validatedData.borderRadius.sm ?? '0.125rem',
          md: validatedData.borderRadius.md ?? '0.375rem',
          lg: validatedData.borderRadius.lg ?? '0.5rem',
          full: validatedData.borderRadius.full ?? '9999px'
        };
      }

      return await ThemeModel.updateTheme(id, updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to update theme: ${error}`);
    }
  }

  // Delete theme
  static async deleteTheme(id: string): Promise<void> {
    try {
      // Check if theme exists
      const existingTheme = await ThemeModel.getThemeById(id);
      if (!existingTheme) {
        throw new Error('Theme not found');
      }

      // Prevent deletion of default theme
      if (existingTheme.isDefault) {
        throw new Error('Cannot delete default theme');
      }

      // If deleting active theme, set another theme as active
      if (existingTheme.isActive) {
        const otherThemes = await ThemeModel.getAllThemes();
        const nonDefaultThemes = otherThemes.filter(theme => 
          theme.id !== id && !theme.isDefault
        );
        
        if (nonDefaultThemes.length > 0) {
          await ThemeModel.setActiveTheme(nonDefaultThemes[0].id);
        } else {
          // If no other themes, set default theme as active
          const defaultTheme = otherThemes.find(theme => theme.isDefault);
          if (defaultTheme) {
            await ThemeModel.setActiveTheme(defaultTheme.id);
          }
        }
      }

      await ThemeModel.deleteTheme(id);
    } catch (error) {
      throw new Error(`Failed to delete theme: ${error}`);
    }
  }

  // Set theme as active
  static async setActiveTheme(id: string): Promise<void> {
    try {
      // Check if theme exists
      const existingTheme = await ThemeModel.getThemeById(id);
      if (!existingTheme) {
        throw new Error('Theme not found');
      }

      await ThemeModel.setActiveTheme(id);
    } catch (error) {
      throw new Error(`Failed to set active theme: ${error}`);
    }
  }

  // Get theme statistics
  static async getThemeStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }> {
    try {
      return await ThemeModel.getThemeStats();
    } catch (error) {
      throw new Error(`Failed to get theme statistics: ${error}`);
    }
  }

  // Validate theme data
  static validateThemeData(themeData: CreateThemeInput): { isValid: boolean; errors: string[] } {
    try {
      createThemeSchema.parse(themeData);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message),
        };
      }
      return {
        isValid: false,
        errors: ['Unknown validation error'],
      };
    }
  }

  // Export theme data
  static async exportTheme(id: string): Promise<ThemeExportData> {
    try {
      const theme = await ThemeModel.getThemeById(id);
      if (!theme) {
        throw new Error('Theme not found');
      }

      return {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        theme: {
          name: theme.name,
          description: theme.description,
          category: theme.category,
          colors: theme.colors,
          typography: theme.typography,
          spacing: theme.spacing,
          borderRadius: theme.borderRadius,
          metadata: theme.metadata,
        },
      };
    } catch (error) {
      throw new Error(`Failed to export theme: ${error}`);
    }
  }

  // Import theme data
  static async importTheme(importData: ThemeImportData): Promise<ThemeData> {
    try {
      // Validate import data structure
      if (!importData.theme || !importData.theme.name) {
        throw new Error('Invalid import data format');
      }

      const themeData: CreateThemeInput = {
        name: importData.theme.name,
        description: importData.theme.description || 'Imported theme',
        category: (importData.theme.category as 'dashboard' | 'creative' | 'light' | 'dark') || 'dashboard',
        isActive: false,
        isDefault: false,
        colors: importData.theme.colors,
        typography: importData.theme.typography,
        spacing: importData.theme.spacing,
        borderRadius: importData.theme.borderRadius,
        metadata: importData.theme.metadata,
      };

      // Validate the imported theme data
      const validation = this.validateThemeData(themeData);
      if (!validation.isValid) {
        throw new Error(`Invalid theme data: ${validation.errors.join(', ')}`);
      }

      return await this.createTheme(themeData);
    } catch (error) {
      throw new Error(`Failed to import theme: ${error}`);
    }
  }
}
