import { PrismaClient } from "@prisma/client"

import request from 'supertest'

import server from '../../src/index.js'

import { GitHubAPI, VALID_USERNAMES } from '../__mocks__/fetch.js'
import { expect, jest } from '@jest/globals'

beforeAll(async () => {
    const prisma = new PrismaClient()
    await prisma.user.deleteMany()
    await prisma.$disconnect()

    global.fetch = jest.fn().mockImplementation((url, options) => GitHubAPI(url, options))
})

afterAll(() => {
    server.close()
})

describe("users create route", () => {
    it("should create a new valid user with all information", async () => {
        await request(server)
            .post("/users")
            .send({
                "username": "mateusvrs"
            })
            .expect(201)
            .then(response => {
                const data = response.body.data
                const user = data.user

                expect(user.favorite).toEqual(false)
                expect(user.photo_url).toBeDefined()

                expect(user.name).toEqual("User Name")
                expect(user.username).toEqual("mateusvrs")
            })
    })

    it("should create a new valid user even without name", async () => {
        await request(server)
            .post("/users")
            .send({
                "username": "iagorrr"
            })
            .expect(201)
            .then(response => {
                const data = response.body.data
                const user = data.user

                expect(user.favorite).toEqual(false)
                expect(user.photo_url).toBeDefined()

                expect(user.name).toBeNull()
                expect(user.username).toEqual("iagorrr")
            })
    })

    it("should not create an already existing user", async () => {
        await request(server)
            .post("/users")
            .send({
                "username": "mateusvrs"
            })
            .expect(400)
            .then(response => {
                const data = response.body.data

                expect(data.message).toEqual('User already exists')
            })
    })

    it("should not create an user with incorrect body", async () => {
        await request(server)
            .post("/users")
            .send({})
            .expect(400)
            .then(response => {
                const data = response.body.data

                expect(data.message).toEqual('Username is required')
            })
    })

    it("should not create more than 5 users", async () => {
        for (let i = 2; i < Math.min(5, VALID_USERNAMES.length); i++) {
            await request(server)
                .post("/users")
                .send({
                    "username": VALID_USERNAMES[i]
                })
                .expect(201)
        }

        for (let i = 5; i < VALID_USERNAMES.length; i++) {
            await request(server)
                .post("/users")
                .send({
                    "username": VALID_USERNAMES[i]
                })
                .expect(400)
        }
    })
})