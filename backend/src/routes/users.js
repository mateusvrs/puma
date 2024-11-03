import express from 'express'

import UsersController from '../controllers/users.js'
import { Prisma } from '@prisma/client'

const router = express.Router()

const controller = new UsersController()

router.post('/', async (req, res) => {
    try {
        const user = await controller.create(req)

        return res.status(201).json({
            data: {
                user: user
            }
        })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2002") {
                return res.status(400).json({
                    data: {
                        message: "User already exists"
                    }
                })
            }
            return res.sendStatus(500)
        }

        const status = [400, 404]
        const code = status.find((element) => element === err.cause)

        if (code) return res.status(code).json({
            data: {
                message: err.message
            }
        })
        return res.sendStatus(500)
    }
})

router.get('/', async (req, res) => {
    try {
        const users = await controller.list()

        return res.status(200).json({
            data: {
                users: users
            }
        })
    } catch (err) {
        return res.sendStatus(500)
    }
})

router.delete('/:username', async (req, res) => {
    try {
        await controller.delete(req)

        return res.sendStatus(204)
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                return res.status(404).json({
                    data: {
                        message: "User not found"
                    }
                })
            }
        }

        return res.sendStatus(500)
    }
})

router.patch('/:username/toggle-star', async (req, res) => {
    try {
        const user = await controller.favorite(req)

        return res.status(200).json({
            data: {
                user: user
            }
        })
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === "P2025") {
                return res.status(404).json({
                    data: {
                        message: "User not found"
                    }
                })
            }
        }

        return res.sendStatus(500)
    }
})

export default router