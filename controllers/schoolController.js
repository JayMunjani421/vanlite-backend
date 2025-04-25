const connection = require("../config/connection");
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const BASE_URL = process.env.BASE_URL || 'https://vanlite-backend.onrender.com/';

const getSingleSchool = async (req, resp) => {
    try {
        const school_id = req.params.school_id;
        connection.query("select * from tbl_school where school_id = ?", [school_id], function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "School_data": [] });
            }

            return resp.status(200).json({ "status": true, "message": "Data found!", "School_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const getAllSchool = async (req, resp) => {
    try {
        connection.query("select * from tbl_school", function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "School_data": [] });
            }
            return resp.status(200).json({ "status": true, "message": "Data found!", "School_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const insertSchool = async (req, resp) => {
    try {
        if (!req.file) {
            return resp.status(400).json({ "status": false, message: "No file uploaded" });
        }
        else if (req.file.length > 1) {
            return resp.status(400).json({ "status": false, message: "Multiple files not allowed" });
        } else {
            // Extract fields from req.body
            const { school_name, school_address, school_email, school_password, start_date, school_manager_name, mobile_number } = req.body;

            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            // Check if the provided start_date is before today's date
            if (start_date < today) {
                return resp.status(400).json({ "status": false, "message": "Start date cannot be in the past" });
            }

            // Calculate end date (1 year after start date)
            const startDateObj = new Date(start_date); // Assuming start_date is in "YYYY-MM-DD" format
            startDateObj.setFullYear(startDateObj.getFullYear() + 1); // Add one year
            const end_date = startDateObj.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"

            const filename = req.file.filename;
            const imageUrl = `${BASE_URL}uploads/${filename}`;
            const is_active = "no"; // Default value for is_active

            // Insert data into the database
            connection.query(
                "insert into tbl_school (school_name, school_address, school_email, school_password, start_date, end_date, school_logo, school_manager_name, mobile_number, is_active) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [school_name, school_address, school_email, school_password, start_date, end_date, imageUrl, school_manager_name, mobile_number, is_active],
                function (error, results, fields) {
                    if (error) {
                        console.error(error);
                        return resp.status(500).json({ "status": false, "message": error });
                    }
                    return resp.status(200).json({ "status": true, "message": "Data inserted successfully" });
                }
            );
        }
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};

const deleteSchool = async (req, resp) => {
    try {
        const school_id = req.params.school_id;

        connection.query("SELECT school_logo FROM tbl_school WHERE school_id = ?", [school_id], (error, results, fields) => {
            if (error) {
                return resp.status(500).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(404).json({ "status": false, "message": "Data not found" });
            }

            const imageFileName = results[0].school_logo;
            if (!imageFileName) {
                return resp.status(400).json({ "status": false, "message": "No logo associated with this school" });
            }

            const cleanImagePath = imageFileName.replace(`${BASE_URL}uploads/`, '');

            const imagePath = path.join(__dirname, '../uploads', cleanImagePath);

            console.log('Attempting to delete image:', imagePath);

            fs.unlink(imagePath, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.warn(`Image not found: ${imagePath}`);
                    } else {
                        console.error(`Error deleting image ${imagePath}:`, err);
                    }
                } else {
                    console.log(`Successfully deleted image: ${imagePath}`);
                }

                connection.query("DELETE FROM tbl_school WHERE school_id = ?", [school_id], (error, results, fields) => {
                    if (error) {
                        return resp.status(500).json({ "status": false, "message": error.message });
                    }

                    if (results.affectedRows === 0) {
                        return resp.status(404).json({ "status": false, "message": "Data not found" });
                    }

                    return resp.status(200).json({ "status": true, "message": "Data deleted successfully!" });
                });
            });
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const updateSchool = async (req, resp) => {
    try {
        const school_id = req.params.school_id;
        const { school_name, school_address, school_email, school_password, start_date, school_manager_name, mobile_number } = req.body;
        const file = req.file; // Get the uploaded file (if any)

        const startDateObj = new Date(start_date);
        startDateObj.setFullYear(startDateObj.getFullYear() + 1);
        const end_date = startDateObj.toISOString().split('T')[0];

        // Get the current school data from the middleware
        const oldImage = req.school.school_logo;
        const oldImagePath = oldImage ? path.join(__dirname, '../uploads', oldImage.replace(`${BASE_URL}uploads/`, '')) : null;

        let imageUrl;

        // If a new image is uploaded, use it
        if (file) {
            const filename = file.filename;
            imageUrl = `${BASE_URL}uploads/${filename}`;

            // If there's an old image, delete it
            if (oldImagePath) {
                fs.unlink(oldImagePath, (err) => {
                    if (err) {
                        console.error('Error deleting old image:', err);
                    } else {
                        console.log(`Successfully deleted old image: ${oldImagePath}`);
                    }
                });
            }
        } else {
            // Keep the old image if no new file is uploaded
            imageUrl = oldImage;
        }

        // Update the school record in the database
        connection.query("UPDATE tbl_school SET school_name = ?, school_address = ?, school_email = ?, school_password = ?, start_date = ?, end_date = ?, school_manager_name = ?, mobile_number = ?, school_logo = ? WHERE school_id = ?",
            [school_name, school_address, school_email, school_password, start_date, end_date, school_manager_name, mobile_number, imageUrl, school_id],
            (error, results) => {
                if (error) {
                    return resp.status(500).json({ "status": false, "message": error.message });
                }
                if (results.affectedRows === 0) {
                    return resp.status(404).json({ "status": false, "message": "Data not found" });
                }
                return resp.status(200).json({ "status": true, "message": "Data updated successfully!" });
            });
    } catch (error) {
        return resp.status(500).json({ "status": false, "message": error.message });
    }
};

const loginSchool = async (req, resp) => {
    const input = req.body;
    console.log('Request Body:', req.body);

    try {
        connection.query('SELECT * FROM tbl_school WHERE school_email = ?', [input.school_email], async function (error, results, fields) {

            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({
                    status: false,
                    message: "Email Not Found!"
                });
            }

            // Assuming results[0] contains the school object
            const school = results[0];
            // Compare plain text password directly
            if (input.school_password !== school.school_password) {
                return resp.status(401).json({
                    status: false,
                    message: "Password not matched"
                });
            }
            console.log("School:", input.school_password);

            const token = jwt.sign({ school_id: school.school_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            connection.query('UPDATE tbl_school SET access_token = ? WHERE school_id = ?', [token, school.school_id], async function (error, updateResults, fields) {
                if (error) {
                    return resp.status(301).json({ "status": false, "message": error.message });
                }

                return resp.status(200).json({
                    status: true,
                    message: "Login successful...",
                    data: {
                        ...school,
                        school_password: null,
                        access_token: null
                    },
                    access_token: token
                });
            });
        });
    } catch (error) {
        return resp.status(400).json({ status: false, message: error.message });
    }
};

module.exports = {
    getAllSchool,
    insertSchool,
    deleteSchool,
    updateSchool,
    getSingleSchool,
    loginSchool,
}
