const Project = require("../models/project");
const User = require("../models/user");
const UserProject = require("../models/userProject");


// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const existingProject = await Project.findOne({
      where: { name },
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project already exists",
      });
    }

    const project = await Project.create({
      name,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// GET ALL PROJECTS
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// GET ONE PROJECT
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.name = name || project.name;
    project.description =
      description !== undefined ? description : project.description;
    project.isActive =
      isActive !== undefined ? isActive : project.isActive;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await project.destroy();

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};
// ASSIGN USERS TO PROJECT - MANAGER / ADMIN
const assignUsersToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "userIds must be a non-empty array",
      });
    }

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const users = await User.findAll({
      where: {
        id: userIds,
        role: "TEAM_MEMBER",
        isActive: true,
      },
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some users are invalid, inactive, or not team members",
      });
    }

    const assignedUsers = [];

    for (const userId of userIds) {
      const existingAssignment = await UserProject.findOne({
        where: {
          userId,
          projectId: id,
        },
      });

      if (!existingAssignment) {
        const assignment = await UserProject.create({
          userId,
          projectId: id,
        });

        assignedUsers.push(assignment);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Users assigned to project successfully",
      data: {
        projectId: Number(id),
        assignedCount: assignedUsers.length,
        assignedUsers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign users to project",
      error: error.message,
    });
  }
};

// GET PROJECT MEMBERS - MANAGER / ADMIN
const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const members = await UserProject.findAll({
      where: {
        projectId: id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role", "isActive"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Project members fetched successfully",
      count: members.length,
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project members",
      error: error.message,
    });
  }
};

// REMOVE USER FROM PROJECT - ADMIN ONLY
const removeUserFromProject = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const assignment = await UserProject.findOne({
      where: {
        projectId,
        userId,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "User assignment not found",
      });
    }

    await assignment.destroy();

    return res.status(200).json({
      success: true,
      message: "User removed from project successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove user from project",
      error: error.message,
    });
  }
};
// GET MY ASSIGNED PROJECTS - TEAM MEMBER
const getMyAssignedProjects = async (req, res) => {
  try {
    const assignedProjects = await UserProject.findAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "description", "isActive"],
          where: {
            isActive: true,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const projects = assignedProjects.map((item) => item.project);

    return res.status(200).json({
      success: true,
      message: "Assigned projects fetched successfully",
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned projects",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignUsersToProject,
  getProjectMembers,
  removeUserFromProject,
  getMyAssignedProjects,
};