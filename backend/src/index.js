import express from 'express'

import UsersRouter from './routes/users.js'

const app = express()
const port = 3000

app.use(express.json())

app.use("/users", UsersRouter)

export default app.listen(port)
