import { StatusCodes } from 'http-status-codes'
import { businessService } from '../../services'
import { ErrorHandler, errors } from '../../errors'

export const checkOwnershipMiddleware = async (req, res, next) => {
  const businessId =
    req.params.businessId || req.body.businessId || req.query.businessId
  const userId = req.userId

  try {
    const business = await businessService.findById(businessId)

    if (!business) {
      return next(
        new ErrorHandler(
          StatusCodes.NOT_FOUND,
          errors.BUSINESS_NOT_FOUND.message,
          errors.BUSINESS_NOT_FOUND.code,
        ),
      )
    }

    if (
      !business.user_id ||
      !(
        +business.user_id === +userId ||
        business.workers.findIndex(el => +el.id === +userId) !== -1
      )
    ) {
      return next(
        new ErrorHandler(
          StatusCodes.BAD_REQUEST,
          errors.NOT_OWN_BUSINESS.message,
          errors.NOT_OWN_BUSINESS.code,
        ),
      )
    }

    next()
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' })
  }
}
