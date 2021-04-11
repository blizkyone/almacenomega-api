import express from 'express'
const router = express.Router()
import {
   createPickupRoute,
   getMyPickupRoute,
   deleteMyPickupRoute,
} from '../controllers/routeControllers.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router
   .route('/my-pickup-route')
   .get(protect, admin, getMyPickupRoute)
   .post(protect, admin, createPickupRoute)
   .delete(protect, admin, deleteMyPickupRoute)

export default router
