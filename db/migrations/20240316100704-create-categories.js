'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Categories', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT,
         },
         image: {
            type: Sequelize.STRING,
            defaultValue: '',
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Categories')
   },
}
