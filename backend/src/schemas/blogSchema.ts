import { z } from "zod"

export const blogPostSchema = z.object({
    title: z.string().min(5, {message: 'Title must be at least 5 characters long'}),
    content: z.string().min(10, {message: 'Content must be at least 10 characters long'}),
    categoryId: z.number().int().positive().optional()
})

export type BlogPostInput = z.infer<typeof blogPostSchema>