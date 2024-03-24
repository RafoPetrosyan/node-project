'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Events', {
         id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
         },
         user_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
               model: 'Users',
               key: 'id',
            },
         },
         speaker_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
               model: 'Users',
               key: 'id',
            },
         },
         category_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
               model: 'Categories',
               key: 'id',
            },
         },
         longitude: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         latitude: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         name: {
            type: Sequelize.STRING,
         },
         details: {
            type: Sequelize.STRING,
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Events')
   },
}
