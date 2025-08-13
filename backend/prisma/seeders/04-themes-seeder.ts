/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SeededUsers } from './01-users-seeder';

export async function seedThemes(prisma: PrismaClient, _users: SeededUsers) {
  console.log('  🎨 Creating themes...');
  
  const themes = await Promise.all([
    prisma.theme.create({
      data: {
        name: 'Default Theme',
        description: 'Default neutral theme for JA-CMS',
        category: 'dashboard',
        isActive: true,
        isDefault: true,
        colors: JSON.stringify({
          primary: '#64748b',
          secondary: '#94a3b8',
          background: '#ffffff'
        }),
        typography: JSON.stringify({
          fontFamily: 'Inter',
          fontSize: { base: '1rem', lg: '1.125rem' }
        }),
        spacing: JSON.stringify({
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem'
        }),
        borderRadius: JSON.stringify({
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem'
        })
      }
    })
  ]);

  return { themes: themes.length, widgets: 0 };
}

export type SeededThemes = Awaited<ReturnType<typeof seedThemes>>;
