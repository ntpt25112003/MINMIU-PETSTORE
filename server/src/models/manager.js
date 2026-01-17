'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Manager extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
    //   Manager.hasMany(models.Product, { foreignKey: 'customerId', as: 'customerData', constraints: false });
    }
  }
  Manager.init({
    userName: DataTypes.STRING,
    phoneNumber: DataTypes.INTEGER,
    password: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Manager',
  });

  return Manager;
};
