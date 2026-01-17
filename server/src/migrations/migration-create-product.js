'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },

            price:{
                allowNull:true,
                type:Sequelize.INTEGER,
            },
            description:{
                allowNull:true,
                type: Sequelize.TEXT,
            },
            name:{
                allowNull:true,
                type: Sequelize.STRING,
            },
            quantity:{
                allowNull:true,
                type:Sequelize.INTEGER,
            },
            categoryId:{
                allowNull:true,
                type:Sequelize.INTEGER,
            },
            status: {
                allowNull: true,
                type: Sequelize.STRING,
            },
            image: {
                allowNull: true,
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('Products');
    }
};