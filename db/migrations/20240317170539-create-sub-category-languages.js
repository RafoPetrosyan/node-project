'use strict'
const { languages } = require('../../constants/index')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('SubCategoryLanguages', {
         id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
         },
         sub_category_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
               model: 'SubCategories',
               key: 'id',
            },
            onDelete: 'CASCADE',
         },
         name: {
            type: Sequelize.STRING,
         },
         language: {
            type: Sequelize.ENUM(...languages),
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('SubCategoryLanguages')
   },
}
