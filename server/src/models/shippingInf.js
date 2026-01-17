'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ShippingInf extends Model {
    static associate(models) {
      ShippingInf.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  ShippingInf.init({
    userId: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    address: DataTypes.TEXT,
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ShippingInf',
  });

  return ShippingInf;
};

