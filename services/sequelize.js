const { Sequelize } = require('sequelize')
const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE } =
   process.env

const sequelize = new Sequelize(POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD, {
   dialect: 'postgres',
   host: POSTGRES_HOST,
   port: POSTGRES_PORT,
})

module.exports = sequelize;
