'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('SubCategories', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.BIGINT,
         },
         category_id: {
            type: Sequelize.BIGINT,
            references: {
               model: 'Categories',
               key: 'id',
            },
            onDelete: 'CASCADE',
         },
         image: {
            type: Sequelize.STRING,
            defaultValue: '',
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('SubCategories')
   },
}
