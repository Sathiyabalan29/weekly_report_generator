const User = require("../models/user");
const errorResponse = require("../utils/errorResponse");
const { isValidBoolean, normalizePagination } = require("../utils/validators");

// GET ALL USERS - MANAGER / ADMIN
const getUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const { page, limit, offset } = normalizePagination(req.query);

    const whereCondition = {};

    if (role) {
      const allowedRoles = ["TEAM_MEMBER", "MANAGER", "ADMIN"];

      if (!allowedRoles.includes(role)) {
        return errorResponse(res, 400, "Invalid role filter");
      }

      whereCondition.role = role;
    }

    if (isActive !== undefined) {
      if (!["true", "false"].includes(isActive)) {
        return errorResponse(res, 400, "isActive must be true or false");
      }

      whereCondition.isActive = isActive === "true";
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "name", "email", "role", "isActive", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
      data: rows,
    });
  } catch (error) {
    console.error("getUsers error:", error);
    return errorResponse(res, 500, "Failed to fetch users", error);
  }
};

// GET USER BY ID - MANAGER / ADMIN
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "isActive", "createdAt"],
    });

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return errorResponse(res, 500, "Failed to fetch user", error);
  }
};

// UPDATE USER ROLE - ADMIN ONLY
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["TEAM_MEMBER", "MANAGER", "ADMIN"];

    if (!role || !allowedRoles.includes(role)) {
      return errorResponse(res, 400, "Valid role is required");
    }

    if (Number(id) === Number(req.user.id)) {
      return errorResponse(res, 400, "You cannot change your own role");
    }

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    return errorResponse(res, 500, "Failed to update user role", error);
  }
};

// ACTIVATE / DEACTIVATE USER - ADMIN ONLY
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidBoolean(isActive)) {
      return errorResponse(res, 400, "isActive must be true or false");
    }

    if (Number(id) === Number(req.user.id)) {
      return errorResponse(res, 400, "You cannot change your own active status");
    }

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    user.isActive = isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("updateUserStatus error:", error);
    return errorResponse(res, 500, "Failed to update user status", error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
};