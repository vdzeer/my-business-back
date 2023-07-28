import { Router } from 'express'

const app = Router()

import { businessRouter } from './business'
import { inventoryRouter } from './inventory'
import { categoryRouter } from './category'
import { supplierRouter } from './supplier'
import { promocodeRouter } from './promocode'
import { productRouter } from './product'
import { orderRouter } from './order'
import { analyticsRouter } from './analytics'

app.use('/business/', businessRouter)
app.use('/inventory/', inventoryRouter)
app.use('/category/', categoryRouter)
app.use('/supplier/', supplierRouter)
app.use('/promocode/', promocodeRouter)
app.use('/product/', productRouter)
app.use('/order/', orderRouter)
app.use('/analytics/', analyticsRouter)

export default app
