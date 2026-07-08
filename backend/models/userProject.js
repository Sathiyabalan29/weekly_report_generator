const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = require("./user");
const Project = require("./project");

const UserProject = sequelize.define(
  "UserProject",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "user_projects",
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: "unique_user_project_assignment",
        fields: ["userId", "projectId"],
      },
    ],
  }
);

UserProject.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

UserProject.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

User.hasMany(UserProject, {
  foreignKey: "userId",
  as: "projectAssignments",
});

Project.hasMany(UserProject, {
  foreignKey: "projectId",
  as: "memberAssignments",
});

module.exports = UserProject;