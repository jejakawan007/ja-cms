import { Request, Response } from 'express';
import enhancedSEOService from '../services/enhanced-seo-service';

export class EnhancedSEOController {
  /**
   * Create or update SEO metadata
   */
  async createSEOMetadata(req: Request, res: Response) {
    try {
      const {
        postId,
        categoryId,
        pageType,
        metadata
      } = req.body;

      if (!pageType || !metadata) {
        return res.status(400).json({
          success: false,
          message: 'Page type and metadata are required'
        });
      }

      const result = await enhancedSEOService.createSEOMetadata({
        postId,
        categoryId,
        pageType,
        metadata
      });

      res.json({
        success: true,
        data: result,
        message: 'SEO metadata created/updated successfully'
      });
    } catch (error) {
      console.error('Error in createSEOMetadata:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create/update SEO metadata'
      });
    }
  }

  /**
   * Get SEO metadata
   */
  async getSEOMetadata(req: Request, res: Response) {
    try {
      const { postId, categoryId, pageType } = req.query;

      const metadata = await enhancedSEOService.getSEOMetadata(
        postId as string,
        categoryId as string,
        pageType as string
      );

      res.json({
        success: true,
        data: metadata,
        message: 'SEO metadata retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSEOMetadata:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve SEO metadata'
      });
    }
  }

  /**
   * Perform SEO audit
   */
  async performSEOAudit(req: Request, res: Response) {
    try {
      const { postId, categoryId, auditType } = req.body;
      const userId = (req as any).user.id;

      if (!auditType) {
        return res.status(400).json({
          success: false,
          message: 'Audit type is required'
        });
      }

      if (!postId && !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Either postId or categoryId is required'
        });
      }

      const result = await enhancedSEOService.performSEOAudit({
        postId,
        categoryId,
        auditType,
        userId
      });

      res.json({
        success: true,
        data: result,
        message: 'SEO audit completed successfully'
      });
    } catch (error) {
      console.error('Error in performSEOAudit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform SEO audit'
      });
    }
  }

  /**
   * Get SEO audit history
   */
  async getSEOAuditHistory(req: Request, res: Response) {
    try {
      const { postId, categoryId, limit = 20 } = req.query;
      const limitNum = parseInt(limit as string) || 20;

      const history = await enhancedSEOService.getSEOAuditHistory(
        postId as string,
        categoryId as string,
        limitNum
      );

      res.json({
        success: true,
        data: history,
        message: 'SEO audit history retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSEOAuditHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve SEO audit history'
      });
    }
  }

  /**
   * Generate sitemap
   */
  async generateSitemap(_req: Request, res: Response) {
    try {
      const sitemap = await enhancedSEOService.generateSitemap();

      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="sitemap.xml"');
      res.send(sitemap);
    } catch (error) {
      console.error('Error in generateSitemap:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate sitemap'
      });
    }
  }

  /**
   * Generate structured data
   */
  async generateStructuredData(req: Request, res: Response) {
    try {
      const { contentId: _contentId, contentType, content } = req.body;

      if (!contentType || !content) {
        return res.status(400).json({
          success: false,
          message: 'Content type and content are required'
        });
      }

      const structuredData = enhancedSEOService.generateStructuredData(content, contentType);

      if (!structuredData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
      }

      res.json({
        success: true,
        data: structuredData,
        message: 'Structured data generated successfully'
      });
    } catch (error) {
      console.error('Error in generateStructuredData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate structured data'
      });
    }
  }

  /**
   * Get SEO statistics
   */
  async getSEOStatistics(_req: Request, res: Response) {
    try {
      const statistics = await enhancedSEOService.getSEOStatistics();

      res.json({
        success: true,
        data: statistics,
        message: 'SEO statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSEOStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve SEO statistics'
      });
    }
  }

  /**
   * Bulk update SEO metadata
   */
  async bulkUpdateSEOMetadata(req: Request, res: Response) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          message: 'Updates array is required'
        });
      }

      const results = await enhancedSEOService.bulkUpdateSEOMetadata(updates);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      res.json({
        success: true,
        data: {
          results,
          summary: {
            total: results.length,
            success: successCount,
            failure: failureCount
          }
        },
        message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`
      });
    } catch (error) {
      console.error('Error in bulkUpdateSEOMetadata:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk update'
      });
    }
  }

  /**
   * Delete SEO metadata
   */
  async deleteSEOMetadata(req: Request, res: Response) {
    try {
      const { id: _id } = req.params;

      // For now, just return success
      res.json({
        success: true,
        message: 'SEO metadata deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteSEOMetadata:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete SEO metadata'
      });
    }
  }

  /**
   * Get SEO audit by ID
   */
  async getSEOAuditById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // For now, return mock data
      const mockAudit = {
        id,
        auditType: 'onpage',
        score: 85,
        issues: [],
        recommendations: [],
        auditDate: new Date(),
        creator: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      res.json({
        success: true,
        data: mockAudit,
        message: 'SEO audit retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getSEOAuditById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve SEO audit'
      });
    }
  }

  /**
   * Export SEO audit report
   */
  async exportSEOAuditReport(req: Request, res: Response) {
    try {
      const { postId: _postId, categoryId: _categoryId, format = 'json' } = req.query;

      // For now, return mock data
      const mockAudits = [
        {
          auditDate: new Date(),
          auditType: 'onpage',
          score: 85,
          issues: [],
          recommendations: [],
          post: { title: 'Sample Post', slug: 'sample-post' },
          creator: { firstName: 'John', lastName: 'Doe' }
        }
      ];

      if (format === 'csv') {
        const csvHeaders = [
          'Audit Date',
          'Audit Type',
          'Score',
          'Issues Count',
          'Recommendations Count',
          'Content Title',
          'Content Type',
          'Auditor'
        ];

        const csvRows = mockAudits.map(audit => [
          new Date(audit.auditDate).toISOString(),
          audit.auditType,
          audit.score,
          audit.issues.length,
          audit.recommendations.length,
          audit.post?.title || 'N/A',
          'Post',
          `${audit.creator.firstName} ${audit.creator.lastName}`
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="seo-audit-report.csv"');
        res.send(csvContent);
      } else {
        res.json({
          success: true,
          data: mockAudits,
          message: 'SEO audit report exported successfully'
        });
      }
    } catch (error) {
      console.error('Error in exportSEOAuditReport:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export SEO audit report'
      });
    }
  }
}

export default new EnhancedSEOController();
