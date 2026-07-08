const express = require("express");

const authRoutes = require("./authRoutes");
const projectRoutes = require("./projectRoutes");
const reportRoutes = require("./reportRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const userRoutes = require("./userRoutes");
const aiRoutes = require("./aiRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/ai", aiRoutes);

module.exports = router;