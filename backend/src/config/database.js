import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options)

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`)
    console.log(`📋 Base de données: ${conn.connection.name}`)

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB déconnecté')
    })

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message)
    process.exit(1)
  }
}

export default connectDB