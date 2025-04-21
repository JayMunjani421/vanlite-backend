const express = require("express");
const multer = require('multer');
const { getSingleStudent, getAllStudent, insertStudent, updateStudent, deleteStudent, getStudentsByBusId, loginStudent } = require("../controllers/studentController");
const studentRoutes = express.Router();
const upload = multer();

studentRoutes.get("/viewsingledata/:student_id", getSingleStudent);
studentRoutes.get("/viewdata", getAllStudent);
studentRoutes.post("/insertdata", upload.none(), insertStudent);
studentRoutes.patch("/updatedata/:student_id",upload.none(),updateStudent);
studentRoutes.delete("/deletedata/:student_id",deleteStudent);
studentRoutes.post("/viewstudentbybus", getStudentsByBusId);
studentRoutes.post("/loginstudent", upload.none(), loginStudent);


module.exports = studentRoutes;