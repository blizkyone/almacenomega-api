import stripeModule from 'stripe'

const stripe = stripeModule(process.env.STRIPE_TEST_SECRET_KEY)

export default stripe
