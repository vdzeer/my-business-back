import { pgPool } from './../../config'

class InventoryService {
  async createInventory(inventory) {
    const query = `
      INSERT INTO inventory (business_id, name, image, amount, lower_range)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `

    const values = [
      inventory.business_id,
      inventory.name,
      inventory.image,
      inventory.amount,
      inventory.lowerRange,
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
      UPDATE inventory
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
      SELECT * FROM inventory
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
      SELECT * FROM inventory
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    return result.rows
  }

  async findById(id: string) {
    const query = `
      SELECT * FROM inventory
      WHERE id = $1;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async deleteById(id: string) {
    const query = `
      DELETE FROM inventory
      WHERE id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }
}

export const inventoryService = new InventoryService()
