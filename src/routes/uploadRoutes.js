import express from 'express'
const router = express.Router()
import path from 'path'
import multer from 'multer'
import {
   uploadItemPicture,
   getItemPictures,
   deleteItemPicture,
   uploadOrderReceiptPicture,
   getOrderReceiptPicture,
   deleteOrderReceiptPicture,
} from '../controllers/uploadControllers.js'
import { protect, admin } from '../middleware/authMiddleware.js'

function checkFileType(file, cb) {
   const filetypes = /jpg|jpeg|png/
   //  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
   const mimetype = filetypes.test(file.mimetype)

   if (mimetype) {
      return cb(null, true)
   } else {
      console.log(`extname ${file.originalname}`)
      throw new Error('Images Only')
      cb('Images only!')
   }
}

const upload = multer({
   limits: {
      fileSize: 10000000,
   },
   fileFilter(req, file, cb) {
      checkFileType(file, cb)
   },
})

router
   .route('/itemImage')
   .post(protect, admin, upload.single('file'), uploadItemPicture)
   .get(protect, admin, getItemPictures)
   .delete(protect, admin, deleteItemPicture)
router
   .route('/orderImage')
   .post(protect, admin, upload.single('file'), uploadOrderReceiptPicture)
   .get(protect, admin, getOrderReceiptPicture)
   .delete(protect, admin, deleteOrderReceiptPicture)

export default router
