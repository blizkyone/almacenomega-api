import asyncHandler from 'express-async-handler'
// import Pickup from '../models/pickupRequestModel.js'
import Order from '../models/orderModel.js'
import Route from '../models/routeModel.js'
import asyncForEach from '../utils/asyncForEach.js'

// @desc    Create a new route
// @route   POST /api/routes/my-pickup-route
// @access  Private, Admin
// @body    route: [Pickup._id]
const createPickupRoute = asyncHandler(async (req, res) => {
   let route = req.body.route

   let existingRoute = await Route.findOne({
      createdBy: req.user.id,
      isFinished: false,
   })
   if (existingRoute) throw new Error('Routa pendiente')

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
   let myRoute = await Route.findOne({
      createdBy: req.user.id,
      isFinished: false,
   }).populate('route')
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
   let myRoute = await Route.findOne({
      createdBy: req.user.id,
      isFinished: false,
   }).populate('route')

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

// @desc    Get all non finished routes
// @route   GET /api/routes/active
// @access  Private, Admin
const getActiveRoutes = asyncHandler(async (req, res) => {
   let activeRoutes = await Route.find({ isFinished: false }).populate(
      'createdBy',
      'name'
   )
   if (activeRoutes) {
      res.json(activeRoutes)
   } else {
      throw new Error('Sin Ruta pendiente')
   }
})

// @desc    Get all non finished routes
// @route   GET /api/routes/active
// @access  Private, Admin
const getRouteItems = asyncHandler(async (req, res) => {
   let route = await Route.findById(req.params.route).populate('route')

   if (!route) throw new Error('No route found')

   let routeItems = []
   route.route.forEach((order) => {
      order.orderItems.forEach((item) => {
         let modItem = { ...item.toObject(), received: false }
         routeItems.push(modItem)
      })
   })

   // console.log(routeItems)

   if (routeItems) {
      res.json(routeItems)
   } else {
      throw new Error('Sin Ruta pendiente')
   }
})

// @desc    Update route to finished
// @route   GET /api/routes/:route/finish
// @access  Private/Admin
const finishRoute = asyncHandler(async (req, res) => {
   const route = await Route.findById(req.params.route)
   // console.log(route)
   // res.send(true)
   if (route) {
      route.isFinished = true
      const updatedRoute = await route.save()

      res.json(updatedRoute)
   } else {
      res.status(404)
      throw new Error('Route not found')
   }
})

export {
   createPickupRoute,
   getMyPickupRoute,
   deleteMyPickupRoute,
   getActiveRoutes,
   getRouteItems,
   finishRoute,
}
