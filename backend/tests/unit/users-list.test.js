import { PrismaClient } from "@prisma/client"

import request from 'supertest'

import server from '../../src/index.js'

import { VALID_USERNAMES } from "../__mocks__/fetch.js"

beforeAll(async () => {
    const prisma = new PrismaClient()
    await prisma.user.deleteMany()

    for (let i = 0; i < 5; i++) {
        await prisma.user.create({
            data: {
                username: VALID_USERNAMES[i],
                name: "User Name",
                photo_url: "https://photo.com"
            }
        })
    }

    await prisma.$disconnect()
})

afterAll(() => {
    server.close()
})

describe("users list route", () => {
    it("should list all five users", async () => {
        await request(server)
            .get("/users")
            .expect(200)
            .then(response => {
                const data = response.body.data
                const users = data.users

                expect(users.length).toEqual(5)
            })
    })
})