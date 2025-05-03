import {z} from 'zod'

export const userSignupSchema = z.object({
    username: z.string().min(5, {message: 'Username must be at least 5 characters long'}),
    email: z.string().email({message: 'invaild email format'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'}),
    name: z.string().min(2, {message: 'Name must be at least 2 characters long'})
})

export const userLoginSchema = z.object({
    username: z.string().min(5, {message: 'Username must be at least 5 characters long'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters long'})
})

export type UserSignupInput = z.infer<typeof userSignupSchema>
export type UserLoginInput = z.infer<typeof userLoginSchema>