'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    
    static associate(models) {
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Order.init({
      //  userId: { type: DataTypes.INTEGER, references: { model: user, key: 'id' } },  
    userId: DataTypes.INTEGER,
    shippingAddress: DataTypes.STRING,
    status: DataTypes.STRING,
    totalPrice: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
};
