const { Op } = require("sequelize");

const WeeklyReport = require("../models/weeklyReport");
const Project = require("../models/project");
const User = require("../models/user");
const UserProject = require("../models/userProject");

// Helper: only include internal error message outside production
const errorPayload = (error) => ({
  ...(process.env.NODE_ENV !== "production" && { error: error.message }),
});

// Helper: pagination
const getPagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// Helper: validate date
const isValidDate = (date) => {
  return !Number.isNaN(new Date(date).getTime());
};

// Helper: validate hours worked
const parseHoursWorked = (hoursWorked) => {
  if (hoursWorked === undefined) {
    return {
      shouldUpdate: false,
      value: undefined,
      error: null,
    };
  }

  if (hoursWorked === null || hoursWorked === "") {
    return {
      shouldUpdate: true,
      value: null,
      error: null,
    };
  }

  const value = Number(hoursWorked);

  if (Number.isNaN(value)) {
    return {
      shouldUpdate: false,
      value: undefined,
      error: "Hours worked must be a valid number",
    };
  }

  if (value < 0) {
    return {
      shouldUpdate: false,
      value: undefined,
      error: "Hours worked cannot be negative",
    };
  }

  return {
    shouldUpdate: true,
    value,
    error: null,
  };
};

// CREATE WEEKLY REPORT
const createReport = async (req, res) => {
  try {
    const {
      weekStartDate,
      weekEndDate,
      projectId,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
    } = req.body;

    if (
      !weekStartDate ||
      !weekEndDate ||
      !projectId ||
      !tasksCompleted ||
      !tasksPlanned
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Week start date, week end date, project, tasks completed and tasks planned are required",
      });
    }

    if (!String(tasksCompleted).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tasks completed cannot be empty",
      });
    }

    if (!String(tasksPlanned).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tasks planned cannot be empty",
      });
    }

    if (!isValidDate(weekStartDate) || !isValidDate(weekEndDate)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid week start and end dates",
      });
    }

    if (new Date(weekEndDate) < new Date(weekStartDate)) {
      return res.status(400).json({
        success: false,
        message: "Week end date cannot be before week start date",
      });
    }

    const parsedHours = parseHoursWorked(hoursWorked);

    if (parsedHours.error) {
      return res.status(400).json({
        success: false,
        message: parsedHours.error,
      });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // TEAM_MEMBER can create reports only for assigned projects
    if (req.user.role === "TEAM_MEMBER") {
      const assignedProject = await UserProject.findOne({
        where: {
          userId: req.user.id,
          projectId,
        },
      });

      if (!assignedProject) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this project",
        });
      }
    }

    const existingReport = await WeeklyReport.findOne({
      where: {
        userId: req.user.id,
        projectId,
        weekStartDate,
      },
    });

    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "A report for this project and week already exists",
      });
    }

    const report = await WeeklyReport.create({
      weekStartDate,
      weekEndDate,
      projectId,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked: parsedHours.shouldUpdate ? parsedHours.value : null,
      notes,
      userId: req.user.id,
      status: "DRAFT",
    });

    return res.status(201).json({
      success: true,
      message: "Weekly report created successfully",
      data: report,
    });
  } catch (error) {
    console.error("createReport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create weekly report",
      ...errorPayload(error),
    });
  }
};

// GET MY REPORTS
const getMyReports = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const { count, rows } = await WeeklyReport.findAndCountAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
      order: [["weekStartDate", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "My weekly reports fetched successfully",
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      data: rows,
    });
  } catch (error) {
    console.error("getMyReports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      ...errorPayload(error),
    });
  }
};

// GET ONE OF MY REPORTS
const getMyReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WeeklyReport.findOne({
      where: {
        id,
        userId: req.user.id,
      },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Weekly report fetched successfully",
      data: report,
    });
  } catch (error) {
    console.error("getMyReportById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      ...errorPayload(error),
    });
  }
};

// UPDATE MY REPORT
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WeeklyReport.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Submitted reports cannot be edited",
      });
    }

    const {
      weekStartDate,
      weekEndDate,
      projectId,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
    } = req.body;

    const hasField = (field) =>
      Object.prototype.hasOwnProperty.call(req.body, field);

    if (hasField("tasksCompleted") && !String(tasksCompleted).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tasks completed cannot be empty",
      });
    }

    if (hasField("tasksPlanned") && !String(tasksPlanned).trim()) {
      return res.status(400).json({
        success: false,
        message: "Tasks planned cannot be empty",
      });
    }

    if (hasField("projectId")) {
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Project is required",
        });
      }

      const project = await Project.findByPk(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // TEAM_MEMBER can update report project only to assigned projects
      if (req.user.role === "TEAM_MEMBER") {
        const assignedProject = await UserProject.findOne({
          where: {
            userId: req.user.id,
            projectId,
          },
        });

        if (!assignedProject) {
          return res.status(403).json({
            success: false,
            message: "You are not assigned to this project",
          });
        }
      }
    }

    const effectiveStartDate =
      weekStartDate !== undefined ? weekStartDate : report.weekStartDate;

    const effectiveEndDate =
      weekEndDate !== undefined ? weekEndDate : report.weekEndDate;

    if (!isValidDate(effectiveStartDate) || !isValidDate(effectiveEndDate)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid week start and end dates",
      });
    }

    if (new Date(effectiveEndDate) < new Date(effectiveStartDate)) {
      return res.status(400).json({
        success: false,
        message: "Week end date cannot be before week start date",
      });
    }

    const parsedHours = parseHoursWorked(hoursWorked);

    if (parsedHours.error) {
      return res.status(400).json({
        success: false,
        message: parsedHours.error,
      });
    }

    report.weekStartDate = effectiveStartDate;
    report.weekEndDate = effectiveEndDate;

    if (hasField("projectId")) report.projectId = projectId;
    if (hasField("tasksCompleted")) report.tasksCompleted = tasksCompleted;
    if (hasField("tasksPlanned")) report.tasksPlanned = tasksPlanned;
    if (hasField("blockers")) report.blockers = blockers;
    if (hasField("notes")) report.notes = notes;

    if (parsedHours.shouldUpdate) {
      report.hoursWorked = parsedHours.value;
    }

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Weekly report updated successfully",
      data: report,
    });
  } catch (error) {
    console.error("updateReport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update report",
      ...errorPayload(error),
    });
  }
};

// SUBMIT MY REPORT
const submitReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WeeklyReport.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Report is already submitted",
      });
    }

    if (!report.tasksCompleted || !report.tasksPlanned) {
      return res.status(400).json({
        success: false,
        message:
          "Report is incomplete. Tasks completed and tasks planned are required before submitting",
      });
    }

    report.status = "SUBMITTED";
    report.submittedAt = new Date();

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Weekly report submitted successfully",
      data: report,
    });
  } catch (error) {
    console.error("submitReport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit report",
      ...errorPayload(error),
    });
  }
};

// DELETE MY DRAFT REPORT
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WeeklyReport.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status === "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Submitted reports cannot be deleted",
      });
    }

    await report.destroy();

    return res.status(200).json({
      success: true,
      message: "Weekly report deleted successfully",
    });
  } catch (error) {
    console.error("deleteReport error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
      ...errorPayload(error),
    });
  }
};

// MANAGER / ADMIN - GET SUBMITTED REPORTS WITH FILTERS
const getSubmittedReports = async (req, res) => {
  try {
    const { userId, projectId, weekStartDate, startDate, endDate } = req.query;

    const { page, limit, offset } = getPagination(req.query);

    const whereCondition = {
      status: "SUBMITTED",
    };

    if (userId) {
      whereCondition.userId = userId;
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    if (startDate && endDate) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid start and end dates",
        });
      }

      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date",
        });
      }

      whereCondition.weekStartDate = {
        [Op.between]: [startDate, endDate],
      };
    } else if (weekStartDate) {
      if (!isValidDate(weekStartDate)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid week start date",
        });
      }

      whereCondition.weekStartDate = weekStartDate;
    }

    const { count, rows } = await WeeklyReport.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
      order: [["submittedAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Submitted reports fetched successfully",
      filters: {
        userId: userId || null,
        projectId: projectId || null,
        weekStartDate: weekStartDate || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("getSubmittedReports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch submitted reports",
      ...errorPayload(error),
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getMyReportById,
  updateReport,
  submitReport,
  deleteReport,
  getSubmittedReports,
};