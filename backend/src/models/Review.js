import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import User from './User.js'
import Restaurant from './Restaurant.js'

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'La note doit être entre 1 et 5' },
      max: { args: [5], msg: 'La note doit être entre 1 et 5' }
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Le commentaire ne peut pas dépasser 500 caractères'
      }
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id'
    }
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  indexes: [
    {
      fields: ['restaurantId']
    },
    {
      fields: ['userId']
    }
  ]
})

// Relations
Review.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author'
})

Review.belongsTo(Restaurant, {
  foreignKey: 'restaurantId',
  as: 'restaurant'
})

User.hasMany(Review, {
  foreignKey: 'userId',
  as: 'reviews'
})

Restaurant.hasMany(Review, {
  foreignKey: 'restaurantId',
  as: 'reviews'
})

export default Review