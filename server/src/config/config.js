require('dotenv').config();


module.exports = {
  UPLOADS_DIR: process.env.UPLOADS_DIR || require('path').resolve(__dirname, '../public/uploads'),
  "development": {
    "username": process.env.DATABASE_USERNAME || "root",
    "password": process.env.DATABASE_PASSWORD || "",
    "database": process.env.DATABASE || "petstore",
    "host": process.env.DATABASE_HOST || "localhost",
    "port": process.env.DATABASE_PORT || 3306,
    "logging": false,
    "dialect": process.env.DATABASE_DIALECT || "mysql",
    // "dialectOptions": {
    //   "ssl": {
    //     "require": true,
    //     "rejectUnauthorized": false
    //   },
    // }
  },

}