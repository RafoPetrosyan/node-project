'use strict'
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
const User = require('./user')

class Calendar extends Model {}

Calendar.init(
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
      day: {
         type: DataTypes.DATEONLY,
      },
      start_time: {
         type: DataTypes.TIME,
      },
      end_time: {
         type: DataTypes.TIME,
      },
   },
   {
      sequelize,
      modelName: 'Calendar',
   },
)

Calendar.belongsTo(User, {
   foreignKey: 'user_id',
   as: 'user',
})

User.hasMany(Calendar, {
   foreignKey: 'user_id',
   as: 'calendar',
})

module.exports = Calendar
