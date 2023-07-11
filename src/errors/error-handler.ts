export class ErrorHandler extends Error {
  name = 'Controller Error'
  status?: number
  message: string
  code?: string

  constructor(status: any, msg: any, code?: string) {
    super(msg)
    this.message = msg
    this.status = status
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}
