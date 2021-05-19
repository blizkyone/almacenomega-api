import User from '../models/userModel.js'
import cron from 'node-cron'
import moment from 'moment'

const crontasks = () => {
   cron.schedule('*/3 * * * * *', async () => {
      console.log('begin collecting daily storage -----------')
      const today = moment().format('D')
      console.log(today)
      const users = await User.find(
         { billingDay: today },
         'name currentStorage maxStorage'
      ).lean()
      console.log(users)
      users.forEach((user) => {
         console.log(
            `Charge ${user.name} with id: ${user._id} using ${
               user.currentStorage
            } m2, the amount of ${
               user.maxStorage < 1 ? '$ 1,000.00' : `$ ${1000 + area * 350}`
            }`
         )
      })
   })
   return
}

export default crontasks
