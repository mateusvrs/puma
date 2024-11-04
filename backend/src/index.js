import express from 'express'
import cors from 'cors'

import UsersRouter from './routes/users.js'

const app = express()
const port = 3000

app.use(cors())

app.use(express.json())

app.use("/users", UsersRouter)

export default app.listen(port)
