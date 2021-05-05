import mongoose from 'mongoose'

const itemSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
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
      inTransit: Boolean,
      // reviews: [
      //    {
      //       type: mongoose.Schema.Types.ObjectId,
      //       ref: 'Review',
      //    },
      // ],
      // rating: {
      //    type: Number,
      //    required: true,
      //    default: 0,
      // },
      // numReviews: {
      //    type: Number,
      //    required: true,
      //    default: 0,
      // },
   },
   {
      timestamps: true,
   }
)

itemSchema.pre('save', async function (next) {
   this.area = parseFloat(
      (((this.length * this.width) / 10000) * 1.5).toFixed(6)
   )
   this.volume = parseFloat(
      (((this.length * this.width * this.height) / 1000000) * 1.5).toFixed(6)
   )
})

const Item = mongoose.model('Item', itemSchema)

export default Item
