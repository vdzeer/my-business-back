export const errors = {
  // 400
  BAD_REQUEST_USER_REGISTERED: {
    message: 'USER_IS_ALREADY_REGISTERED',
    code: 'USER_IS_ALREADY_REGISTERED',
  },
  BAD_REQUEST_NO_TOKEN: {
    message: 'INCORRECT_TOKEN',
    code: 'INCORRECT_TOKEN',
  },
  EMAIL_ALREADY_USED_ERROR: {
    message: 'EMAIL_ALREADY_EXIST',
    code: 'EMAIL_ALREADY_EXIST',
  },
  USER_ALREADY_EXIST: {
    message: 'USER_ALREADY_EXIST',
    code: 'USER_ALREADY_EXIST',
  },
  PASSWORD_IS_NOT_EQUAL: {
    message: 'PASSWORD_IS_NOT_EQUAL',
    code: 'PASSWORD_IS_NOT_EQUAL',
  },

  //401
  UNAUTHORIZED_BAD_TOKEN: {
    message: 'INCORRECT_TOKEN',
    code: 'INCORRECT_TOKEN',
  },

  //404
  USER_NOT_FOUND: {
    message: 'USER_NOT_FOUND',
    code: 'USER_NOT_FOUND',
  },
  EMAIL_NOT_FOUND: {
    message: 'EMAIL_NOT_FOUND',
    code: 'EMAIL_NOT_FOUND',
  },
  INVALID_TOKEN: {
    message: 'INVALID_TOKEN',
    code: 'INVALID_TOKEN',
  },
  INJURED_TOKEN: {
    message: 'INJURED_TOKEN',
    code: 'INJURED_TOKEN',
  },
  VALIDATION_ERROR: {
    message: 'VALIDATION_ERROR',
    code: 'VALIDATION_ERROR',
  },
  INVALID_PASSWORD: {
    message: 'INVALID_PASSWORD',
    code: 'INVALID_PASSWORD',
  },
}
