'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ShippingInfs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            userId:{
                allowNull:false,
                type:Sequelize.INTEGER,
            },

            fullName:{
                allowNull:false,
                type: Sequelize.STRING,
            },

            phoneNumber:{
                allowNull:false,
                type: Sequelize.STRING,
            },

            address:{
                allowNull:false,
                type: Sequelize.TEXT,
            },

            isDefault:{
                allowNull:false,
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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
        await queryInterface.dropTable('ShippingInfs');
    }
};