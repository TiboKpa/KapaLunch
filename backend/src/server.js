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
// On attend la connexion mais on ne bloque pas le démarrage du serveur pour les probes
connectDB().then(() => {
  seedAdmin()
}).catch(err => console.error("Database connection failed during startup", err));

// CORS configuration - allow self origin
// Important pour permettre les requêtes depuis le frontend hébergé sur le même domaine
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
// Le dossier 'public' contient les assets buildés copiés depuis le stage frontend
const distPath = path.join(__dirname, '../public')
app.use(express.static(distPath))

// Pour toute autre route, renvoyer l'index.html (SPA)
// Cela permet à React Router de gérer le routing côté client
app.get('*', (req, res) => {
  // Ignorer les requêtes API qui n'ont pas matché
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Route API non trouvée' })
  }
  
  // Vérifier si le fichier index.html existe avant de l'envoyer
  // Sinon renvoyer une erreur explicite pour le debug
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
      if (err) {
          console.error("Error serving index.html:", err);
          res.status(500).send("Error loading frontend application.");
      }
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`)
  console.log(`📂 Serving static files from: ${distPath}`)
})

export default app