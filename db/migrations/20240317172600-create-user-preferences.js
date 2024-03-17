'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('UserPreferences', {
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
               model: 'User',
               key: 'id',
            },
            onDelete: 'CASCADE',
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
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('UserPreferences')
   },
}
