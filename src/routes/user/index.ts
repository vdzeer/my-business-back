import { Router } from 'express'

const app = Router()

import { authRouter } from './auth'
import { userRouter } from './user'

app.use('/auth/', authRouter)
app.use('/user/', userRouter)

export default app
