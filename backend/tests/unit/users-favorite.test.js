import { PrismaClient } from "@prisma/client"

import request from 'supertest'

import server from '../../src/index.js'

import { VALID_USERNAMES } from "../__mocks__/fetch.js"

const prisma = new PrismaClient()

beforeAll(async () => {
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
})

beforeEach(async () => {
    await prisma.user.updateMany({
        data: {
            favorite: false
        }
    })
})

afterAll(async () => {
    server.close()
    await prisma.$disconnect()
})

describe("users favorite route", () => {
    it("should favorite an user when no user is already favorited", async () => {
        await request(server)
            .patch("/users/mateusvrs/toggle-star")
            .expect(200)
            .then(response => {
                const data = response.body.data

                expect(data.user.username).toEqual("mateusvrs")
                expect(data.user.favorite).toEqual(true)
            })
    })

    it("should toggle A user favorite to false when it's true", async () => {
        await prisma.user.update({
            where: {
                username: "mateusvrs"
            },
            data: {
                favorite: true
            }
        })

        await request(server)
            .patch("/users/mateusvrs/toggle-star")
            .expect(200)
            .then(response => {
                const data = response.body.data

                expect(data.user.username).toEqual("mateusvrs")
                expect(data.user.favorite).toEqual(false)
            })
    })

    it("should set A user favorite to true and B user favorite to false when already exists an B user with favorite to true", async () => {
        await prisma.user.update({
            where: {
                username: "mateusvrs"
            },
            data: {
                favorite: true
            }
        })

        await request(server)
            .patch("/users/iagorrr/toggle-star")
            .expect(200)
            .then(async response => {
                const data = response.body.data

                expect(data.user.username).toEqual("iagorrr")
                expect(data.user.favorite).toEqual(true)
                expect(await prisma.user.count({
                    where: {
                        favorite: true
                    }
                })).toEqual(1)
            })
    })

    it("should not toggle when user does not exists", async () => {
        await request(server)
            .patch("/users/not-exists/toggle-star")
            .expect(404)
            .then(response => {
                const data = response.body.data

                expect(data.message).toEqual("User not found")
            })
    })
})