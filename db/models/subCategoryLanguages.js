'use strict'
const { Model, DataTypes } = require('sequelize')
const sequelize = require('../sequelize')
const { languages } = require('../../constants/index')

class SubCategoryLanguages extends Model {}

SubCategoryLanguages.init(
   {
      id: {
         type: DataTypes.BIGINT,
         autoIncrement: true,
         allowNull: false,
         primaryKey: true,
      },
      sub_category_id: {
         type: DataTypes.BIGINT,
         allowNull: false,
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
      modelName: 'SubCategoryLanguages',
   },
)

module.exports = SubCategoryLanguages
