import prisma from "../prisma";
import { Request, Response } from "express";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import { UserSignupInput, UserLoginInput } from "../schemas/authSchema";
import { AuthRequest } from "../types/types";

export const signup: express.RequestHandler =async (req:Request, res:Response): Promise<any>=>{
    const {username, email, password, name} = req.body as UserSignupInput
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        const existingUser = await prisma.user.findFirst({
            where:{
                OR: [
                    { username },
                    { email }
                ]
            }
        })
        if(existingUser){
            res.status(400).json({error: 'User already exists'})
            return
        }
        const user = await prisma.user.create({
            data:{
                username,
                email,
                name,
                password: hashedPassword
            }
        })
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(400).json({error: 'An error occurred'})
    }
}

export const login: express.RequestHandler =async (req:Request, res:Response): Promise<any>=>{
    const {username, password} = req.body as UserLoginInput
    try {
        const user = await prisma.user.findFirst({
            where:{
                username
            }
        })
        if(!user){
            res.status(400).json({error: 'Invalid credentials'})
            return
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(!passwordMatch){
            res.status(400).json({error: 'Invalid credentials'})
            return
        }
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET as string)
        res.json({token})
    } catch (error) {
        console.log(error)
        res.status(400).json({error: 'An error occurred'})
    }
}

export const getUser: express.RequestHandler =async (req:Request, res:Response): Promise<any>=>{
    const authReq = req as AuthRequest
    try {
        const user = await prisma.user.findFirst({
            where:{
                id: authReq.user.userId
            }
        })
        res.json(user)
    } catch (error) {
        res.status(400).json({error: 'An error occurred'})
    }
}
