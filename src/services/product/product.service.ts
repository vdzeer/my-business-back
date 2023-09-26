import { pgPool } from './../../config'

class ProductService {
  async createProduct(product) {
    const query = `
      INSERT INTO product (business_id, category_id, name, image, price, self_price, inventories)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `

    const values = [
      product.business_id,
      product.category_id,
      product.name,
      product.image,
      product.price,
      product.self_price,
      product.inventories,
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
      UPDATE product
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
      SELECT * FROM product
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
      SELECT * FROM product
      WHERE ${conditionColumns};
    `

    const values = Object.values(findObject)

    const result = await pgPool.query(query, values)
    return result.rows
  }

  async findById(id: string) {
    const query = `
      SELECT * FROM product
      WHERE id = $1;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }

  async deleteById(id: string) {
    const query = `
      DELETE FROM product
      WHERE id = $1
      RETURNING *;
    `

    const result = await pgPool.query(query, [id])
    return result.rows[0]
  }
}

export const productService = new ProductService()
