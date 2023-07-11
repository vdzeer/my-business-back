import { Router } from 'express'

const app = Router()

import UserRouter from './user'

app.use('/user-api/', UserRouter)

export default app
