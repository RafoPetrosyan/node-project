'use strict'
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
const { BASE_URL } = process.env

class Categories extends Model {}

Categories.init(
   {
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         allowNull: false,
         primaryKey: true,
      },
      image: {
         type: DataTypes.STRING,
         defaultValue: '',
         get() {
            const value = this.getDataValue('image')
            return value ? `${BASE_URL}${value}` : ''
         },
      },
   },
   {
      sequelize,
      modelName: 'Categories',
   },
)

module.exports = Categories
