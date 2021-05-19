import asyncHandler from 'express-async-handler'
import stripe from '../config/stripe.js'

// @desc    create payment intent for new card
// @route   POST /api/stripe/new-payment-intent
// @access  Public
const newCardPaymentIntent = asyncHandler(async (req, res) => {
   const { amount } = req.body

   const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      customer: req.user.stripeId,
   })

   //    Send publishable key and PaymentIntent details to client
   res.send({
      publicKey: process.env.STRIPE_TEST_PUBLIC_KEY,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
   })
})

// @desc    get payment methods
// @route   GET /api/stripe/payment-methods
// @access  Private
const getPaymentMethods = asyncHandler(async (req, res) => {
   const { data } = await stripe.paymentMethods.list({
      customer: req.user.stripeId,
      type: 'card',
   })

   res.send(data)
})

export { newCardPaymentIntent, getPaymentMethods }
