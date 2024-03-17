'use strict'
const { languages } = require('../../constants/index')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('CategoryLanguages', {
         id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
         },
         category_id: {
            allowNull: false,
            type: Sequelize.BIGINT,
            references: {
               model: 'Categories',
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
      await queryInterface.dropTable('CategoryLanguages')
   },
}
