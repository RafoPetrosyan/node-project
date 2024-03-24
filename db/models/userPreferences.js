'use strict'
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
const SubCategories = require('./subCategories')
const User = require('./user')

class UserPreferences extends Model {}

UserPreferences.init(
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
      sub_category_id: {
         type: DataTypes.BIGINT,
         allowNull: false,
      },
   },
   {
      sequelize,
      modelName: 'UserPreferences',
   },
)

User.hasMany(UserPreferences, {
   foreignKey: 'user_id',
   as: 'preferences',
})

SubCategories.hasMany(UserPreferences, {
   foreignKey: 'sub_category_id',
   as: 'preferences',
})

UserPreferences.belongsTo(SubCategories, {
   foreignKey: 'sub_category_id',
   as: 'sub_category',
   onDelete: 'CASCADE',
})

module.exports = UserPreferences
