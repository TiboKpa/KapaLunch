import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/database.js'
import seedAdmin from './config/seed.js'

import authRoutes from './routes/auth.js'
import restaurantRoutes from './routes/restaurants.js'
import geocodeRoutes from './routes/geocode.js'
import userRoutes from './routes/users.js'
import reviewRoutes from './routes/reviews.js'

dotenv.config()

// Configuration des chemins pour ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Connexion DB et seed admin
connectDB().then(() => {
  seedAdmin()
})

// CORS configuration - allow self origin
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/geocode', geocodeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API KapaLunch opérationnelle',
    timestamp: new Date().toISOString()
  })
})

// Servir les fichiers statiques du frontend en production
// Le dossier 'public' sera au même niveau que 'src' ou à la racine de l'app une fois buildé
const distPath = path.join(__dirname, '../public')
app.use(express.static(distPath))

// Pour toute autre route, renvoyer l'index.html (SPA)
app.get('*', (req, res) => {
  // Ignorer les requêtes API qui n'ont pas matché
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Route API non trouvée' })
  }
  res.sendFile(path.join(distPath, 'index.html'))
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
  console.log(`📂 Serving static files from: ${distPath}`)
})

export default app