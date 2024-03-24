'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('EventImages', {
         id: {
            type: Sequelize.BIGINT,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
         },
         event_id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            references: {
               model: 'Events',
               key: 'id',
            },
         },
         original: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         thumb: {
            type: Sequelize.STRING,
            allowNull: false,
         },
         is_cover: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('EventImages')
   },
}
