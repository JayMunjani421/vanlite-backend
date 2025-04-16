// const express = require("express");
// const multer = require("multer");
// const { getSingleArea, getAllArea, insertArea, deleteArea, updateArea } = require("../controllers/areaController");
// const areaRoutes = express.Router();
// const upload = multer();

// areaRoutes.get("/viewsingledata/:area_id", getSingleArea);
// areaRoutes.get("/viewdata", getAllArea);
// areaRoutes.post("/insertdata", upload.none(), insertArea);
// areaRoutes.delete("/deletedata/:area_id", deleteArea);
// areaRoutes.patch("/updatedata/:area_id", updateArea);

// module.exports = areaRoutes;

const express = require("express");
const multer = require("multer");
const { getSingleArea, getAllArea, insertArea, deleteArea, updateArea } = require("../controllers/areaController");

const areaRoutes = express.Router();
const upload = multer();  // Only use Multer where needed

// Routes
areaRoutes.get("/viewsingledata/:area_id", getSingleArea);
areaRoutes.get("/viewdata", getAllArea);

// Ensure it works for form-data
areaRoutes.post("/insertdata", upload.none(), insertArea);

areaRoutes.delete("/deletedata/:area_id", deleteArea);
areaRoutes.patch("/updatedata/:area_id", upload.none(), updateArea);

module.exports = areaRoutes;

