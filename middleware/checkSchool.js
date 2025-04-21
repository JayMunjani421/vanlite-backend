const connection = require("../config/connection");

const checkSchoolExistence = (req, resp, next) => {
    const school_id = req.params.school_id;

    connection.query("SELECT school_logo FROM tbl_school WHERE school_id = ?", [school_id], (error, results) => {
        if (error) {
            return resp.status(500).json({ "status": false, "message": error.message });
        }
        if (results.length === 0) {
            return resp.status(404).json({ "status": false, "message": "School data not found" });
        }

        // Store the school data in the request object to be used later in the update function
        req.school = results[0]; // Save the school details in req.school

        // If school exists, proceed to next middleware
        next();
    });
};

// const validateSchoolData = (req, resp, next) => {
//     console.log("Request Body Data:::", req.body);
//     const { school_name, school_address, school_email, school_password, start_date, school_manager_name, mobile_number } = req.body;
//      // Log the full request body
//     console.log("Request File Data:", req.file); // Log the file data
//     // Check if all required fields are provided
//     if (
//         !school_name ||
//         !school_address ||
//         !school_email ||
//         !school_password ||
//         !start_date ||
//         !school_manager_name ||
//         !mobile_number
//     ) {
//         return resp.status(400).json({ "status": false, "message": "All Fields are required....." });
//     }

//     const today = new Date().toISOString().split('T')[0];
//     // Check if the start date is in the future
//     if (start_date < today) {
//         return resp.status(400).json({ "status": false, "message": "Start date cannot be in the past" });
//     }

//     next(); // If everything is fine, proceed to next middleware (multer)
// };

module.exports = { checkSchoolExistence };
