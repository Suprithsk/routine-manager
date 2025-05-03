import { addCommentToBlog, createBlog, getPaginatedBlogs, getBlogById, getFirst10BlogsByCreator, createCategory, getAllCategories1, getPaginatedBlogsByUser, deleteBlogById } from '../controllers/blogController';
import express from 'express';
import { blogPostSchema } from '../schemas/blogSchema';
import { zodPostMiddleware } from '../middlewares/zodMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware as any, zodPostMiddleware(blogPostSchema), createBlog as express.RequestHandler);
router.get('/getUserBlogs', authMiddleware as any, getPaginatedBlogsByUser as express.RequestHandler);
router.get('/', authMiddleware as any, getPaginatedBlogs as express.RequestHandler);
router.get('/creator/:username', getFirst10BlogsByCreator as express.RequestHandler);
router.get('/:id', getBlogById as express.RequestHandler);
router.post('/:id/comment', authMiddleware as any, addCommentToBlog as express.RequestHandler);
router.post('/category', authMiddleware as any, createCategory as express.RequestHandler);
router.delete('/:id', authMiddleware as any, deleteBlogById as express.RequestHandler);
router.get('/categories/getAllCategories', authMiddleware as any, getAllCategories1 as express.RequestHandler);

export default router