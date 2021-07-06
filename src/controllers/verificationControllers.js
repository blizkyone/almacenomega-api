import asyncHandler from 'express-async-handler'
import twilio from 'twilio'
import User from '../models/userModel.js'

var client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)

// @desc    request phone verification code
// @route   GET /api/verification/phone-verification-code
// @access  Public
const getVerificationCode = asyncHandler(async (req, res) => {
   // console.log('login attempt: ' + req.query.phone + ' and ' + req.query.channel)
   const { phone } = req.query

   client.verify
      .services(process.env.TWILIO_VERIFICATION_SERVICE_ID)
      .verifications.create({
         to: `+52${phone}`,
         channel: 'sms',
      })
      .then((data) => {
         res.status(200).send(data.status)
      })
      .catch((err) => {
         console.log(err)
         res.send(err)
      })
})

// @desc    validate phone verification code
// @route   GET /api/verification/phone-code-validation
// @access  Public
const validateVerificationCode = asyncHandler(async (req, res) => {
   // console.log('verification attempt: ' + req.query.phone + ' and ' + req.query.code)
   const { phone, code } = req.query
   client.verify
      .services(process.env.TWILIO_VERIFICATION_SERVICE_ID)
      .verificationChecks.create({
         to: `+52${phone}`,
         code,
      })
      .then(async (data) => {
         // console.log(data)
         if (data.status == 'approved') {
            const userCount = await User.find({
               phone: data.to.slice(-10),
            }).countDocuments()
            if (userCount > 0) {
               const user = await User.findOne({ phone: data.to.slice(-10) })
               const token = await user.generateAuthToken()
               res.json({
                  _id: user._id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  stripeId: user.stripeId,
                  paymentMethod: user.paymentMethod,
                  isAdmin: user.isAdmin,
                  access: user.access,
                  token,
               })
            } else {
               res.status(200).send('Create a new user')
            }
         }
      })
})

// @desc    validate phone verification code
// @route   GET /api/verification/edit-phone-code-validation
// @access  Public
const validateEditPhoneVerificationCode = asyncHandler(async (req, res) => {
   // console.log('verification attempt: ' + req.query.phone + ' and ' + req.query.code)
   const { phone, code } = req.query
   client.verify
      .services(process.env.TWILIO_VERIFICATION_SERVICE_ID)
      .verificationChecks.create({
         to: `+${phone}`,
         code,
      })
      .then(async (data) => {
         // console.log(data)
         if (data.status == 'approved') {
            res.status(200).send('approved')
         } else {
            res.status(204).send('wrong code')
         }
      })
})

// @desc    DEV validate phone verification code
// @route   GET /api/verification/phone-verification-code-dev
// @access  Public
const getVerificationCodeDev = asyncHandler(async (req, res) => {
   res.status(200).send('Keep it up!')
})

// @desc    validate phone verification code
// @route   GET /api/verification/phone-code-validation-dev
// @access  Public
const validateVerificationCodeDev = asyncHandler(async (req, res) => {
   const userCount = await User.find({
      phone: req.query.phone.slice(-10),
   }).countDocuments()
   if (userCount > 0) {
      const user = await User.findOne({ phone: req.query.phone.slice(-10) })
      const token = await user.generateAuthToken()
      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         phone: user.phone,
         stripeId: user.stripeId,
         paymentMethod: user.paymentMethod,
         isAdmin: user.isAdmin,
         access: user.access,
         token,
      })
   } else {
      res.status(200).send('Create a new user')
   }
})

// @desc    validate phone verification code
// @route   GET /api/verification/edit-phone-code-validation-dev
// @access  Public
const validateEditPhoneVerificationCodeDev = asyncHandler(async (req, res) => {
   res.status(200).send('approved')
})

export {
   getVerificationCode,
   getVerificationCodeDev,
   validateVerificationCode,
   validateVerificationCodeDev,
   validateEditPhoneVerificationCode,
   validateEditPhoneVerificationCodeDev,
}
