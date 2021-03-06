import asyncHandler from 'express-async-handler'
import validator from 'validator'
import User from '../models/userModel.js'
import stripe from '../config/stripe.js'

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
   const { id, password } = req.body
   let user

   if (validator.isEmail(id)) {
      user = await User.findOne({ email: id })
   } else {
      user = await User.findOne({ phone: id })
   }

   if (user && (await user.matchPassword(password))) {
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
      // res.json(user)
   } else {
      res.status(401)
      throw new Error('Invalid identifier or password')
   }
})

// @desc    User logout
// @route   GET /api/users/logout
// @access  Private
const userLogout = asyncHandler(async (req, res) => {
   req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
   })
   // req.user.tokens = []
   await req.user.save()

   res.send(`User ${req.user.username} logged out`)
})

// @desc    Check if username is available
// @route   GET /api/users/validateUsername?username=
// @access  Public
const validateUsername = asyncHandler(async (req, res) => {
   try {
      const usernameExists = await User.exists({
         username: req.query.username,
      })

      if (usernameExists) {
         res.send('Username already taken')
      } else {
         res.send('Valid username')
      }
   } catch (e) {
      console.log('Error validateUsername: ' + e)
      throw new Error('Error validating username')
   }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
   console.log(req.body)
   const { name, email, password, phone } = req.body

   const userExists = await User.findOne({ email })

   if (userExists) {
      res.status(400)
      throw new Error('User already exists')
   }

   // const customer = await stripe.customers.create({ name, email })

   const user = await User.create({
      name,
      email,
      password,
      phone,
      // stripeId: customer.id,
      access: 'user',
   })

   if (user) {
      const token = await user.generateAuthToken()

      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         username: user.username,
         isAdmin: user.isAdmin,
         access: user.access,
         token,
         // token: generateToken(user._id),
      })
   } else {
      res.status(400)
      throw new Error('Invalid user data')
   }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id)

   if (user) {
      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         isAdmin: user.isAdmin,
         access: user.access,
      })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id)

   if (user) {
      const updates = Object.keys(req.body)
      updates.forEach((update) => {
         user[update] = req.body[update]
         return
      })
      // user.name = req.body.name || user.name
      // user.email = req.body.email || user.email
      // if (req.body.password) {
      //    user.password = req.body.password
      // }

      const updatedUser = await user.save()

      res.json({
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         isAdmin: updatedUser.isAdmin,
         stripeId: updatedUser.stripeId,
         paymentMethod: updatedUser.paymentMethod,
      })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
   const users = await User.find({})
   res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id)

   if (user) {
      await user.remove()
      res.json({ message: 'User removed' })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id).select('-password')

   if (user) {
      res.json(user)
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id)

   if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.isAdmin = req.body.isAdmin

      const updatedUser = await user.save()

      res.json({
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         isAdmin: updatedUser.isAdmin,
      })
   } else {
      res.status(404)
      throw new Error('User not found')
   }
})

export {
   authUser,
   userLogout,
   registerUser,
   validateUsername,
   getUserProfile,
   updateUserProfile,
   getUsers,
   deleteUser,
   getUserById,
   updateUser,
}
