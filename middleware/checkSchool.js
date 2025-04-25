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

module.exports = { checkSchoolExistence };
