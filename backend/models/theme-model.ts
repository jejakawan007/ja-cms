import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ThemeData {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  isDefault: boolean;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
    previewImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ThemeModel {
  // Get all themes
  static async getAllThemes(): Promise<ThemeData[]> {
    try {
      const themes = await prisma.theme.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return themes.map(theme => ({
        ...theme,
        colors: JSON.parse(theme.colors as string),
        typography: JSON.parse(theme.typography as string),
        spacing: JSON.parse(theme.spacing as string),
        borderRadius: JSON.parse(theme.borderRadius as string),
        metadata: theme.metadata ? JSON.parse(theme.metadata as string) : undefined,
      }));
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get themes');
    }
  }

  // Get theme by ID
  static async getThemeById(id: string): Promise<ThemeData | null> {
    try {
      const theme = await prisma.theme.findUnique({
        where: { id },
      });

      if (!theme) return null;

      return {
        ...theme,
        colors: JSON.parse(theme.colors as string),
        typography: JSON.parse(theme.typography as string),
        spacing: JSON.parse(theme.spacing as string),
        borderRadius: JSON.parse(theme.borderRadius as string),
        metadata: theme.metadata ? JSON.parse(theme.metadata as string) : undefined,
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get theme');
    }
  }

  // Get active theme
  static async getActiveTheme(): Promise<ThemeData | null> {
    try {
      const theme = await prisma.theme.findFirst({
        where: { isActive: true },
      });

      if (!theme) return null;

      return {
        ...theme,
        colors: JSON.parse(theme.colors as string),
        typography: JSON.parse(theme.typography as string),
        spacing: JSON.parse(theme.spacing as string),
        borderRadius: JSON.parse(theme.borderRadius as string),
        metadata: theme.metadata ? JSON.parse(theme.metadata as string) : undefined,
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get active theme');
    }
  }

  // Get themes by category
  static async getThemesByCategory(category: string): Promise<ThemeData[]> {
    try {
      const themes = await prisma.theme.findMany({
        where: { category: category as string },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return themes.map(theme => ({
        ...theme,
        colors: JSON.parse(theme.colors as string),
        typography: JSON.parse(theme.typography as string),
        spacing: JSON.parse(theme.spacing as string),
        borderRadius: JSON.parse(theme.borderRadius as string),
        metadata: theme.metadata ? JSON.parse(theme.metadata as string) : undefined,
      }));
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get themes by category');
    }
  }

  // Create new theme
  static async createTheme(themeData: Omit<ThemeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThemeData> {
    try {
      const theme = await prisma.theme.create({
        data: {
          name: themeData.name,
          description: themeData.description,
          category: themeData.category,
          isActive: themeData.isActive,
          isDefault: themeData.isDefault,
          colors: JSON.stringify(themeData.colors),
          typography: JSON.stringify(themeData.typography),
          spacing: JSON.stringify(themeData.spacing),
          borderRadius: JSON.stringify(themeData.borderRadius),
          metadata: themeData.metadata ? JSON.stringify(themeData.metadata) : null,
        },
      });

      return {
        ...theme,
        colors: JSON.parse(theme.colors as string),
        typography: JSON.parse(theme.typography as string),
        spacing: JSON.parse(theme.spacing as string),
        borderRadius: JSON.parse(theme.borderRadius as string),
        metadata: theme.metadata ? JSON.parse(theme.metadata as string) : undefined,
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to create theme');
    }
  }

  // Update theme
  static async updateTheme(id: string, themeData: Partial<Omit<ThemeData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ThemeData> {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (themeData.name) updateData['name'] = themeData.name;
      if (themeData.description) updateData['description'] = themeData.description;
      if (themeData.category) updateData['category'] = themeData.category;
      if (themeData.isActive !== undefined) updateData['isActive'] = themeData.isActive;
      if (themeData.isDefault !== undefined) updateData['isDefault'] = themeData.isDefault;
      if (themeData.colors) updateData['colors'] = JSON.stringify(themeData.colors);
      if (themeData.typography) updateData['typography'] = JSON.stringify(themeData.typography);
      if (themeData.spacing) updateData['spacing'] = JSON.stringify(themeData.spacing);
      if (themeData.borderRadius) updateData['borderRadius'] = JSON.stringify(themeData.borderRadius);
      if (themeData.metadata) updateData['metadata'] = JSON.stringify(themeData.metadata);

      const theme = await prisma.theme.update({
        where: { id },
        data: updateData,
      });

      return {
        ...theme,
        colors: JSON.parse(theme.colors as string),
        typography: JSON.parse(theme.typography as string),
        spacing: JSON.parse(theme.spacing as string),
        borderRadius: JSON.parse(theme.borderRadius as string),
        metadata: theme.metadata ? JSON.parse(theme.metadata as string) : undefined,
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to update theme');
    }
  }

  // Delete theme
  static async deleteTheme(id: string): Promise<void> {
    try {
      await prisma.theme.delete({
        where: { id },
      });
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to delete theme');
    }
  }

  // Set theme as active
  static async setActiveTheme(id: string): Promise<void> {
    try {
      // Set all themes as inactive
      await prisma.theme.updateMany({
        data: { isActive: false },
      });

      // Set the specified theme as active
      await prisma.theme.update({
        where: { id },
        data: { isActive: true },
      });
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to set active theme');
    }
  }

  // Get theme statistics
  static async getThemeStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const [total, active, byCategory] = await Promise.all([
        prisma.theme.count(),
        prisma.theme.count({ where: { isActive: true } }),
        prisma.theme.groupBy({
          by: ['category'],
          _count: { category: true },
        }),
      ]);

      const categoryStats: Record<string, number> = {};
      byCategory.forEach(item => {
        categoryStats[item.category] = item._count.category;
      });

      return {
        total,
        active,
        byCategory: categoryStats,
      };
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get theme statistics');
    }
  }
}
