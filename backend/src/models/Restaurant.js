import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import User from './User.js'

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom du restaurant est requis' },
      len: {
        args: [1, 100],
        msg: 'Le nom ne peut pas dépasser 100 caractères'
      }
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'L\'adresse est requise' }
    }
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [-90], msg: 'Latitude invalide' },
      max: { args: [90], msg: 'Latitude invalide' },
      notNull: { msg: 'La latitude est requise' }
    }
  },
  lon: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [-180], msg: 'Longitude invalide' },
      max: { args: [180], msg: 'Longitude invalide' },
      notNull: { msg: 'La longitude est requise' }
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
    validate: {
      isIn: {
        args: [[
          'Français', 'Italien', 'Japonais', 'Chinois', 'Coréen', 
          'Vietnamien', 'Asiatique', 'Indien', 'Thaïlandais',
          'Fast-food', 'Pizza', 'Burger', 'Mexicain', 'Autre', ''
        ]],
        msg: 'Type de cuisine invalide'
      }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La description ne peut pas dépasser 500 caractères'
      }
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isValidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'restaurants',
  timestamps: true,
  indexes: [
    {
      fields: ['lat', 'lon']
    },
    {
      fields: ['name']
    },
    {
      fields: ['address']
    }
  ]
})

// Relation: Un restaurant appartient à un utilisateur
Restaurant.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
})

// Relation inverse: Un utilisateur peut créer plusieurs restaurants
User.hasMany(Restaurant, {
  foreignKey: 'createdBy',
  as: 'restaurants'
})

export default Restaurant