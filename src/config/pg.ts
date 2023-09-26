require('dotenv').config()
const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.pg_user,
  password: process.env.pg_password,
  host: process.env.pg_host,
  port: process.env.pg_port,
  database: process.env.pg_db,
})

export const pgPool = pool
