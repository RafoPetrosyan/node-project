'use strict'
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
const Categories = require('./categories')
const { languages } = require('../../constants/index')

class CategoryLanguages extends Model {}

CategoryLanguages.init(
   {
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         allowNull: false,
         primaryKey: true,
      },
      category_id: {
         allowNull: false,
         type: DataTypes.BIGINT,
      },
      name: {
         type: DataTypes.STRING,
      },
      language: {
         type: DataTypes.ENUM(...languages),
      },
   },
   {
      sequelize,
      modelName: 'CategoryLanguages',
   },
)

Categories.hasMany(CategoryLanguages, {
   foreignKey: 'category_id',
   as: 'lang',
   onDelete: 'cascade',
})

module.exports = CategoryLanguages
