const { Op } = require("sequelize");

const WeeklyReport = require("../models/weeklyReport");
const User = require("../models/user");
const Project = require("../models/project");

const getReportWhereCondition = (filters) => {
  const { weekStartDate, weekEndDate, projectId, userId } = filters;

  const whereCondition = {
    status: "SUBMITTED",
  };

  if (weekStartDate && weekEndDate) {
    whereCondition.weekStartDate = {
      [Op.between]: [weekStartDate, weekEndDate],
    };
  }

  if (projectId) {
    whereCondition.projectId = projectId;
  }

  if (userId) {
    whereCondition.userId = userId;
  }

  return whereCondition;
};

const cleanText = (value) => {
  if (!value) return "Not mentioned";
  return String(value).replace(/\s+/g, " ").trim();
};

const buildReportContext = (reports) => {
  if (reports.length === 0) {
    return "No submitted reports found for the selected filters.";
  }

  return reports
    .map((report, index) => {
      return `
Report ${index + 1}
Team member: ${report.user?.name || "Unknown"}
Project: ${report.project?.name || "Unknown"}
Week: ${report.weekStartDate} to ${report.weekEndDate}
Hours worked: ${report.hoursWorked || 0}
Tasks completed: ${cleanText(report.tasksCompleted)}
Tasks planned: ${cleanText(report.tasksPlanned)}
Blockers: ${cleanText(report.blockers)}
Notes: ${cleanText(report.notes)}
Submitted at: ${report.submittedAt}
      `.trim();
    })
    .join("\n\n");
};

const fetchSubmittedReports = async (filters) => {
  const whereCondition = getReportWhereCondition(filters);

  const reports = await WeeklyReport.findAll({
    where: whereCondition,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
      {
        model: Project,
        as: "project",
        attributes: ["id", "name"],
      },
    ],
    order: [["submittedAt", "DESC"]],
    limit: 30,
  });

  return reports;
};

const callAI = async ({ question, context }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  const systemInstruction = `
You are an AI assistant for a Weekly Report Generator system.

Your job:
- Help managers understand team activity.
- Answer only using the provided weekly report context.
- Summarize completed work, planned work, blockers, workload, and team/project activity.
- If the answer is not available in the context, say that the data is not available.
- Do not invent team members, projects, dates, tasks, or blockers.
- Keep the answer clear, professional, and useful for a manager.
  `.trim();

  const prompt = `
Manager question:
${question}

Retrieved weekly report context:
${context}
  `.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message || "Failed to generate AI response with Gemini";
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || "AI response could not be generated.";
};

// POST /api/ai/chat
const chatWithAssistant = async (req, res) => {
  try {
    const { question, weekStartDate, weekEndDate, projectId, userId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const reports = await fetchSubmittedReports({
      weekStartDate,
      weekEndDate,
      projectId,
      userId,
    });

    const context = buildReportContext(reports);

    const answer = await callAI({
      question,
      context,
    });

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: {
        question,
        answer,
        reportsAnalyzed: reports.length,
        filters: {
          weekStartDate: weekStartDate || null,
          weekEndDate: weekEndDate || null,
          projectId: projectId || null,
          userId: userId || null,
        },
      },
    });
  } catch (error) {
    console.error("chatWithAssistant error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
      error: error.message,
    });
  }
};

// GET /api/ai/team-summary
const generateTeamSummary = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, projectId, userId } = req.query;

    const reports = await fetchSubmittedReports({
      weekStartDate,
      weekEndDate,
      projectId,
      userId,
    });

    const context = buildReportContext(reports);

    const answer = await callAI({
      question:
        "Generate a manager-friendly team summary highlighting completed work, planned work, blockers, workload distribution, and any risks.",
      context,
    });

    return res.status(200).json({
      success: true,
      message: "AI team summary generated successfully",
      data: {
        summary: answer,
        reportsAnalyzed: reports.length,
        filters: {
          weekStartDate: weekStartDate || null,
          weekEndDate: weekEndDate || null,
          projectId: projectId || null,
          userId: userId || null,
        },
      },
    });
  } catch (error) {
    console.error("generateTeamSummary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate team summary",
      error: error.message,
    });
  }
};

// GET /api/ai/blocker-summary
const generateBlockerSummary = async (req, res) => {
  try {
    const { weekStartDate, weekEndDate, projectId, userId } = req.query;

    const reports = await fetchSubmittedReports({
      weekStartDate,
      weekEndDate,
      projectId,
      userId,
    });

    const context = buildReportContext(reports);

    const answer = await callAI({
      question:
        "Analyze recurring blockers, explain their impact, and suggest manager follow-up actions.",
      context,
    });

    return res.status(200).json({
      success: true,
      message: "AI blocker summary generated successfully",
      data: {
        summary: answer,
        reportsAnalyzed: reports.length,
        filters: {
          weekStartDate: weekStartDate || null,
          weekEndDate: weekEndDate || null,
          projectId: projectId || null,
          userId: userId || null,
        },
      },
    });
  } catch (error) {
    console.error("generateBlockerSummary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate blocker summary",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAssistant,
  generateTeamSummary,
  generateBlockerSummary,
};