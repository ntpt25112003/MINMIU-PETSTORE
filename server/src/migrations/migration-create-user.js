'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            phoneNumber:{
                allowNull:true,
                type:Sequelize.INTEGER,
            },
            userName:{
                allowNull:true,
                type: Sequelize.STRING,
            },
            password:{
                allowNull:true,
                type: Sequelize.STRING,
            },
            role:{
                allowNull:true,
                type: Sequelize.STRING,
                defaultValue: 'user',
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
        await queryInterface.dropTable('Users');
    }
};