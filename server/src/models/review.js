'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    
    
    static associate(models) {
        Review.belongsTo(models.User, { foreignKey: "userId", as: "user" });
        Review.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
    }
  }
  Review.init({
    userId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT,

  }, {
    sequelize,
    modelName: 'Review',
    indexes: [{ unique: true, fields: ["userId", "productId"] }],
  });

  return Review;
};
