import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateMenuData {
  name: string;
  slug?: string;
  location: string;
  items: MenuItemData[];
}

interface MenuItemData {
  title: string;
  url?: string;
  target?: string;
  order?: number;
  isActive?: boolean;
  parentId?: string | null;
}

interface UpdateMenuData {
  name?: string;
  slug?: string;
  location?: string;
  items?: MenuItemData[];
}

export class MenuService {
  // Helper function to generate slug from name
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Get all menus
  static async getAllMenus(location?: string) {
    try {
      const where: { location?: string } = {};
      
      if (location) {
        where.location = location;
      }

      const menus = await prisma.menu.findMany({
        where,
        include: {
          items: {
            orderBy: {
              order: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return menus;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get menus');
    }
  }

  // Get menu by ID
  static async getMenuById(id: string) {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: {
          items: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      return menu;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get menu');
    }
  }

  // Create menu
  static async createMenu(data: CreateMenuData) {
    try {
      const menu = await prisma.menu.create({
        data: {
          name: data.name,

          location: data.location,
          items: {
            create: data.items.map((item, index) => ({
              title: item.title,
              url: item.url,
              target: item.target || '_self',
              order: item.order || index + 1,
              isActive: item.isActive ?? true,
              parentId: item.parentId || null
            }))
          }
        },
        include: {
          items: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      return menu;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to create menu');
    }
  }

  // Update menu
  static async updateMenu(id: string, updateData: UpdateMenuData) {
    try {
      const { items, ...menuData } = updateData;

      const menu = await prisma.menu.update({
        where: { id },
        data: {
          ...menuData,
          ...(menuData.name && !menuData.slug && {
            slug: this.generateSlug(menuData.name)
          }),
          ...(items && {
            items: {
              deleteMany: {},
              create: items.map((item: MenuItemData, index: number) => ({
                title: item.title,
                url: item.url,
                target: item.target || '_self',
                order: item.order || index + 1,
                isActive: item.isActive ?? true,
                parentId: item.parentId || null
              }))
            }
          })
        },
        include: {
          items: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      return menu;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to update menu');
    }
  }

  // Delete menu
  static async deleteMenu(id: string) {
    try {
      const menu = await prisma.menu.delete({
        where: { id }
      });

      return menu;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to delete menu');
    }
  }

  // Get menu by location
  static async getMenuByLocation(location: string) {
    try {
      const menu = await prisma.menu.findFirst({
        where: { location },
        include: {
          items: {
            where: {
              isActive: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      return menu;
    } catch (error) {
      // Log error for debugging
      throw new Error('Failed to get menu by location');
    }
  }
}
