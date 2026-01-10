'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('Commands', {
      commandName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      // Whether the command can be used by players
      // Locked in events where a command is bugged and/or is being used for exploits.
      locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usernhmns');
  }
};