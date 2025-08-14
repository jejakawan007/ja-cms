import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '@/middleware/error-handler';
import { PostStatus } from '@shared/types';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).default('DRAFT'),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination and filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED, SCHEDULED]
 *         description: Filter by status
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const query = querySchema.parse(req.query);
  const skip = (query.page - 1) * query.limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  
  if (query.status) {
    where.status = query.status;
  }
  
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { content: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  // Get posts with relations
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            views: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / query.limit);

  return res.json({
    success: true,
    data: posts,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    },
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Post ID is required' },
    });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
          views: true,
        },
      },
    },
  });

  if (!post) {
    return res.status(404).json({
      success: false,
      error: { message: 'Post not found' },
    });
  }

  return res.json({
    success: true,
    data: post,
  });
}));

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED, SCHEDULED]
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createPostSchema.parse(req.body);
  
  // Check if slug already exists
  const existingPost = await prisma.post.findUnique({
    where: { slug: validatedData.slug },
  });

  if (existingPost) {
    return res.status(400).json({
      success: false,
      error: { message: 'Slug already exists' },
    });
  }

  // TODO: Get current user from auth middleware
  const authorId = 'cme03g5fc0000enkd08xi5kk4'; // Admin user ID from database
  
  // Prepare data for Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postData: any = {
    title: validatedData.title,
    slug: validatedData.slug,
    content: validatedData.content,
    status: validatedData.status,
    authorId,
    publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
  };

  // Add optional fields only if they exist
  if (validatedData.excerpt !== undefined) {
    postData.excerpt = validatedData.excerpt || null;
  }
  if (validatedData.featuredImage !== undefined) {
    postData.featuredImage = validatedData.featuredImage || null;
  }
  if (validatedData.categoryId !== undefined) {
    postData.categoryId = validatedData.categoryId || null;
  }
  if (validatedData.metaTitle !== undefined) {
    postData.metaTitle = validatedData.metaTitle || null;
  }
  if (validatedData.metaDescription !== undefined) {
    postData.metaDescription = validatedData.metaDescription || null;
  }
  if (validatedData.metaKeywords !== undefined) {
    postData.metaKeywords = validatedData.metaKeywords || null;
  }
  if (validatedData.canonicalUrl !== undefined) {
    postData.canonicalUrl = validatedData.canonicalUrl || null;
  }

  const post = await prisma.post.create({
    data: postData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.status(201).json({
    success: true,
    data: post,
    message: 'Post created successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updatePostSchema.parse(req.body);

  if (!id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Post ID is required' },
    });
  }

  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    return res.status(404).json({
      success: false,
      error: { message: 'Post not found' },
    });
  }

  // Check if slug already exists (if slug is being updated)
  if (validatedData.slug && validatedData.slug !== existingPost.slug) {
    const slugExists = await prisma.post.findUnique({
      where: { slug: validatedData.slug },
    });

    if (slugExists) {
      return res.status(400).json({
        success: false,
        error: { message: 'Slug already exists' },
      });
    }
  }

  // Prepare data for Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};

  // Add fields only if they are provided
  if (validatedData.title !== undefined) updateData.title = validatedData.title;
  if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
  if (validatedData.content !== undefined) updateData.content = validatedData.content;
  if (validatedData.status !== undefined) updateData.status = validatedData.status;
  if (validatedData.excerpt !== undefined) updateData.excerpt = validatedData.excerpt || null;
  if (validatedData.featuredImage !== undefined) updateData.featuredImage = validatedData.featuredImage || null;
  if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId || null;
  if (validatedData.metaTitle !== undefined) updateData.metaTitle = validatedData.metaTitle || null;
  if (validatedData.metaDescription !== undefined) updateData.metaDescription = validatedData.metaDescription || null;
  if (validatedData.metaKeywords !== undefined) updateData.metaKeywords = validatedData.metaKeywords || null;
  if (validatedData.canonicalUrl !== undefined) updateData.canonicalUrl = validatedData.canonicalUrl || null;

  // Handle publishedAt
  if (validatedData.status === 'PUBLISHED' && !existingPost.publishedAt) {
    updateData.publishedAt = new Date();
  }

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post updated successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: { message: 'Post ID is required' },
    });
  }

  // Check if post exists
  const existingPost = await prisma.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    return res.status(404).json({
      success: false,
      error: { message: 'Post not found' },
    });
  }

  await prisma.post.delete({
    where: { id },
  });

  return res.json({
    success: true,
    message: 'Post deleted successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}/publish:
 *   patch:
 *     summary: Publish a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post published successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id/publish', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.post.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post published successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}/unpublish:
 *   patch:
 *     summary: Unpublish a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post unpublished successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id/unpublish', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.post.update({
    where: { id },
    data: {
      status: 'DRAFT',
      publishedAt: null,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post unpublished successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}/archive:
 *   patch:
 *     summary: Archive a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post archived successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id/archive', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.post.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post archived successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}/restore:
 *   patch:
 *     summary: Restore a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post restored successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id/restore', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.post.update({
    where: { id },
    data: {
      status: 'DRAFT',
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post restored successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}/unschedule:
 *   patch:
 *     summary: Unschedule a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post unscheduled successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id/unschedule', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await prisma.post.update({
    where: { id },
    data: {
      status: 'DRAFT',
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post unscheduled successfully',
  });
}));

/**
 * @swagger
 * /api/posts/{id}/toggle-visibility:
 *   patch:
 *     summary: Toggle post visibility (hide/show)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post visibility toggled successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id/toggle-visibility', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get current post to check current visibility
  const currentPost = await prisma.post.findUnique({
    where: { id },
    select: { isHidden: true }
  });

  if (!currentPost) {
    return res.status(404).json({
      success: false,
      message: 'Post not found',
    });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      isHidden: !currentPost.isHidden,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: `Post ${post.isHidden ? 'hidden' : 'shown'} successfully`,
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, SCHEDULED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, excerpt, status } = req.body;

  const updateData: {
    title?: string;
    excerpt?: string;
    status?: PostStatus;
  } = {};
  if (title !== undefined) updateData.title = title;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (status !== undefined) updateData.status = status as PostStatus;

  const post = await prisma.post.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        },
      },
    },
  });

  return res.json({
    success: true,
    data: post,
    message: 'Post updated successfully',
  });
}));

export default router; 