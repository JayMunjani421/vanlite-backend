const express = require("express");
const multer = require("multer");
const { getSingleBus, getAllBus, insertBus, deleteBus, updateBus, loginBus } = require("../controllers/busController");

const busRoutes = express.Router();
const upload = multer();  // Only use Multer where needed

// Routes
busRoutes.get("/viewsingledata/:bus_id", getSingleBus);
busRoutes.get("/viewdata", getAllBus);
busRoutes.post("/insertdata", upload.none(), insertBus);
busRoutes.delete("/deletedata/:bus_id", deleteBus);
busRoutes.patch("/updatedata/:bus_id", upload.none(), updateBus);
busRoutes.post("/loginbus", upload.none(), loginBus);

module.exports = busRoutes;