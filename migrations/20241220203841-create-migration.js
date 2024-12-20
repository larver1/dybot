'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define the new ENUM options
    const newEnumValues = [
      'sketch',
      'lineart',
      'colorblack',
      'colorcolor',
      'animated',
      'twitch',
      'pfp',
      'big',
    ];

    // Change the column to include the new ENUM value
    await queryInterface.changeColumn('order_items', 'type', {
      type: Sequelize.ENUM(newEnumValues),
      allowNull: false, // Keep the existing constraint
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Define the original ENUM options (without 'abc')
    const originalEnumValues = [
      'sketch',
      'lineart',
      'colorblack',
      'colorcolor',
      'animated',
    ];

    // Revert the column to the original ENUM values
    await queryInterface.changeColumn('YourTableName', 'type', {
      type: Sequelize.ENUM(originalEnumValues),
      allowNull: false, // Keep the existing constraint
    });
  },
};