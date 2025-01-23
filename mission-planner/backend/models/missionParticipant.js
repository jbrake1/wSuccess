'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MissionParticipant extends Model {
    static associate(models) {
      MissionParticipant.belongsTo(models.Mission, {
        foreignKey: 'missionId',
        as: 'mission'
      });
      MissionParticipant.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      MissionParticipant.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
    }
  }
  MissionParticipant.init({
    missionId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    createdBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MissionParticipant',
    tableName: 'mission_participants'
  });
  return MissionParticipant;
};
