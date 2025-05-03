import prisma from "../prisma";
import { AuthRequest } from "../types/types";
import { Request, Response } from "express";
import { BlogPostInput } from "../schemas/blogSchema";
import express from 'express'

export const createBlog:express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const authReq = req as AuthRequest;
    const { title, content, categoryId } = req.body as BlogPostInput;
    try {
        const blog = await prisma.blog.create({
            data: {
                title,
                userId: authReq.user.userId,
                content,
                publishedDate: new Date(),
                categoryId: categoryId ? categoryId : null,
            },
        });
        res.json(blog);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "An error occurred" });
    }
};

export const getPaginatedBlogs:express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = (req.query.searchTerm as string) || "";
    const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : null;
    const adminUsername=(req.query.adminUsername as string) || "";

    console.log(page, pageSize, searchTerm, categoryId, adminUsername);
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    try {
        let user=null;
        if(adminUsername){
            user = await prisma.user.findFirst({
                where:{
                    username: adminUsername
                }
            })
        }
        const blogsCount = await prisma.blog.count({
            where: {
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                ],
                categoryId: categoryId ? categoryId : undefined
            },
        });
        const blogs = await prisma.blog.findMany({
            skip,
            take,
            where: {
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                ],
                categoryId: categoryId ? categoryId : undefined,
                userId: adminUsername ? user?.id : undefined
            },
            orderBy: {
                publishedDate: "desc",
            },
            include: {
                user: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
                upvotes: true,
                category: true,
            },
        });

        res.json({
            data: blogs,
            pagination: {
                total: blogsCount,
                page,
                pageSize,
                totalPages: Math.ceil(blogsCount / pageSize),
            },
        });
    } catch (error: any) {
        res.status(500).json({
            error: "An error occurred while fetching blogs.",
        });
    }
}
export const getPaginatedBlogsByUser:express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const authReq = req as AuthRequest;
    const user=authReq.user;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const searchTerm = (req.query.searchTerm as string) || "";
    const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string) : null;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    try {
        const blogsCount = await prisma.blog.count({
            where: {
                userId: user.userId,
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                ],
                categoryId: categoryId ? categoryId : undefined
            },
        });
        const blogs = await prisma.blog.findMany({
            skip,
            take,
            where: {
                userId: user.userId,
                OR: [
                    {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    {
                        content: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                ],
                categoryId: categoryId ? categoryId : undefined
            },
            orderBy: {
                publishedDate: "desc",
            },
            include:{
                user:true,
                comments:{
                    include:{
                        user:true
                    }
                },
                upvotes:true,
                category:true
            }
        });
        res.json({
            data: blogs,
            pagination:{
                total:blogsCount,
                page,
                pageSize,
                totalPages:Math.ceil(blogsCount/pageSize)
            }
        });
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
}

export const getBlogById:express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const { id } = req.params;
    try {
        const blog = await prisma.blog.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                user: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
                upvotes: true,
                category: true,
            },
        });
        
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return
        }
        const upVotesCount=blog.upvotes.length;
        res.json({...blog, upVotesCount});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}
export const getFirst10BlogsByCreator:express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const { username } = req.params;
    console.log(username);
    try {
        const blogs = await prisma.blog.findMany({
            where: {
                user:{
                    username: username
                }
            },
            orderBy: {
                publishedDate: "desc",
            },
            take: 10,
            include:{
                user: true,
                comments: {
                    include: {
                        user: true,
                    },
                },
                upvotes: true,
                category: true,
            }
        });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
}

export const deleteBlogById:express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const { id } = req.params;
    try {
        await prisma.comment.deleteMany({
            where:{
                blogId: parseInt(id)
            }
        })
        const blog = await prisma.blog.findUnique({
            where: {
                id: parseInt(id),
            },
        });
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }
        await prisma.blog.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}

export const addCommentToBlog: express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { content } = req.body;
    try {
        const blog = await prisma.blog.findUnique({
            where: {
                id: parseInt(id),
            },
        });
        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }
        const comment = await prisma.comment.create({
            data: {
                content,
                userId: authReq.user.userId,
                blogId: parseInt(id),
            },
        });
        res.json(comment);
    } catch (error) {
    console.log(error);
        res.status(500).json({ error: "An error occurred" });
    }
}

export const createCategory: express.RequestHandler = async (req: Request, res: Response):Promise<any> => {
    const { name } = req.body;
    try {
        const category = await prisma.category.create({
            data: {
                name,
            },
        });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "An error occurred" });
    }
}
export const getAllCategories1: express.RequestHandler = async (req: Request, res: Response):Promise<any> => {

    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "an error occurred"});
    }
}


