import { Sequelize } from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration SQLite
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  },
  dialectOptions: {
    // Activer les contraintes de clés étrangères au niveau de la connexion
    foreignKeys: true
  }
})

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log(`✅ SQLite connecté: ${dbPath}`)
    
    // Activer les contraintes de clés étrangères (méthode sécurisée)
    try {
      await sequelize.query('PRAGMA foreign_keys = ON', { raw: true })
      const [results] = await sequelize.query('PRAGMA foreign_keys', { raw: true })
      if (results[0]?.foreign_keys === 1) {
        console.log('✅ Contraintes de clés étrangères activées')
      }
    } catch (pragmaError) {
      console.warn('⚠️ Impossible d\'activer les contraintes de clés étrangères:', pragmaError.message)
    }
    
    // Synchroniser les modèles avec la base de données
    // Utilise 'force: false' en production et pas d'alter pour éviter les conflits
    await sequelize.sync({ force: false })
    console.log('✅ Modèles synchronisés')
    
  } catch (error) {
    console.error('❌ Erreur de connexion SQLite:', error.message)
    if (process.env.NODE_ENV === 'development') {
      console.error('Détails:', error)
    }
    process.exit(1)
  }
}

export { sequelize, connectDB }
export default connectDB