const express = require('express');
const multer = require('multer');
const path = require('path');

const { insertSchool, deleteSchool, updateSchool, getSingleSchool, getAllSchool, loginSchool } = require('../controllers/schoolController');
const { checkSchoolExistence } = require('../middleware/checkSchool');

const schoolRoutes = express.Router();

// Temporary storage in memory before checking form data
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({ storage: memoryStorage });

// Final disk storage after validation
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = '.' + file.mimetype.split('/')[1];
        const filename = 'school_' + uniqueSuffix + fileExtension;
        cb(null, filename);
    }
});
const uploadToDisk = multer({ storage: diskStorage });

// Middleware to validate form fields before saving the file
const validateSchoolData = (req, resp, next) => {
    console.log("BODY BEFORE FILE UPLOAD:", req.body);

    const { school_name, school_address, school_email, school_password, start_date, school_manager_name, mobile_number } = req.body;

    if (!school_name || !school_address || !school_email || !school_password || !start_date || !school_manager_name || !mobile_number) {
        return resp.status(400).json({ "status": false, "message": "All fields are required" });
    }

    next();
};

schoolRoutes.get("/viewdata", getAllSchool);
schoolRoutes.get("/viewsingledata/:school_id", getSingleSchool);
schoolRoutes.post("/insertdata", uploadToDisk.single("school_logo"), insertSchool);
schoolRoutes.delete("/deletedata/:school_id", deleteSchool);
schoolRoutes.patch("/updatedata/:school_id", 
    checkSchoolExistence, 
    uploadToMemory.single("school_logo"),  // Upload to memory first
    validateSchoolData,                    // Validate fields before saving the file
    (req, resp, next) => {
        if (req.file) {
            // Move file from memory to disk
            const file = req.file;
            req.file.filename = `school_${Date.now()}-${Math.round(Math.random() * 1E9)}.${file.mimetype.split('/')[1]}`;
            require("fs").writeFileSync(`./uploads/${req.file.filename}`, file.buffer);
            req.file.path = `${req.file.filename}`;
        }

        next();
    },
    updateSchool
);

schoolRoutes.post("/loginschool",uploadToDisk.none(), loginSchool);

module.exports = schoolRoutes;


// const express = require('express');
// const multer = require('multer');

// const { insertSchool, deleteSchool, updateSchool, getSingleSchool, getAllSchool } = require('../controllers/schoolController');
// const { checkSchoolExistence } = require('../middleware/checkSchool');

// const schoolRoutes = express.Router();

// const validateSchoolData = (req, resp, next) => {
//     console.log("BODY:",req.body);
//     const { school_name, school_address, school_email, school_password, start_date, school_manager_name, mobile_number } = req.body;
    
//     if (!school_name || !school_address || !school_email || !school_password || !start_date || !school_manager_name || !mobile_number) {
//         return resp.status(400).json({ "status": false, "message": "All fields are required" });
//     }
    
//     next();
// };

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/');
//     },
//     filename: function (req, file, cb) {
//         console.log("reeeee",req.body);
//         if(file!=null)
//         {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//             const fileExtension = '.' + file.mimetype.split('/')[1];
//             // const fileExtension = '.' + file.originalname.split('.').pop();
//             const filename = 'school_' + uniqueSuffix + fileExtension;
//             cb(null, filename);
//         }
        
//     }
// });

// const upload = multer({ storage: storage });

// schoolRoutes.get("/viewdata", getAllSchool);
// schoolRoutes.get("/viewsingledata/:school_id", getSingleSchool);
// schoolRoutes.post("/insertdata", upload.single("school_logo"), insertSchool);
// schoolRoutes.delete("/deletedata/:school_id", deleteSchool);
// schoolRoutes.patch("/updatedata/:school_id", checkSchoolExistence, validateSchoolData, upload.single("school_logo"), updateSchool);

// module.exports = schoolRoutes;

// const express = require('express');
// const multer = require('multer');
// const { insertSchool } = require('../controllers/schoolController');

// const schoolRoutes = express.Router();

// // Configure multer storage options
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/');
//     },
//     filename: function (req, file, cb) {
//         // A temporary name; the final name will be decided in the controller
//         cb(null, file.originalname); 
//     }
// });

// // Multer upload middleware
// const upload = multer({ storage: storage });

// // Route to handle school data insertion and file upload
// schoolRoutes.post("/insertdata", upload.single("school_logo"), insertSchool);

// module.exports = schoolRoutes;

