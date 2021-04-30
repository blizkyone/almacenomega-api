import sharp from 'sharp'
import asyncHandler from 'express-async-handler'
import axios from 'axios'
import {
   uploadToItemsS3Bucket,
   getItemImagesFromS3Bucket,
   deletePictureFromItemS3Bucket,
} from '../config/s3.js'
import Item from '../models/itemModel.js'

// @desc    upload item picture to amazonS3
// @route   POST /api/upload/itemImage?item=${item}
// @access  Private, Admin
const uploadItemPicture = asyncHandler(async (req, res) => {
   let buffer
   if (req.file) {
      buffer = await sharp(req.file.buffer)
         .resize({ width: 1080, height: 1080 })
         .jpeg()
         .toBuffer()
      let response = await uploadToItemsS3Bucket(buffer, req.query.item)
      await Item.findByIdAndUpdate(
         req.query.item,
         {
            $addToSet: { images: response },
         },
         { new: true }
      )

      res.send(response)
   } else {
      throw new Error('No image file received')
   }
})

// @desc    upload item picture to amazonS3
// @route   POST /api/upload/itemImage?item=${item}
// @access  Private, Admin
const getItemPictures = asyncHandler(async (req, res) => {
   let response = await getItemImagesFromS3Bucket(req.query.item)
   //    console.log(response)
   if (response.Contents) {
      let photoUrlArray = response.Contents.map(
         (x) => `https://s3.us-east-1.amazonaws.com/aoitems/${x.Key}`
      )
      res.send(photoUrlArray)
   } else {
      res.send([])
   }
})

// @desc    delete item picture from amazonS3
// @route   DELETE /api/upload/itemImage?key=${key}
// @access  Private, Admin
const deleteItemPicture = asyncHandler(async (req, res) => {
   let response = await deletePictureFromItemS3Bucket(req.query.key)
   await Item.findByIdAndUpdate(
      req.query.item,
      {
         $pull: { images: req.query.key },
      },
      { new: true }
   )
   // console.log(response)
   res.send(`photo ${req.query.key} deleted`)
})

export { uploadItemPicture, getItemPictures, deleteItemPicture }
