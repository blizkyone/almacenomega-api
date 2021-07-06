import express from 'express'
const router = express.Router()
import {
   getVerificationCode,
   getVerificationCodeDev,
   validateVerificationCode,
   validateVerificationCodeDev,
   validateEditPhoneVerificationCode,
   validateEditPhoneVerificationCodeDev,
} from '../controllers/verificationControllers.js'

router.route('/phone-verification-code').get(getVerificationCode)
router.route('/phone-verification-code-dev').get(getVerificationCodeDev)
router.route('/phone-code-validation').get(validateVerificationCode)
router.route('/phone-code-validation-dev').get(validateVerificationCodeDev)
router
   .route('/edit-phone-code-validation')
   .get(validateEditPhoneVerificationCode)
router
   .route('/edit-phone-code-validation-dev')
   .get(validateEditPhoneVerificationCodeDev)

export default router
