import { Router } from 'express'

const app = Router()

import UserRouter from './user'
import BusinessRouter from './business'

app.use('/user-api/', UserRouter)
app.use('/business-api/', BusinessRouter)

export default app
