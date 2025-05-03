import { Request } from "express";


export interface User{
    userId: number;
}
export interface AuthRequest extends Request{
    user: User
}