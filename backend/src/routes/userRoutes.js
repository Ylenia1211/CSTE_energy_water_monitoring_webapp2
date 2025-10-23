const express = require("express");
const userRoutes = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const isAdminMiddleware = require("../middlewares/isAdminMiddleware");

userRoutes.post("/password-reset/request", userController.requestPasswordReset);
userRoutes.post("/password-reset/reset", userController.resetPassword);

userRoutes.post(
  "/profile",
  authMiddleware,
  isAdminMiddleware,
  userController.addUser
);

userRoutes.get("/profile", authMiddleware, userController.getProfile);

userRoutes.put("/profile", authMiddleware, userController.updateProfile);

userRoutes.put(
  "/profile/:userId",
  authMiddleware,
  isAdminMiddleware,
  userController.updateUser
);

userRoutes.delete(
  "/profile/:userId",
  authMiddleware,
  isAdminMiddleware,
  userController.deleteUser
);

userRoutes.get(
  "/profiles",
  authMiddleware,
  isAdminMiddleware,
  userController.getAllUsers
);

module.exports = userRoutes;
