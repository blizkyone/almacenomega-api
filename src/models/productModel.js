import mongoose from 'mongoose'

const reviewSchema = mongoose.Schema(
   {
      rating: { type: Number, required: true },
      title: { type: String, required: true },
      comment: { type: String, required: true },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      product: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'Product',
      },
   },
   {
      timestamps: true,
   }
)

const productSchema = mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      createdAt: String,
      aosku: {
         type: String,
         sparse: true,
      },
      condition: String,
      price: {
         type: Number,
         default: 0,
      },
      qty: {
         type: Number,
         required: true,
         default: 0,
      },
      name: {
         type: String,
         required: true,
      },
      description: {
         type: String,
      },
      categories: [String],
      brand: String,
      images: [String],
      barcode: String,
      color: String,
      size: String,
      type: String,
      width: {
         type: Number,
         required: true,
         default: 0,
      },
      length: { type: Number, required: true, default: 0 },
      height: { type: Number, required: true, default: 0 },
      weight: { type: Number, required: true, default: 0 },
      area: { type: Number, required: true, default: 0 },
      volume: { type: Number, required: true, default: 0 },
      reviews: [reviewSchema],
      rating: {
         type: Number,
         required: true,
         default: 0,
      },
      numReviews: {
         type: Number,
         required: true,
         default: 0,
      },
   },
   {
      timestamps: true,
   }
)

productSchema.pre('save', async function (next) {
   this.area = this.lenth * this.width
   this.volume = this.lenth * this.width * this.height
})

const Product = mongoose.model('Product', productSchema)

export default Product
