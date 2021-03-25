import path from 'path'
import http from 'http'
import os from 'os'
import https from 'https'
import fs from 'fs'
import express from 'express'
// import dotenv from 'dotenv'
import cors from 'cors'
import colors from 'colors'
import morgan from 'morgan'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'

import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

// dotenv.config()

connectDB()

const app = express()
app.use(cors())

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/upload', uploadRoutes)

// app.get('/api/config/paypal', (req, res) =>
//   res.send(process.env.PAYPAL_CLIENT_ID)
// )

// const __dirname = path.resolve()
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

if (process.env.NODE_ENV === 'production') {
   //   app.use(express.static(path.join(__dirname, '/frontend/build')))
   //   app.get('*', (req, res) =>
   //     res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
   //   )
} else {
   app.get('/', (req, res) => {
      res.send('API is running....')
   })
}

app.use(notFound)
app.use(errorHandler)

//Server setup
const port = process.env.PORT
const sslport = process.env.SSLPORT

if (app.get('env') === 'development') {
   app.use(morgan('dev'))

   const sslKeyPath = path.join(
      os.homedir(),
      'Desktop/Desarrollo/ssl/localhost.key'
   )
   const sslCertPath = path.join(
      os.homedir(),
      'Desktop/Desarrollo/ssl/localhost.cert'
   )

   const sslserver = https.createServer(
      {
         key: fs.readFileSync(sslKeyPath),
         cert: fs.readFileSync(sslCertPath),
      },
      app
   )

   sslserver.listen(sslport, () => {
      console.log(
         `Server running in ${process.env.NODE_ENV} mode on port ${sslport}`
            .yellow.bold
      )
   })
} else {
   const server = http.createServer(app)

   server.listen(port, () => {
      console.log(
         `Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow
            .bold
      )
   })
}

const PORT = process.env.PORT || 5000
