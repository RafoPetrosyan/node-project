'use strict'
const { Model, DataTypes } = require('sequelize')
const md5 = require('md5')
const { signInProviders } = require('constants/index')
const { PASSWORD_SECRET, BASE_URL } = process.env

module.exports = (sequelize) => {
   class User extends Model {
      static hashPassword = (password) => md5(md5(password) + PASSWORD_SECRET)
   }

   User.init(
      {
         first_name: DataTypes.STRING,
         last_name: DataTypes.STRING,
         email: DataTypes.STRING,
         phone_number: DataTypes.STRING,
         password: {
            type: DataTypes.CHAR(32),
            set(password) {
               if (password) {
                  this.setDataValue('password', User.hashPassword(password))
               }
            },
            get() {
               return undefined
            },
         },
         avatar: {
            type: DataTypes.STRING,
            defaultValue: '',
            get() {
               const value = this.getDataValue('avatar')
               return value ? `${BASE_URL}${value}` : ''
            },
         },
         verified: DataTypes.BOOLEAN,
         is_completed: DataTypes.BOOLEAN,
         provider: {
            type: DataTypes.ENUM(...signInProviders),
            get() {
               return undefined
            },
         },
         verification_code: {
            type: DataTypes.CHAR(6),
            get() {
               return undefined
            },
         },
         role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
         },
      },
      {
         sequelize,
         modelName: 'User',
      },
   )
   return User
}
