'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Change the column to include the new ENUM value
    await queryInterface.addColumn('Users', 'archive', {
      type: Sequelize.STRING,
      defaultValue: ''
    });
    await queryInterface.addColumn('Users', 'first_pack', {
      type: Sequelize.DATE,
      defaultValue: null
    });
    await queryInterface.addColumn('Users', 'last_pack', {
      type: Sequelize.DATE,
      defaultValue: null
    });
    await queryInterface.addColumn('Users', 'level', {
      type: Sequelize.INTEGER,
      defaultValue: 1
    });
  },
};