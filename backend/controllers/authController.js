const bcrypt = require("bcryptjs");

const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const errorResponse = require("../utils/errorResponse");
const { isValidEmail } = require("../utils/validators");


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, "Name, email and password are required");
    }

    if (!String(name).trim()) {
      return errorResponse(res, 400, "Name cannot be empty");
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, "Please provide a valid email address");
    }

    if (password.length < 6) {
      return errorResponse(res, 400, "Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      return errorResponse(res, 409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "TEAM_MEMBER",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        token,
      },
    });
  } catch (error) {
    console.error("register error:", error);
    return errorResponse(res, 500, "Failed to register user", error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required");
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, "Please provide a valid email address");
    }

    const user = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Account is inactive. Please contact admin.");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        token,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return errorResponse(res, 500, "Failed to login", error);
  }
};

const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: req.user,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return errorResponse(res, 500, "Failed to fetch profile", error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};