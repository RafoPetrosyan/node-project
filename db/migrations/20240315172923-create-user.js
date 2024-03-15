'use strict'
const { DataTypes } = require('sequelize')
const { signInProviders } = require('../../constants')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
      await queryInterface.createTable('Users', {
         id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.BIGINT,
         },
         email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
         },
         password: {
            type: Sequelize.CHAR(32),
            allowNull: false,
         },
         first_name: {
            type: Sequelize.STRING,
            defaultValue: '',
         },
         last_name: {
            type: Sequelize.STRING,
            defaultValue: '',
         },
         phone_number: {
            type: Sequelize.STRING,
            defaultValue: '',
         },
         avatar: {
            type: Sequelize.STRING,
            defaultValue: '',
         },
         verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
         },
         is_completed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
         },
         provider: {
            type: Sequelize.ENUM(...signInProviders),
         },
         verification_code: {
            type: Sequelize.CHAR(6),
         },
         role: {
            type: Sequelize.ENUM('user', 'admin'),
            defaultValue: 'user',
         },
         createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
         updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
         },
      })
   },
   async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('Users')
   },
}
