'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Appointment.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    petName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    petType: {
      type: DataTypes.STRING, // "Chó", "Mèo", "Khác"
      allowNull: false,
    },
    petBreed: {
      type: DataTypes.STRING, // "Poodle", "Mèo Anh lông ngắn", etc.
      allowNull: true,
    },
    petWeight: {
      type: DataTypes.STRING, // "3.5kg", "5-10kg", etc.
      allowNull: true,
    },
    petImage: {
      type: DataTypes.TEXT('long'), // Support large base64 strings and URLs
      allowNull: true,
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estimatedPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    appointmentDate: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false,
    },
    appointmentTime: {
      type: DataTypes.STRING, // "9AM-11AM", "1PM-3PM", "3PM-5PM", "5PM-7PM"
      allowNull: false,
    },
    symptoms: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING, // "pending", "confirmed", "completed", "cancelled"
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'Appointments',
  });

  return Appointment;
};
