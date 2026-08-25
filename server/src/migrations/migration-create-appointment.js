'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      customerName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      phoneNumber: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      petName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      petType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      petBreed: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      petWeight: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      petImage: {
        allowNull: true,
        type: Sequelize.TEXT('long'),
      },
      serviceType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      estimatedPrice: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      appointmentDate: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      appointmentTime: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      symptoms: {
        allowNull: true,
        type: Sequelize.TEXT('long'),
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT('long'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Appointments');
  }
};
