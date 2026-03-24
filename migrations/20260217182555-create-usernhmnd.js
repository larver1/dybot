'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'reminders', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  }
};