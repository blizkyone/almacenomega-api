import express from 'express'
const router = express.Router()
import {
   createPickupRoute,
   getMyPickupRoute,
   deleteMyPickupRoute,
   getActiveRoutes,
   getRouteItems,
   finishRoute,
   removeOrderFromRoute,
} from '../controllers/routeControllers.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router
   .route('/my-pickup-route')
   .get(protect, admin, getMyPickupRoute)
   .post(protect, admin, createPickupRoute)
   .delete(protect, admin, deleteMyPickupRoute)
router.route('/remove-order').post(protect, admin, removeOrderFromRoute)
router.route('/active').get(protect, admin, getActiveRoutes)
router.route('/items/:route').get(protect, admin, getRouteItems)
router.route('/:route/finish').get(protect, admin, finishRoute)

export default router
