const express = require("express");

const {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("MANAGER", "ADMIN"), getUsers);

router.get("/:id", protect, authorizeRoles("MANAGER", "ADMIN"), getUserById);

router.patch("/:id/role", protect, authorizeRoles("ADMIN"), updateUserRole);

router.patch("/:id/status", protect, authorizeRoles("ADMIN"), updateUserStatus);

module.exports = router;