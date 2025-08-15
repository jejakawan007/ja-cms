import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SEOMetadataData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: any;
  metaRobots?: string;
}

export interface SEOAuditResult {
  score: number;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    action?: string;
  }>;
}

export interface SitemapData {
  url: string;
  pageType: string;
  priority: number;
  changeFreq: string;
  lastModified: Date;
}

export class EnhancedSEOService {
  /**
   * Create or update SEO metadata
   */
  async createSEOMetadata(data: {
    postId?: string;
    categoryId?: string;
    pageType: string;
    metadata: SEOMetadataData;
  }) {
    // For now, return a mock response
    return {
      id: 'mock-id',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Get SEO metadata
   */
  async getSEOMetadata(_postId?: string, _categoryId?: string, _pageType?: string) {
    // For now, return null
    return null;
  }

  /**
   * Perform SEO audit
   */
  async performSEOAudit(data: {
    postId?: string;
    categoryId?: string;
    auditType: string;
    userId: string;
  }): Promise<SEOAuditResult> {
    let content: any = null;
    let url: string = '';

    if (data.postId) {
      const post = await prisma.post.findUnique({
        where: { id: data.postId }
      });
      if (post) {
        content = post;
        url = `/posts/${post.slug}`;
      }
    } else if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });
      if (category) {
        content = category;
        url = `/categories/${category.slug}`;
      }
    }

    if (!content) {
      throw new Error('Content not found');
    }

    const auditResult = await this.analyzeSEOContent(content, url, data.auditType);

    // Store audit result (mock for now)
    // const _mockAudit = {
    //   id: 'mock-audit-id',
    //   postId: data.postId,
    //   categoryId: data.categoryId,
    //   auditType: data.auditType,
    //   score: auditResult.score,
    //   issues: auditResult.issues,
    //   recommendations: auditResult.recommendations,
    //   auditDate: new Date(),
    //   createdBy: data.userId,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // };

    return auditResult;
  }

  /**
   * Analyze SEO content
   */
  private async analyzeSEOContent(content: any, url: string, auditType: string): Promise<SEOAuditResult> {
    const issues: any[] = [];
    const recommendations: any[] = [];
    let score = 100;

    // Basic SEO checks
    if (auditType === 'onpage' || auditType === 'content') {
      // Title analysis
      if (!content.title || content.title.length < 10) {
        issues.push({
          type: 'title',
          severity: 'error',
          message: 'Title is too short or missing',
          suggestion: 'Title should be between 50-60 characters'
        });
        score -= 15;
      } else if (content.title.length > 60) {
        issues.push({
          type: 'title',
          severity: 'warning',
          message: 'Title is too long',
          suggestion: 'Title should be between 50-60 characters'
        });
        score -= 5;
      }

      // Description analysis
      if (!content.description && !content.metaDescription) {
        issues.push({
          type: 'description',
          severity: 'error',
          message: 'Meta description is missing',
          suggestion: 'Add a compelling meta description'
        });
        score -= 10;
      } else {
        const desc = content.description || content.metaDescription;
        if (desc.length < 120) {
          issues.push({
            type: 'description',
            severity: 'warning',
            message: 'Meta description is too short',
            suggestion: 'Description should be between 120-160 characters'
          });
          score -= 5;
        } else if (desc.length > 160) {
          issues.push({
            type: 'description',
            severity: 'warning',
            message: 'Meta description is too long',
            suggestion: 'Description should be between 120-160 characters'
          });
          score -= 3;
        }
      }

      // Content analysis for posts
      if (content.content) {
        const contentLength = content.content.length;
        if (contentLength < 300) {
          issues.push({
            type: 'content',
            severity: 'warning',
            message: 'Content is too short',
            suggestion: 'Aim for at least 300 words of quality content'
          });
          score -= 10;
        }

        // Check for headings
        const hasHeadings = /<h[1-6]/.test(content.content);
        if (!hasHeadings) {
          issues.push({
            type: 'content',
            severity: 'warning',
            message: 'No headings found in content',
            suggestion: 'Use H1, H2, H3 tags to structure your content'
          });
          score -= 5;
        }

        // Check for images
        const hasImages = /<img/.test(content.content);
        if (!hasImages) {
          recommendations.push({
            type: 'content',
            priority: 'medium',
            message: 'Consider adding images to improve engagement',
            action: 'Add relevant images with alt text'
          });
        }
      }
    }

    // Technical SEO checks
    if (auditType === 'technical' || auditType === 'onpage') {
      // URL structure
      if (url.includes('_') || url.includes('CAPS')) {
        issues.push({
          type: 'url',
          severity: 'warning',
          message: 'URL contains underscores or uppercase letters',
          suggestion: 'Use hyphens and lowercase letters in URLs'
        });
        score -= 5;
      }
    }

    // Generate recommendations
    if (score < 80) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        message: 'Focus on improving basic SEO elements',
        action: 'Address critical issues first'
      });
    }

    if (!content.keywords && !content.metaKeywords) {
      recommendations.push({
        type: 'keywords',
        priority: 'medium',
        message: 'Consider adding target keywords',
        action: 'Research and add relevant keywords'
      });
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Generate sitemap
   */
  async generateSitemap(): Promise<string> {
    // Get all active posts
    const posts = await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true }
    });

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true }
    });

    // Create sitemap XML manually
    const baseUrl = process.env['SITE_URL'] || 'https://example.com';
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    sitemap += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>${baseUrl}/posts</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemap += `  <url>\n    <loc>${baseUrl}/categories</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;

    // Add posts
    posts.forEach(post => {
      sitemap += `  <url>\n    <loc>${baseUrl}/posts/${post.slug}</loc>\n    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // Add categories
    categories.forEach(category => {
      sitemap += `  <url>\n    <loc>${baseUrl}/categories/${category.slug}</loc>\n    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    sitemap += '</urlset>';
    return sitemap;
  }

  /**
   * Generate structured data (JSON-LD)
   */
  generateStructuredData(content: any, type: string): any {
    const baseUrl = process.env['SITE_URL'] || 'https://example.com';

    switch (type) {
      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: content.title,
          description: content.description || content.metaDescription,
          image: content.featuredImage || `${baseUrl}/default-image.jpg`,
          author: {
            '@type': 'Person',
            name: content.author?.firstName + ' ' + content.author?.lastName
          },
          publisher: {
            '@type': 'Organization',
            name: process.env['SITE_NAME'] || 'JA-CMS',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`
            }
          },
          datePublished: content.publishedAt,
          dateModified: content.updatedAt,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/posts/${content.slug}`
          }
        };

      case 'category':
        return {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: content.name,
          description: content.description,
          url: `${baseUrl}/categories/${content.slug}`,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: content.posts?.map((post: any, index: number) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Article',
                headline: post.title,
                url: `${baseUrl}/posts/${post.slug}`
              }
            })) || []
          }
        };

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: process.env['SITE_NAME'] || 'JA-CMS',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        };

      default:
        return null;
    }
  }

  /**
   * Get SEO audit history
   */
  async getSEOAuditHistory(_postId?: string, _categoryId?: string, _limit: number = 20) {
    // For now, return empty array
    return [];
  }

  /**
   * Get SEO statistics
   */
  async getSEOStatistics() {
    // For now, return mock statistics
    return {
      totalMetadata: 0,
      totalAudits: 0,
      averageScore: 0,
      recentAudits: 0,
      scoreDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      }
    };
  }

  /**
   * Bulk update SEO metadata
   */
  async bulkUpdateSEOMetadata(updates: Array<{
    postId?: string;
    categoryId?: string;
    pageType: string;
    metadata: SEOMetadataData;
  }>) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.createSEOMetadata(update);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }
}

export default new EnhancedSEOService();
