import express from 'express'
const router = express.Router()
import {
   placeAutocomplete,
   getAddress,
   requestPickup,
   pickupRequestHistory,
   pickupTrackingList,
   getAllPendingPickupRequests,
} from '../controllers/placesControllers.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/autocomplete').get(protect, placeAutocomplete)
router.route('/getAddress').get(protect, getAddress)
router
   .route('/request-pickup')
   .get(protect, pickupRequestHistory)
   .post(protect, requestPickup)
router.route('/pickup-tracking').get(protect, pickupTrackingList)
router
   .route('/pickup-requests')
   .get(protect, admin, getAllPendingPickupRequests)

export default router
