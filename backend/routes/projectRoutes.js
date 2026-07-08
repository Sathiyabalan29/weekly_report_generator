const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignUsersToProject,
  getProjectMembers,
  removeUserFromProject,
  getMyAssignedProjects,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/my-assigned",
  protect,
  authorizeRoles("TEAM_MEMBER"),
  getMyAssignedProjects
);

router.get("/", protect, authorizeRoles("MANAGER", "ADMIN"), getProjects);

router.get("/:id", protect, authorizeRoles("MANAGER", "ADMIN"), getProjectById);

router.post("/", protect, authorizeRoles("MANAGER", "ADMIN"), createProject);

router.put("/:id", protect, authorizeRoles("MANAGER", "ADMIN"), updateProject);

router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteProject);

router.post(
  "/:id/assign-users",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  assignUsersToProject
);

router.get(
  "/:id/members",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  getProjectMembers
);

router.delete(
  "/:projectId/members/:userId",
  protect,
  authorizeRoles("ADMIN"),
  removeUserFromProject
);

module.exports = router;