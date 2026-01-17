require('dotenv').config();


module.exports = {
  UPLOADS_DIR: process.env.UPLOADS_DIR || require('path').resolve(__dirname, '../public/uploads'),
  "development": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE,
    "host": process.env.DATABASE_HOST,
    "port": process.env.DATABASE_PORT,
    "logging": false,
    "dialect": process.env.DATABASE_DIALECT,
    // "dialectOptions": {
    //   "ssl": {
    //     "require": true,
    //     "rejectUnauthorized": false
    //   },
    // }
  },

}