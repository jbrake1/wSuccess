'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      // A like belongs to a mission factor
      Like.belongsTo(models.MissionFactor, {
        foreignKey: 'factorId',
        as: 'factor'
      });
      
      // A like is created by a user
      Like.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
    }
  }
  
  Like.init({
    factorId: {
      type: DataTypes.INTEGER,
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
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true
  });
  
  return Like;
};
