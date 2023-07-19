import { ErrorHandler } from '../errors'
import { categoryService } from '../services'

class categoryController {
  async create(req, res, next) {
    try {
      const { name, businessId } = req.body

      const category = await categoryService.createCategory({
        businessId,
        name,
        ...(req?.file ? { image: req.file.filename } : {}),
      })

      const newCategory = await categoryService.findById(category._id)

      res.json({
        data: newCategory,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async getAll(req, res, next) {
    try {
      const { businessId } = req.params
      const inventories = await categoryService.findAllByParams({ businessId })

      res.json({
        data: inventories,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async updateCategoryById(req, res, next) {
    try {
      const { categoryId, name } = req.body

      await categoryService.updateByParams(
        { _id: categoryId },
        {
          name,
          ...(req?.file ? { image: req.file.filename } : {}),
        },
      )

      const updatedCategory = await categoryService.findOneByParams({
        _id: categoryId,
      })

      res.send({
        status: 'ok',
        data: updatedCategory,
      })
    } catch (err) {
      return next(new ErrorHandler(err?.status, err?.code, err?.message))
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { categoryId } = req.body

      await categoryService.deleteById(categoryId)

      res.send({
        status: 'ok',
      })
    } catch (err) {
      return next(new ErrorHandler(err.status, err?.code, err?.message))
    }
  }
}

export const CategoryController = new categoryController()
