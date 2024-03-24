'use strict'
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
const User = require('./user')
const Categories = require('./categories')

class Events extends Model {}
Events.init(
   {
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         allowNull: false,
         primaryKey: true,
      },
      user_id: {
         type: DataTypes.BIGINT,
         allowNull: false,
      },
      speaker_id: {
         type: DataTypes.BIGINT,
         allowNull: false,
      },
      category_id: {
         type: DataTypes.BIGINT,
         allowNull: false,
      },
      longitude: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      latitude: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      name: {
         type: DataTypes.STRING,
      },
      details: {
         type: DataTypes.STRING,
      },
      start_date: {
         type: DataTypes.DATE,
      },
      end_date: {
         type: DataTypes.DATE,
      },
   },
   {
      timestamps: true,
      sequelize,
      tableName: 'events',
      modelName: 'events',
   },
)

Events.belongsTo(User, {
   foreignKey: 'user_id',
   as: 'user',
})

Events.belongsTo(User, {
   foreignKey: 'speaker_id',
   as: 'speaker',
})

Events.belongsTo(Categories, {
   foreignKey: 'category_id',
   as: 'category',
})

module.exports = Events
