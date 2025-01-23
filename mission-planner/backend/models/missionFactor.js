'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MissionFactor extends Model {
    static associate(models) {
      // A mission factor belongs to a mission
      MissionFactor.belongsTo(models.Mission, {
        foreignKey: 'missionId',
        as: 'mission'
      });
      
      // A mission factor is created by a user
      MissionFactor.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });

      // A mission factor can have many likes
      MissionFactor.hasMany(models.Like, {
        foreignKey: 'factorId',
        as: 'likes'
      });
    }
  }
  
  MissionFactor.init({
    missionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    factorType: {
      type: DataTypes.ENUM(
        'success',
        'constraint',
        'relevant_fact',
        'relevant_assumption',
        'driver',
        'course_of_action'
      ),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'MissionFactor',
    tableName: 'mission_factors',
    timestamps: true
  });
  
  return MissionFactor;
};
