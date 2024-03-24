'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Calendars', {
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
         day: {
            type: Sequelize.DATEONLY,
         },
         start_time: {
            type: Sequelize.TIME,
         },
         end_time: {
            type: Sequelize.TIME,
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Calendars')
   },
}
