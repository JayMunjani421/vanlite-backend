const express = require("express");
const multer = require("multer");
const { insertAttendence, getAllAttendence, getType, insertAbsentStudent, checkAttendanceCount, insertAttendanceHomeToSchoolIN, insertAttendanceHomeToSchoolOUT, insertAttendanceHomeToSchoolABSENT, insertAttendanceSchoolToHomeIN, insertAttendanceSchoolToHomeOUT, insertAttendanceSchoolToHomeABSENT, getStudentAttendanceToday, getAttendenceDataForCalendar } = require("../controllers/attendenceController");

const attendenceRoutes = express.Router();
const upload = multer();  // Only use Multer where needed

// Routes
attendenceRoutes.get("/viewdata", getAllAttendence);
attendenceRoutes.post("/insertdata", upload.none(), insertAttendence);
attendenceRoutes.post("/gettype/:student_id", upload.none(), getType);
attendenceRoutes.post("/insertabsent", upload.none(), insertAbsentStudent);
attendenceRoutes.post("/checkattendencecount", upload.none(), checkAttendanceCount);
attendenceRoutes.post("/inserthometoschoolin", upload.none(), insertAttendanceHomeToSchoolIN);
attendenceRoutes.post("/inserthometoschoolout", upload.none(), insertAttendanceHomeToSchoolOUT);
attendenceRoutes.post("/inserthometoschoolabsent", upload.none(), insertAttendanceHomeToSchoolABSENT);
attendenceRoutes.post("/insertschooltohomein", upload.none(), insertAttendanceSchoolToHomeIN);
attendenceRoutes.post("/insertschooltohomeout", upload.none(), insertAttendanceSchoolToHomeOUT);
attendenceRoutes.post("/insertschooltohomeabsent", upload.none(), insertAttendanceSchoolToHomeABSENT);
attendenceRoutes.get("/getstudentattendancetoday/:student_id", getStudentAttendanceToday);
attendenceRoutes.post("/getattendencedataforcalendar/:student_id", getAttendenceDataForCalendar);

module.exports = attendenceRoutes;