const express = require("express");
const multer = require("multer");
const adminRoutes = express.Router();
const { insertNewAdmin, updateAdminPassword, loginAdmin, adminProfile } = require("../controllers/adminController");
const { verifyToken } = require("../middleware/jwtMiddleware");

const upload = multer();  // Only use Multer where needed

adminRoutes.post("/insertnewadmin", upload.none(), insertNewAdmin);
adminRoutes.post("/passwordchange", upload.none(), updateAdminPassword);

// Public route (login doesn't require JWT)
adminRoutes.post("/login", upload.none(), loginAdmin);

// Protected route (requires JWT)
adminRoutes.get("/profile", verifyToken, adminProfile);

module.exports = adminRoutes;
