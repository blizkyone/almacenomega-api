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
         default: Date.now(),
      },
      aosku: {
         type: String,
         sparse: true,
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
      barcode: String,
      color: String,
      size: String,
      type: String,
   },
   {
      timestamps: true,
   }
)

const Item = mongoose.model('Item', itemSchema)

export default Item
