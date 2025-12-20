import User from '../models/User.js'
import { connectDB } from './database.js'

const seedAdmin = async () => {
  try {
    await connectDB()

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: 'admin@kapalunch.local' } })
    
    if (existingAdmin) {
      console.log('✅ Admin par défaut existe déjà')
      return
    }

    // Créer l'admin par défaut
    await User.create({
      name: 'Administrateur',
      email: 'admin@kapalunch.local',
      password: 'Admin123!',
      role: 'admin',
      isActive: true
    })

    console.log('\n=========================================')
    console.log('✅ ADMIN PAR DÉFAUT CRÉÉ')
    console.log('=========================================')
    console.log('Email    : admin@kapalunch.local')
    console.log('Password : Admin123!')
    console.log('=========================================')
    console.log('⚠️  IMPORTANT : Changez ce mot de passe après la première connexion !')
    console.log('=========================================\n')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message)
  }
}

export default seedAdmin