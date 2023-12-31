export const config = {
  PORT: process.env.PORT || 5000,
  HOST: process.env.PORT || '',
  FRONTEND_URL: process.env.FRONTEND_URL || '',

  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '',

  CRON_JOB_PERIOD: process.env.CRON_JOB_PERIOD || '',

  serverRateLimits: {
    period: 15 * 60 * 1000,
    maxRequests: 1000,
  },

  ROOT_EMAIL: process.env.ROOT_EMAIL || '',
  ROOT_EMAIL_PASSWORD: process.env.ROOT_EMAIL_PASSWORD || '',
  ROOT_EMAIL_SERVICE: process.env.ROOT_EMAIL_SERVICE || '',
}
