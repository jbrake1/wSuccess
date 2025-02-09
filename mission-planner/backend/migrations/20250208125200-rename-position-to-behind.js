'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('mission_factors', 'position', 'behind');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('mission_factors', 'behind', 'position');
  }
};
