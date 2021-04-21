import express from 'express'
const router = express.Router()
import {
   addOrderItems,
   getOrderById,
   editOrder,
   updateOrderToPaid,
   updateOrderToDelivered,
   getMyOrders,
   getOrders,
   addPickupItem,
   deletePickupItem,
} from '../controllers/orderController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders)
router.route('/myorders').get(protect, getMyOrders)
router.route('/:id').get(protect, getOrderById).put(protect, admin, editOrder)
router.route('/:id/pay').put(protect, updateOrderToPaid)
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered)
router
   .route('/:id/pickup')
   .post(protect, admin, addPickupItem)
   .put(protect, admin, deletePickupItem)

export default router
