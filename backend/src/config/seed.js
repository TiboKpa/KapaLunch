import User from '../models/User.js'
import { connectDB } from './database.js'

const seedAdmin = async () => {
  try {
    await connectDB()

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: 'admin' } })
    
    if (existingAdmin) {
      console.log('✅ Admin par défaut existe déjà')
      return
    }

    // Créer l'admin par défaut
    await User.create({
      name: 'Administrateur',
      email: 'admin',
      password: 'admin',
      role: 'admin',
      isActive: true
    })

    console.log('✅ Admin par défaut créé : admin / admin')
    console.log('⚠️  IMPORTANT : Changez le mot de passe après la première connexion !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  }
}

export default seedAdmin