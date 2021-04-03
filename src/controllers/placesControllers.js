import asyncHandler from 'express-async-handler'
import axios from 'axios'
import Pickup from '../models/pickupRequestModel.js'

// @desc    autocomplete places
// @route   GET /api/places/autocomplete?input=${input}
// @access  Private
const placeAutocomplete = asyncHandler(async (req, res) => {
   let { input } = req.query

   let googleResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=formatted_address,name,geometry&key=${process.env.GOOGLE_API_KEY}`
   )

   let places = googleResponse.data.candidates

   if (places) {
      res.json(places)
   } else {
      res.status(500)
      throw new Error('Something is wrong with the request to Goolge')
   }
})

// @desc    getDirectionsFromCoordinates
// @route   GET /api/places/getAddress?coordinates=${coordinates}
// @access  Private
const getAddress = asyncHandler(async (req, res) => {
   let googleResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.query.latlng}&result_type=street_address&key=${process.env.GOOGLE_API_KEY}`
   )

   if (googleResponse) {
      res.json(googleResponse.data.results[0].formatted_address)
   } else {
      res.status(500)
      throw new Error('Something is wrong with the request to Goolge')
   }
})

// @desc    get last pickup requests
// @route   GET /api/places/request-pickup?pageNumber=PAGENUMBER&filter=FILTER
// @access  Private
const pickupTrackingList = asyncHandler(async (req, res) => {
   const pageSize = 10
   const page = Number(req.query.pageNumber) || 1

   const count = await Pickup.countDocuments({
      user: req.user.id,
      //   isDelivered: false,
   })

   const pickupTrackingList = await Pickup.find({
      user: req.user.id,
      //   isDelivered: false,
   })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort('-createdAt')

   res.json({ pickupTrackingList, page, pages: Math.ceil(count / pageSize) })
})

// @desc    get last pickup requests
// @route   GET /api/places/request-pickup?pageNumber=PAGENUMBER&filter=FILTER
// @access  Private
const pickupRequestHistory = asyncHandler(async (req, res) => {
   const pageSize = 10
   const page = Number(req.query.pageNumber) || 1

   const count = await Pickup.countDocuments({ user: req.user.id })

   const history = await Pickup.find({
      user: req.user.id,
   })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort('-createdAt')

   res.json({ history, page, pages: Math.ceil(count / pageSize) })
})

// @desc    request pickup of a product
// @route   POST /api/places/request-pickup
// @access  Private
const requestPickup = asyncHandler(async (req, res) => {
   const {
      lat,
      lng,
      address,
      handling,
      comments,
      person,
      phone,
      name,
   } = req.body

   const location = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
   }

   const request = new Pickup({
      user: req.user.id,
      name,
      location,
      address,
      handling,
      comments,
      person,
      phone,
      status: 'Solicitado',
   })

   const newRequest = await request.save()

   if (newRequest) {
      res.status(201).json(newRequest)
   } else {
      res.status(500)
      throw new Error('Something is wrong with the request to Goolge')
   }
})

export {
   placeAutocomplete,
   getAddress,
   requestPickup,
   pickupRequestHistory,
   pickupTrackingList,
}
