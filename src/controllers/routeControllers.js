import asyncHandler from 'express-async-handler'
import Pickup from '../models/pickupRequestModel.js'
import Order from '../models/orderModel.js'
import Route from '../models/routeModel.js'
import asyncForEach from '../utils/asyncForEach.js'

// @desc    Create a new route
// @route   POST /api/routes/my-pickup-route
// @access  Private, Admin
// @body    route: [Pickup._id]
const createPickupRoute = asyncHandler(async (req, res) => {
   let route = req.body.route

   const newRoute = new Route({
      createdBy: req.user.id,
      route,
   })

   asyncForEach(route, async (destination) => {
      await Order.findByIdAndUpdate(destination, { status: 'En camino' })
   })

   const savedRoute = await newRoute.save()
   res.status(201).send(savedRoute)
})

// @desc    Get my pickup route
// @route   GET /api/routes/my-pickup-route
// @access  Private, Admin
const getMyPickupRoute = asyncHandler(async (req, res) => {
   let myRoute = await Route.findOne({ createdBy: req.user.id }).populate(
      'route'
   )
   if (myRoute) {
      res.json(myRoute.route)
   } else {
      throw new Error('Sin Ruta pendiente')
   }
})

// @desc    Get my pickup route
// @route   DELETE /api/routes/my-pickup-route
// @access  Private, Admin
const deleteMyPickupRoute = asyncHandler(async (req, res) => {
   let myRoute = await Route.findOne({ createdBy: req.user.id }).populate(
      'route'
   )

   asyncForEach(myRoute.route, async (destination) => {
      await Order.findByIdAndUpdate(destination._id, { status: 'Solicitado' })
   })

   myRoute.remove()

   if (myRoute) {
      res.status(204).json(myRoute)
   } else {
      throw new Error('Sin Ruta pendiente')
   }
})

export { createPickupRoute, getMyPickupRoute, deleteMyPickupRoute }
