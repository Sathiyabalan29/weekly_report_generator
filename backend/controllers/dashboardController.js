const { Op } = require("sequelize");

const User = require("../models/user");
const Project = require("../models/project");
const WeeklyReport = require("../models/weeklyReport");

// DASHBOARD SUMMARY
const getDashboardSummary = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate } = req.query;

    const reportWhere = {};

    if (weekStartDate && weekEndDate) {
      reportWhere.weekStartDate = {
        [Op.between]: [weekStartDate, weekEndDate],
      };
    }

    const totalTeamMembers = await User.count({
      where: {
        role: "TEAM_MEMBER",
        isActive: true,
      },
    });

    const submittedReports = await WeeklyReport.findAll({
      where: {
        ...reportWhere,
        status: "SUBMITTED",
      },
      attributes: ["userId"],
      group: ["userId"],
    });

    const submittedMemberCount = submittedReports.length;

    const totalSubmittedReports = await WeeklyReport.count({
      where: {
        ...reportWhere,
        status: "SUBMITTED",
      },
    });

    const totalDraftReports = await WeeklyReport.count({
      where: {
        ...reportWhere,
        status: "DRAFT",
      },
    });

    const openBlockersCount = await WeeklyReport.count({
      where: {
        ...reportWhere,
        status: "SUBMITTED",
        blockers: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: "" },
          ],
        },
      },
    });

    const complianceRate =
      totalTeamMembers === 0
        ? 0
        : Math.round((submittedMemberCount / totalTeamMembers) * 100);

    const recentReports = await WeeklyReport.findAll({
      where: {
        status: "SUBMITTED",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
      order: [["submittedAt", "DESC"]],
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: {
        totalTeamMembers,
        submittedMemberCount,
        totalSubmittedReports,
        totalDraftReports,
        openBlockersCount,
        complianceRate,
        recentReports,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

// SUBMISSION STATUS BY TEAM MEMBER
const getSubmissionStatus = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate } = req.query;

    if (!weekStartDate || !weekEndDate) {
      return res.status(400).json({
        success: false,
        message: "weekStartDate and weekEndDate are required",
      });
    }

    const teamMembers = await User.findAll({
      where: {
        role: "TEAM_MEMBER",
        isActive: true,
      },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });

    const reports = await WeeklyReport.findAll({
      where: {
        weekStartDate,
      },
      attributes: ["id", "userId", "status", "submittedAt"],
    });

    const today = new Date();
    const selectedWeekEnd = new Date(weekEndDate);

    const result = teamMembers.map((member) => {
      const userReports = reports.filter((report) => report.userId === member.id);

      const hasSubmitted = userReports.some(
        (report) => report.status === "SUBMITTED"
      );

      const hasDraft = userReports.some((report) => report.status === "DRAFT");

      let status = "PENDING";

      if (hasSubmitted) {
        status = "SUBMITTED";
      } else if (selectedWeekEnd < today) {
        status = "LATE";
      } else if (hasDraft) {
        status = "PENDING";
      }

      return {
        userId: member.id,
        name: member.name,
        email: member.email,
        status,
        reportCount: userReports.length,
      };
    });

    const summary = {
      submitted: result.filter((item) => item.status === "SUBMITTED").length,
      pending: result.filter((item) => item.status === "PENDING").length,
      late: result.filter((item) => item.status === "LATE").length,
      totalMembers: teamMembers.length,
    };

    return res.status(200).json({
      success: true,
      message: "Submission status fetched successfully",
      filters: {
        weekStartDate,
        weekEndDate,
      },
      summary,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission status",
      error: error.message,
    });
  }
};

const getWorkloadByProject = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereCondition = {
      status: "SUBMITTED",
    };

    if (startDate && endDate) {
      whereCondition.weekStartDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const reports = await WeeklyReport.findAll({
      where: whereCondition,
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name"],
        },
      ],
    });

    const projectMap = {};

    reports.forEach((report) => {
      const projectId = report.project?.id;
      const projectName = report.project?.name || "Unknown Project";

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          projectId,
          projectName,
          reportCount: 0,
          totalHours: 0,
        };
      }

      projectMap[projectId].reportCount += 1;
      projectMap[projectId].totalHours += Number(report.hoursWorked || 0);
    });

    const data = Object.values(projectMap);

    return res.status(200).json({
      success: true,
      message: "Workload by project fetched successfully",
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workload by project",
      error: error.message,
    });
  }
};

const getTasksTrend = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereCondition = {
      status: "SUBMITTED",
    };

    if (startDate && endDate) {
      whereCondition.weekStartDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const reports = await WeeklyReport.findAll({
      where: whereCondition,
      attributes: ["id", "weekStartDate", "tasksCompleted"],
      order: [["weekStartDate", "ASC"]],
    });

    const trendMap = {};

    reports.forEach((report) => {
      const week = report.weekStartDate;

      if (!trendMap[week]) {
        trendMap[week] = {
          weekStartDate: week,
          submittedReports: 0,
          completedTaskEntries: 0,
        };
      }

      trendMap[week].submittedReports += 1;

      const taskLines = report.tasksCompleted
        ? report.tasksCompleted
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        : [];

      trendMap[week].completedTaskEntries += taskLines.length || 1;
    });

    const data = Object.values(trendMap);

    return res.status(200).json({
      success: true,
      message: "Tasks completed trend fetched successfully",
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks trend",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
  getSubmissionStatus,
  getWorkloadByProject,
  getTasksTrend,
};