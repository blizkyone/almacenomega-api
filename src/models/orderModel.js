import mongoose from 'mongoose'

const pointSchema = mongoose.Schema({
   type: {
      type: String,
      enum: ['Point'],
      required: true,
   },
   coordinates: {
      type: [Number],
      required: true,
   },
})
//Full Name / Address line 1 / Address line 2 / City / State-Province-Region / ZIP-Postal Code / Country
const addressSchema = mongoose.Schema({
   name: String,
   streetAddress: String,
   colony: String,
   city: String,
   state: String,
   postalCode: String,
   country: {
      type: String,
      default: 'Mexico',
   },
})

const orderSchema = mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      type: {
         type: String,
         enum: ['purchase', 'delivery', 'pickup'],
      },
      location: {
         type: pointSchema,
      },
      naem: String,
      address: String,
      handling: {
         type: String,
         enum: ['Ligero', 'Pesado'],
      },
      comments: String,
      person: String,
      orderItems: [
         {
            name: { type: String, required: true },
            brand: { type: String },
            description: { type: String, required: true },
            condition: { type: String },
            price: { type: Number, required: true, default: 0 },
            item: {
               type: mongoose.Schema.Types.ObjectId,
               required: true,
               ref: 'Item',
            },
            barcode: String,
            qty: { type: Number, required: true },
         },
      ],
      status: {
         type: String,
         enum: ['Solicitado', 'En camino', 'Entregado'],
      },
      isDelivered: {
         type: Boolean,
         required: true,
         default: false,
      },
      deliveredAt: {
         type: Date,
      },
      paymentMethod: {
         type: String,
         //  required: true,
      },
      chargeId: {
         type: String,
      },
      taxPrice: {
         type: Number,
         //  required: true,
         default: 0.0,
      },
      shippingPrice: {
         type: Number,
         //  required: true,
         default: 0.0,
      },
      totalPrice: {
         type: Number,
         //  required: true,
         default: 0.0,
      },
      paymentStatus: {
         type: String,
         required: true,
         enum: ['pendiente', 'fallido', 'completado'],
         default: 'pendiente',
      },
      isPaid: {
         type: Boolean,
         required: true,
         default: false,
      },
      paidAt: {
         type: Date,
      },
   },
   {
      timestamps: true,
   }
)

const Order = mongoose.model('Order', orderSchema)

export default Order
