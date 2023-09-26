import { pgPool } from './../../config'

class CategoryService {
  async createCategory(category) {
    const query = `
      INSERT INTO category (business_id, name, image)
      VALUES ($1, $2, $3)
      RETURNING id;
    `

    const values = [category.business_id, category.name, category.image]

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
      UPDATE category
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
      SELECT * FROM category
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
      SELECT * FROM category
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    return result.rows
  }

  async findById(id: string) {
    const query = `
      SELECT * FROM category
      WHERE id = $1;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async deleteById(id: string) {
    const query = `
      DELETE FROM category
      WHERE id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }
}

export const categoryService = new CategoryService()
