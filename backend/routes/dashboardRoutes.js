const express = require("express");

const {
  getDashboardSummary,
  getSubmissionStatus,
  getWorkloadByProject,
  getTasksTrend,
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/summary",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  getDashboardSummary
);

router.get(
  "/submission-status",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  getSubmissionStatus
);

router.get(
  "/workload-by-project",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  getWorkloadByProject
);

router.get(
  "/tasks-trend",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  getTasksTrend
);

module.exports = router;