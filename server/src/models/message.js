'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
    //   Message.hasMany(models.Product, { foreignKey: 'customerId', as: 'customerData', constraints: false });
    }
  }
  Message.init({
    userId: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    phoneNumber: DataTypes.INTEGER,
    email: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Message',
  });

  return Message;
};

