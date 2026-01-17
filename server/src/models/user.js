'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
      User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasMany(models.ShippingInf, { foreignKey: 'userId', as: 'shippingAddresses' });
      User.hasOne(models.Cart, { foreignKey: "userId", as: "cart" });
      User.hasMany(models.Review, { foreignKey: "userId", as: "reviews" });
    }
  }
  User.init({
    userName: DataTypes.STRING,
    phoneNumber: DataTypes.INTEGER,
    password:DataTypes.STRING,
    role: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};

