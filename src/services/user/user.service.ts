import { pgPool } from './../../config'

class UserService {
  async createUser(user) {
    const query = `
      INSERT INTO "user" (businesses, role, subscription, language, provider, email, password, name, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `

    const values = [
      user.businesses,
      user.role,
      user.subscription,
      user.language,
      user.provider,
      user.email,
      user.password,
      user.name,
      user.image,
    ]

    const result = await pgPool.query(query, values)
    return result.rows[0].id
  }

  async updateUserByParams(params, update) {
    const conditionColumns = Object.keys(params)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ')
    const updateColumns = Object.keys(update)
      .map(
        (key, index) => `${key} = $${index + Object.keys(params).length + 1}`,
      )
      .join(', ')

    const query = `
      UPDATE "user"
      SET ${updateColumns}
      WHERE ${conditionColumns}
      RETURNING *;
    `

    const values = [...Object.values(params), ...Object.values(update)]

    const result = await pgPool.query(query, values)
    return result.rows[0]
  }

  async findOneByParams(findObject) {
    const conditionColumns = Object.keys(findObject)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ')

    const query = `
      SELECT * FROM "user"
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    const user = result.rows[0]

    const subscription = user?.subscription
      ? await pgPool.query(
          `
            SELECT * FROM "subscription"
            WHERE id = $1;`,
          [user.subscription],
        )
      : null

    return user
      ? { ...user, subscription: subscription?.rows?.[0] ?? null }
      : user
  }

  async findById(id) {
    const query = `
      SELECT * FROM "user"
      WHERE id = $1;
    `

    const result = await pgPool.query(query, [id])

    const user = result.rows[0]

    const subscription = user?.subscription
      ? await pgPool.query(
          `
            SELECT * FROM "subscription"
            WHERE id = $1;`,
          [user.subscription],
        )
      : null

    return { ...user, subscription: subscription?.rows?.[0] ?? null }
  }

  async deleteById(id) {
    const query = `
      DELETE FROM "user"
      WHERE id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async findTokenByUser(id) {
    const query = `
      SELECT * FROM "user_token"
      WHERE user_id = $1;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async findTokenByToken(token) {
    const query = `
      SELECT * FROM "user_token"
      WHERE token = $1;
    `

    const result = await pgPool.query(query, [token])
    return result.rows[0]
  }

  async deleteTokenById(id) {
    const query = `
      DELETE FROM "user_token"
      WHERE user_id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async createUserToken(id, token) {
    const query = `
      INSERT INTO "user_token" (user_id, token, created_at)
      VALUES ($1, $2, $3)
      RETURNING id;
    `

    const values = [id, token, new Date()]

    const result = await pgPool.query(query, values)
    return result.rows[0].id
  }
}

export const userService = new UserService()
