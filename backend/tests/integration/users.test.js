import { PrismaClient } from "@prisma/client"

import request from 'supertest'

import server from '../../src/index.js'

import { GitHubAPI, VALID_USERNAMES } from "../__mocks__/fetch.js"
import { expect, jest } from '@jest/globals'

const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.user.deleteMany()

    global.fetch = jest.fn().mockImplementation((url, options) => GitHubAPI(url, options))
})

afterAll(async () => {
    server.close()
    await prisma.$disconnect()
})

describe("users complete flow", () => {
    it("should create three users, toggle favorite of one user two times, delete one user and check for disjunctive toggle", async () => {
        const username = VALID_USERNAMES[0]

        for (let i = 0; i < 3; i++) {
            await request(server)
                .post("/users")
                .send({
                    "username": VALID_USERNAMES[i]
                })
                .expect(201)
        }

        let toggle = true
        for (let i = 0; i < 2; i++) {
            await request(server)
                .patch(`/users/${username}/toggle-star`)
                .expect(200)
                .then(response => {
                    const data = response.body.data

                    expect(data.user.favorite).toEqual(toggle)
                    toggle = !toggle
                })
        }

        await request(server)
            .delete(`/users/${username}`)
            .expect(204)

        await request(server)
            .patch(`/users/${VALID_USERNAMES[1]}/toggle-star`)
            .expect(200)
            .then(response => {
                const data = response.body.data

                expect(data.user.favorite).toEqual(true)
            })

        await request(server)
            .patch(`/users/${VALID_USERNAMES[2]}/toggle-star`)
            .expect(200)
            .then(async response => {
                const data = response.body.data

                expect(data.user.favorite).toEqual(true)

                const user = await prisma.user.findUnique({
                    where: {
                        username: VALID_USERNAMES[1]
                    }
                })
                expect(user.favorite).toEqual(false)
            })
    })
})