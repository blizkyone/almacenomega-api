import asyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
   //  const pageSize = 10
   //  const page = Number(req.query.pageNumber) || 1

   //  const keyword = req.query.keyword
   //     ? {
   //          name: {
   //             $regex: req.query.keyword,
   //             $options: 'i',
   //          },
   //       }
   //     : {}

   //  const count = await Product.countDocuments({ ...keyword })
   //  const products = await Product.find({ ...keyword })
   // .limit(pageSize)
   // .skip(pageSize * (page - 1))

   //  res.json({ products, page, pages: Math.ceil(count / pageSize) })
   const products = await Product.find({ user: req.user.id })
   res.json(products)
})

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id)

   if (product) {
      res.json(product)
   } else {
      res.status(404)
      throw new Error('Product not found')
   }
})

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id)

   if (product) {
      await product.remove()
      res.json({ message: 'Product removed' })
   } else {
      res.status(404)
      throw new Error('Product not found')
   }
})

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
   const product = new Product({
      user: req.body.user,
      aosku: req.body.aosku,
      name: req.body.name,
      state: req.body.state,
      price: req.body.price,
      qty: req.body.qty,
      description: req.body.description,
      brand: req.body.brand,
      categories: req.body.categories,
      color: req.body.color,
      size: req.body.size,
      type: req.body.type,
      barcode: req.body.barcode,
      width: req.body.width,
      length: req.body.length,
      height: req.body.height,
   })

   const createdProduct = await product.save()
   res.status(201).json(createdProduct)
})

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
   const {
      name,
      price,
      description,
      image,
      brand,
      category,
      countInStock,
   } = req.body

   const product = await Product.findById(req.params.id)

   if (product) {
      product.name = name
      product.price = price
      product.description = description
      product.image = image
      product.brand = brand
      product.category = category
      product.countInStock = countInStock

      const updatedProduct = await product.save()
      res.json(updatedProduct)
   } else {
      res.status(404)
      throw new Error('Product not found')
   }
})

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
   const { rating, comment } = req.body

   const product = await Product.findById(req.params.id)

   if (product) {
      const alreadyReviewed = product.reviews.find(
         (r) => r.user.toString() === req.user._id.toString()
      )

      if (alreadyReviewed) {
         res.status(400)
         throw new Error('Product already reviewed')
      }

      const review = {
         name: req.user.name,
         rating: Number(rating),
         comment,
         user: req.user._id,
      }

      product.reviews.push(review)

      product.numReviews = product.reviews.length

      product.rating =
         product.reviews.reduce((acc, item) => item.rating + acc, 0) /
         product.reviews.length

      await product.save()
      res.status(201).json({ message: 'Review added' })
   } else {
      res.status(404)
      throw new Error('Product not found')
   }
})

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
   const products = await Product.find({}).sort({ rating: -1 }).limit(3)

   res.json(products)
})

export {
   getProducts,
   getProductById,
   deleteProduct,
   createProduct,
   updateProduct,
   createProductReview,
   getTopProducts,
}
