const express = require("express");

const {
  createReport,
  getMyReports,
  getMyReportById,
  updateReport,
  submitReport,
  deleteReport,
  getSubmittedReports,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("TEAM_MEMBER"), createReport);

router.get(
  "/submitted",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  getSubmittedReports
);

router.get("/my", protect, authorizeRoles("TEAM_MEMBER"), getMyReports);

router.get("/my/:id", protect, authorizeRoles("TEAM_MEMBER"), getMyReportById);

router.put("/:id", protect, authorizeRoles("TEAM_MEMBER"), updateReport);

router.patch("/:id/submit", protect, authorizeRoles("TEAM_MEMBER"), submitReport);

router.delete("/:id", protect, authorizeRoles("TEAM_MEMBER"), deleteReport);

module.exports = router;