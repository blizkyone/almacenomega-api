import mongoose from 'mongoose'

const productSchema = mongoose.Schema(
   {
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      createdAt: {
         type: Date,
         Default: Date.now(),
      },
      aosku: {
         type: String,
         sparse: true,
      },
      barcode: String,
      name: {
         type: String,
         required: true,
      },
      brand: String,
      description: {
         type: String,
      },
      categories: [String],
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
      images: [String],
      reviews: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
         },
      ],
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
   this.area = ((this.length * this.width) / 100000) * 1.5
   this.volume = ((this.length * this.width * this.height) / 1000000) * 1.5
})

const Product = mongoose.model('Product', productSchema)

export default Product
