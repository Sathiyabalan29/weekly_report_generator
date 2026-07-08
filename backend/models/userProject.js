const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = require("./user");
const Project = require("./project");

const WeeklyReport = sequelize.define(
  "WeeklyReport",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    weekEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    tasksCompleted: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    tasksPlanned: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    blockers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    hoursWorked: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: "Hours worked cannot be negative",
        },
      },
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("DRAFT", "SUBMITTED"),
      allowNull: false,
      defaultValue: "DRAFT",
    },

    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "weekly_reports",
    timestamps: true,
    indexes: [
      {
        unique: true,
        name: "unique_user_project_week",
        fields: ["userId", "projectId", "weekStartDate"],
      },
      {
        name: "idx_weekly_reports_status",
        fields: ["status"],
      },
      {
        name: "idx_weekly_reports_week_start",
        fields: ["weekStartDate"],
      },
    ],
  }
);

WeeklyReport.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

WeeklyReport.belongsTo(Project, {
  foreignKey: "projectId",
  as: "project",
});

module.exports = WeeklyReport;