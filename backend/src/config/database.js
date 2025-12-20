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
  }
})

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log(`✅ SQLite connecté: ${dbPath}`)
    
    // Activer les contraintes de clés étrangères pour l'intégrité des données
    await sequelize.query('PRAGMA foreign_keys = ON')
    console.log('✅ Contraintes de clés étrangères activées')
    
    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
    console.log('✅ Modèles synchronisés')
    
  } catch (error) {
    console.error('❌ Erreur de connexion SQLite:', error.message)
    process.exit(1)
  }
}

export { sequelize, connectDB }
export default connectDB