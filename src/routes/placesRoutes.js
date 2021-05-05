import express from 'express'
const router = express.Router()
import {
   placeAutocomplete,
   getAddress,
   requestPickup,
   requestDelivery,
   deliveryRequestHistory,
   pickupRequestHistory,
   trackingList,
   getAllPendingPickupRequests,
} from '../controllers/placesControllers.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/autocomplete').get(protect, placeAutocomplete)
router.route('/getAddress').get(protect, getAddress)
router
   .route('/request-pickup')
   .get(protect, pickupRequestHistory)
   .post(protect, requestPickup)
router
   .route('/request-delivery')
   .get(protect, deliveryRequestHistory)
   .post(protect, requestDelivery)
router.route('/tracking').get(protect, trackingList)
router
   .route('/pickup-requests')
   .get(protect, admin, getAllPendingPickupRequests)

export default router
