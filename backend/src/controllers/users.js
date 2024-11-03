import { PrismaClient } from '@prisma/client'

const GITHUB_URL = "https://api.github.com"

class UsersController {
    #prisma = new PrismaClient()

    async create(req) {
        const body = req.body
        if (!body.username) throw new Error("Username is required", { cause: 400 })

        if (await this.#prisma.user.count() >= 5) throw new Error("User limit exceeded", { cause: 400 })

        const response = await fetch(`${GITHUB_URL}/users/${body.username}`)
        if (response.status === 404) throw new Error("User not found", { cause: 404 })
        if (response.status !== 200) throw new Error("Internal server error", { cause: 500 })

        const data = await response.json()
        return await this.#prisma.user.create({
            data: {
                username: data.login,
                name: data.name,
                photo_url: data.avatar_url
            }
        })
    }

    async list() {
        return await this.#prisma.user.findMany()
    }

    async delete(req) {
        const params = req.params

        await this.#prisma.user.delete({
            where: {
                username: params.username
            }
        })
    }

    async favorite(req) {
        const params = req.params

        const user = await this.#prisma.user.findFirst({
            where: {
                favorite: true
            }
        })

        if (user) {
            const update = await this.#prisma.user.update({
                where: {
                    username: user.username
                },
                data: {
                    favorite: false
                }
            })

            if (user.username === params.username) return update
        }

        return await this.#prisma.user.update({
            where: {
                username: params.username
            },
            data: {
                favorite: true
            }
        })
    }
}

export default UsersController