import express from 'express'
const router = express.Router()
import {
   newCardPaymentIntent,
   getPaymentMethods,
} from '../controllers/stripeController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/new-payment-intent').post(protect, newCardPaymentIntent)
router.route('/payment-methods').get(protect, getPaymentMethods)

export default router
