import mongoose from 'mongoose'

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du restaurant est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  address: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true
  },
  lat: {
    type: Number,
    required: [true, 'La latitude est requise'],
    min: -90,
    max: 90
  },
  lon: {
    type: Number,
    required: [true, 'La longitude est requise'],
    min: -180,
    max: 180
  },
  type: {
    type: String,
    trim: true,
    enum: [
      'Français', 'Italien', 'Asiatique', 'Fast-food', 
      'Pizza', 'Burger', 'Japonais', 'Indien', 
      'Mexicain', 'Autre', ''
    ],
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isValidated: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

restaurantSchema.index({ lat: 1, lon: 1 })
restaurantSchema.index({ name: 'text', address: 'text' })

restaurantSchema.methods.toJSON = function() {
  const restaurant = this.toObject()
  delete restaurant.__v
  return restaurant
}

const Restaurant = mongoose.model('Restaurant', restaurantSchema)

export default Restaurant