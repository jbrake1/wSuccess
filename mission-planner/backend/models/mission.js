'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mission extends Model {
    static associate(models) {
      Mission.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Mission.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
      Mission.hasMany(models.MissionParticipant, {
        foreignKey: 'missionId',
        as: 'participants'
      });
    }
  }
  Mission.init({
    userId: DataTypes.INTEGER,
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: DataTypes.TEXT,
    created: DataTypes.DATE,
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mission',
  });
  return Mission;
};
