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

const destinationSchema = mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      location: {
         type: pointSchema,
      },
      name: String,
      address: String,
      handling: {
         type: String,
         enum: ['Ligero', 'Pesado'],
      },
      comments: String,
      person: String,
      phone: String,
      status: {
         type: String,
         enum: ['Solicitado', 'En camino', 'Recibido', 'Almacenado'],
      },
      isDelivered: {
         type: Boolean,
         required: true,
         default: false,
      },
   },
   {
      timestamps: true,
   }
)

const Pickup = mongoose.model('Pickup', destinationSchema)

export default Pickup
