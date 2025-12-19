import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js'

import authRoutes from './routes/auth.js'
import restaurantRoutes from './routes/restaurants.js'
import geocodeRoutes from './routes/geocode.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/geocode', geocodeRoutes)

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API KapaLunch opérationnelle',
    timestamp: new Date().toISOString()
  })
})

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route non trouvée' 
  })
})

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack)
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`)
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API disponible sur: http://localhost:${PORT}/api`)
})

export default app