const express = require("express");

const {
  chatWithAssistant,
  generateTeamSummary,
  generateBlockerSummary,
} = require("../controllers/aiController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/chat",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  chatWithAssistant
);

router.get(
  "/team-summary",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  generateTeamSummary
);

router.get(
  "/blocker-summary",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  generateBlockerSummary
);

module.exports = router;