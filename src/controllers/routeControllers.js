import asyncHandler from 'express-async-handler'
// import Pickup from '../models/pickupRequestModel.js'
import Order from '../models/orderModel.js'
import Route from '../models/routeModel.js'
import asyncForEach from '../utils/asyncForEach.js'

// @desc    Create a new route or modify an existing one
// @route   POST /api/routes/my-pickup-route
// @access  Private, Admin
// @body    route: [Pickup._id]
const createPickupRoute = asyncHandler(async (req, res) => {
   let route = req.body.route

   let newRoute

   let existingRoute = await Route.findOne({
      createdBy: req.user.id,
      isFinished: false,
   })

   if (existingRoute) {
      newRoute = await existingRoute.update({
         $addToSet: { route: { $each: route } },
      })
   } else {
      newRoute = new Route({
         createdBy: req.user.id,
         route,
      })
      await newRoute.save()
   }

   asyncForEach(route, async (destination) => {
      await Order.findByIdAndUpdate(destination, { status: 'En camino' })
   })

   res.status(201).send(newRoute)
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
   let activeRoutes = await Route.find({ isFinished: false })
      .populate('createdBy', 'name')
      .populate('route', 'status')
      .lean()

   activeRoutes = activeRoutes.map((route) => ({
      ...route,
      completed: route.route.every((x) => x.status === 'Entregado'),
   }))

   if (activeRoutes) {
      // console.log(activeRoutes)
      res.json(activeRoutes)
   } else {
      throw new Error('Sin Ruta pendiente')
   }
})

// @desc    Get all non finished routes
// @route   GET /api/routes/items/:route
// @access  Private, Admin
const getRouteItems = asyncHandler(async (req, res) => {
   let route = await Route.findById(req.params.route).populate('route')

   if (!route) throw new Error('No route found')

   let routeItems = []

   route.route.forEach((order) => {
      if (order.type === 'pickup') {
         order.orderItems.forEach((item) => {
            let modItem = { ...item.toObject(), received: false }
            routeItems.push(modItem)
         })
      }
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

// @desc    Remove order from route
// @route   POST /api/routes/:route/remove-order
// @access  Private, Admin
const removeOrderFromRoute = asyncHandler(async (req, res) => {
   const { order } = req.body

   let myRoute = await Route.findOneAndUpdate(
      {
         createdBy: req.user.id,
         isFinished: false,
      },
      {
         $pull: { route: order },
      }
   )

   if (myRoute) {
      await Order.findByIdAndUpdate(order, { status: 'Solicitado' })
      res.status(204).json(myRoute)
   } else {
      throw new Error('Ruta no encontrada')
   }
})

export {
   createPickupRoute,
   getMyPickupRoute,
   deleteMyPickupRoute,
   getActiveRoutes,
   getRouteItems,
   finishRoute,
   removeOrderFromRoute,
}
