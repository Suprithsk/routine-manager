import jwt from "jsonwebtoken"
import { Request, Response, NextFunction  } from 'express'
import { User } from "../types/types"
import { AuthRequest } from "../types/types"
import express from 'express'

export const authMiddleware= async (req: AuthRequest, res: Response, next: NextFunction):Promise<any> => {
    console.log('calkled')
    try {
        let token: string| undefined= req.header('Authorization')
        if(!token){
            res.status(401).json({error: 'Unauthorized: No token provided'})
            return
        }
        token=token.includes('Bearer') ? token.split(' ')[1] : token
        const user = jwt.verify(token, process.env.JWT_SECRET as string) as User
        if(!user){
            res.status(401).json({error: 'Unauthorized'})
            return
        }
        req.user = user
        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({error: 'Unauthorized'})
    }
}