import { pgPool } from './../../config'

class PromocodeService {
  async createPromocode(promocode) {
    const query = `
      INSERT INTO promocode (business_id, promocode, use_amount, sale_percent)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `

    const values = [
      promocode.business_id,
      promocode.promocode,
      promocode.use_amount,
      promocode.sale_percent,
    ]

    const result = await pgPool.query(query, values)
    return result.rows[0].id
  }

  async updateByParams(params, update) {
    const conditionColumns = Object.keys(params)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ')
    const updateColumns = Object.keys(update)
      .map(
        (key, index) => `${key} = $${index + Object.keys(params).length + 1}`,
      )
      .join(', ')

    const query = `
      UPDATE promocode
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
      SELECT * FROM promocode
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    return result.rows[0]
  }

  async findAllByParams(findObject) {
    const conditionColumns = Object.keys(findObject)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ')

    const query = `
      SELECT * FROM promocode
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    return result.rows
  }

  async findById(id: string) {
    const query = `
      SELECT * FROM promocode
      WHERE id = $1;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async deleteById(id: string) {
    const query = `
      DELETE FROM promocode
      WHERE id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }
}

export const promocodeService = new PromocodeService()
