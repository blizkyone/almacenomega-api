import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import Item from '../models/itemModel.js'
import { deleteItemPictures } from '../config/s3.js'
import asyncForEach from '../utils/asyncForEach.js'
import stripe from '../config/stripe.js'
import User from '../models/userModel.js'

// @desc    Remove item from an order during a pickup request
// @route   PUT /api/orders/:id/pickup
// @access  Private
const deletePickupItem = asyncHandler(async (req, res) => {
   const { order, item } = req.body
   // console.log(req.body)

   let currentOrder = await Order.findByIdAndUpdate(
      order,
      {
         $pull: { orderItems: { item } },
      },
      { new: true }
   )
   await Item.findByIdAndDelete(item)
   await deleteItemPictures(item)

   res.status(202).json(currentOrder)
   // res.status(202).json({ deletedPictures })
})

// @desc    Add item to an order during a pickup request
// @route   POST /api/orders/:id/pickup
// @access  Private
const addPickupItem = asyncHandler(async (req, res) => {
   const {
      order,
      // barcode,
      name,
      description,
      // categories,
      brand,
      // condition,
      qty,
      width,
      height,
      length,
      weight,
   } = req.body

   let currentOrder = await Order.findById(order)

   const item = new Item({
      owner: currentOrder.user,
      createdBy: req.user._id,
      // barcode,
      name,
      description,
      // categories,
      brand,
      // condition,
      qty,
      width,
      height,
      length,
      weight,
   })

   const newItem = await item.save()

   // add new product to current order
   let newOrderItem = {
      name,
      brand,
      description,
      // condition,
      item: newItem._id,
      barcode: Math.round(Math.random() * 89999 + 10000).toString(),
      qty,
   }

   currentOrder = await currentOrder.updateOne({
      $addToSet: { orderItems: newOrderItem },
   })

   res.status(201).json(currentOrder)
})

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
   console.log(req.body.orderItems)
   res.send(true)
   // const {
   //    orderItems,
   //    shippingAddress,
   //    paymentMethod,
   //    itemsPrice,
   //    taxPrice,
   //    shippingPrice,
   //    totalPrice,
   // } = req.body

   // if (orderItems && orderItems.length === 0) {
   //    res.status(400)
   //    throw new Error('No order items')
   // } else {
   //    const order = new Order({
   //       orderItems,
   //       user: req.user._id,
   //       shippingAddress,
   //       paymentMethod,
   //       itemsPrice,
   //       taxPrice,
   //       shippingPrice,
   //       totalPrice,
   //    })

   //    const createdOrder = await order.save()

   //    res.status(201).json(createdOrder)
   // }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
   let order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
         path: 'orderItems',
         populate: {
            path: 'item',
            model: 'Item',
            select: 'images length width height weight',
         },
      })
      .lean()

   if (order) {
      let validated = order.orderItems.every((item) => {
         return item.item.images.length > 0
      })
      const orderToSend = { ...order, validated }
      // orderToSend.orderItems.forEach((item) => console.log(item))
      res.json(orderToSend)
   } else {
      res.status(404)
      throw new Error('Order not found')
   }
})

// @desc    Edit Order -> change status
// @route   PUT /api/orders/:id
// @access  Private
const editOrder = asyncHandler(async (req, res) => {
   const updates = Object.keys(req.body)

   const updateOrder = await Order.findById(req.params.id)
   updates.forEach((update) => (updateOrder[update] = req.body[update]))
   await updateUser.save()

   res.status(200).send(updateOrder)
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
   const order = await Order.findById(req.params.id)

   if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
         id: req.body.id,
         status: req.body.status,
         update_time: req.body.update_time,
         email_address: req.body.payer.email_address,
      }

      const updatedOrder = await order.save()

      res.json(updatedOrder)
   } else {
      res.status(404)
      throw new Error('Order not found')
   }
})

// @desc    Update order to delivered and charge customer if it is a pickup or transport order
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
   const order = await Order.findById(req.params.id).populate(
      'user',
      'stripeId paymentMethod'
   )
   // console.log(order.user)

   if (order) {
      order.status = 'Entregado'
      order.isDelivered = true
      order.deliveredAt = Date.now()

      if (order.type !== 'purchase') {
         let amount

         switch (order.type) {
            case 'delivery':
               amount = 5000
               break
            case 'pickup':
               amount = 15000
               break
            default:
               break
         }
         // console.log(amount)
         try {
            const charge = await stripe.paymentIntents.create({
               amount,
               currency: 'mxn',
               customer: order.user.stripeId,
               payment_method: order.user.paymentMethod,
               off_session: true,
               confirm: true,
               description: 'Cargo por orden de recolección',
            })
            console.log(charge)

            order.isPaid = true
            order.paymentStatus = 'completado'
            order.paidAt = Date.now()
            order.chargeId = charge.id
            order.paymentMethod = charge.paymentMethod
            order.totalPrice = charge.amount
            order.taxPrice = Math.round(charge.amount / 1.16)
            order.shippingPrice =
               charge.amount - Math.round(charge.amount / 1.16)
         } catch (error) {
            console.log(error.raw)

            order.paymentStatus = 'fallido'
            order.chargeId = error.raw.charge

            await stripe.paymentMethods.detach(order.user.paymentMethod)

            await User.findByIdAndUpdate(order.user._id, {
               paymentMethod: 'fallo',
            })

            // throw new Error(error.raw.message)
         }
      }

      // if (order.type === 'delivery') {
      //    asyncForEach(order.orderItems, async (item) => {
      //       const storedItem = await Item.findById(item.item, 'qty')
      //       storedItem['qty'] = storedItem.qty - item.qty
      //       await storedItem.save()
      //    })
      // }

      const updatedOrder = await order.save()

      res.json(updatedOrder)
   } else {
      res.status(404)
      throw new Error('Order not found')
   }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
   const orders = await Order.find({ user: req.user._id })
   res.json(orders)
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
   const orders = await Order.find({}).populate('user', 'id name')
   res.json(orders)
})

export {
   addOrderItems,
   getOrderById,
   editOrder,
   updateOrderToPaid,
   updateOrderToDelivered,
   getMyOrders,
   getOrders,
   addPickupItem,
   deletePickupItem,
}
