import { PrismaClient } from "@prisma/client"

import request from 'supertest'

import server from '../../src/index.js'

import { VALID_USERNAMES } from "../__mocks__/fetch.js"

const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.user.deleteMany()

    for (let i = 0; i < 2; i++) {
        await prisma.user.create({
            data: {
                username: VALID_USERNAMES[i],
                name: "User Name",
                photo_url: "https://photo.com"
            }
        })
    }
})

afterAll(async () => {
    server.close()
    await prisma.$disconnect()
})

describe("users delete route", () => {
    it("should delete an existing user", async () => {
        await request(server)
            .delete(`/users/${VALID_USERNAMES[0]}`)
            .expect(204)

        expect(await prisma.user.count()).toEqual(1)
    })

    it("should not delete a not existing user", async () => {
        await request(server)
            .delete("/users/not-existing")
            .expect(404)
            .then(response => {
                const data = response.body.data

                expect(data.message).toEqual("User not found")
            })
    })
})