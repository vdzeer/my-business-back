import * as rateLimit from 'express-rate-limit'
import * as mongoose from 'mongoose'
import * as express from 'express'
import * as helmet from 'helmet'
import * as dotenv from 'dotenv'
import * as morgan from 'morgan'
import * as cors from 'cors'
import * as path from 'path'

import { errorHandler } from './helpers'
import { config } from './config'
import router from './routes'

dotenv.config()

const serverRequestLimit = rateLimit({
  windowMs: config.serverRateLimits.period,
  max: config.serverRateLimits.maxRequests,
})

class App {
  public readonly app: express.Application = express()

  constructor() {
    ;(global as any).appRoot = path.resolve(process.cwd(), './')

    this.app.use(morgan('dev'))
    this.app.use(helmet())
    this.app.use(serverRequestLimit)
    this.app.use(cors())

    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    this.mountRoutes()
    this.setupDB()

    this.app.use(errorHandler)
  }

  private setupDB(): void {
    mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
    })

    const db = mongoose.connection
    console.log('connected')
    db.on('error', console.log.bind(console, 'MONGO ERRROR'))
  }

  private configureCors = (origin: any, callback: any) => {
    const whiteList = config.ALLOWED_ORIGIN.split(';')

    if (!origin) {
      // FOR POSTMAN
      return callback(null, true)
    }

    if (!whiteList.includes(origin)) {
      return callback(new Error('Cors not allowed'), false)
    }

    return callback(null, true)
  }

  private mountRoutes(): void {
    this.app.use('/', router)
    this.app.use(
      '/images',
      express.static(path.resolve((global as any).appRoot, 'public')),
    )
  }
}

export const app = new App().app
