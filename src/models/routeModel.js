import mongoose from 'mongoose'

const routeSchema = mongoose.Schema(
   {
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      route: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
         },
      ],
      isFinished: Boolean,
   },
   {
      timestamps: true,
   }
)

const Route = mongoose.model('Route', routeSchema)

export default Route
