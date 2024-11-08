import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import UsersRouter from './routes/users.js'

const app = express()
const port = process.env.PORT

app.use(cors())

app.use(express.json())

app.use("/users", UsersRouter)

export default app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
})
