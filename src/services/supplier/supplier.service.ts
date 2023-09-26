import { pgPool } from './../../config'

class SupplierService {
  async createSupplier(supplier) {
    const query = `
      INSERT INTO supplier (business_id, name, contact)
      VALUES ($1, $2, $3)
      RETURNING id;
    `

    const values = [supplier.business_id, supplier.name, supplier.contact]

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
      UPDATE supplier
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
      SELECT * FROM supplier
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
      SELECT * FROM supplier
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    return result.rows
  }

  async findById(id: string) {
    const query = `
      SELECT * FROM supplier
      WHERE id = $1;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async deleteById(id: string) {
    const query = `
      DELETE FROM supplier
      WHERE id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }
}

export const supplierService = new SupplierService()
