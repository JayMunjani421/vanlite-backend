const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require("../config/connection");

const insertNewAdmin = async (req, resp) => {
    const { admin_name, admin_email, admin_password, admin_mobile } = req.body;

    // Step 1: Validate the input data
    if (!admin_name || !admin_email || !admin_password || !admin_mobile) {
        return resp.status(400).json({
            status: false,
            message: 'admin_name, admin_email, admin_password, and admin_mobile are required.'
        });
    }

    try {
        // Step 2: Check if the email already exists
        const checkEmailQuery = 'SELECT * FROM tbl_admin WHERE admin_email = ?';
        connection.query(checkEmailQuery, [admin_email], (err, results) => {
            if (err) {
                return resp.status(500).json({ status: false, message: err.message });
            }

            if (results.length > 0) {
                return resp.status(400).json({
                    status: false,
                    message: 'This email is already registered as an admin.'
                });
            }

            // Step 3: Insert the new admin user into the database with the plain password
            const insertQuery = `
                INSERT INTO tbl_admin (admin_name, admin_email, admin_password, admin_mobile) 
                VALUES (?, ?, ?, ?)
            `;

            connection.query(insertQuery, [admin_name, admin_email, admin_password, admin_mobile], (err, result) => {
                if (err) {
                    return resp.status(500).json({ status: false, message: err.message });
                }

                return resp.status(201).json({
                    status: true,
                    message: 'New admin created successfully.',
                    data: {
                        admin_name,
                        admin_email,
                        admin_mobile
                    }
                });
            });
        });
    } catch (error) {
        return resp.status(500).json({ status: false, message: error.message });
    }
};

const updateAdminPassword = async (req, resp) => {
    const { admin_email, admin_password } = req.body;

    // Step 1: Validate the input data
    if (!admin_email || !admin_password) {
        return resp.status(400).json({
            status: false,
            message: 'Both admin_email and admin_password are required.'
        });
    }

    try {
        // Step 2: Update the admin_password in the database for the specified admin_email with the plain password
        const query = `
            UPDATE tbl_admin 
            SET admin_password = ? 
            WHERE admin_email = ?
        `;
        
        connection.query(query, [admin_password, admin_email], (err, result) => {
            if (err) {
                return resp.status(500).json({ status: false, message: err.message });
            }

            if (result.affectedRows === 0) {
                return resp.status(404).json({
                    status: false,
                    message: 'Admin with the given email not found.'
                });
            }

            return resp.status(200).json({
                status: true,
                message: 'Admin password updated successfully.',
                data: {
                    admin_email
                }
            });
        });
    } catch (error) {
        return resp.status(500).json({ status: false, message: error.message });
    }
};

const loginAdmin = async (req, resp) => {
    const input = req.body;

    try {
        connection.query('SELECT * FROM tbl_admin WHERE admin_email = ?', [input.admin_email], (error, results) => {
            if (error) {
                return resp.status(500).json({ status: false, message: error.message });
            }
            if (results.length === 0) {
                return resp.status(404).json({
                    status: false,
                    message: "Email Not Found!"
                });
            }

            const admin = results[0];
            // Compare plain text password directly
            if (input.admin_password !== admin.admin_password) {
                return resp.status(401).json({
                    status: false,
                    message: "Password not matched"
                });
            }

            // Generate JWT token for the authenticated user
            const token = jwt.sign({ admin_id: admin.admin_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return resp.status(200).json({
                status: true,
                message: "Login successful...",
                data: {
                    admin_email: admin.admin_email,
                    admin_name: admin.admin_name,
                    token: token
                }
            });
        });
    } catch (error) {
        return resp.status(500).json({ status: false, message: error.message });
    }
};


const adminProfile = async(req, resp) =>{
    const admin = req.admin;  // The admin ID and other information from the token

    if (!admin || !admin.admin_id) {
        return resp.status(400).json({ status: false, message: "Admin ID not found in token" });
    }

    // Query to get the admin details based on admin_id from the token
    const query = 'SELECT admin_id, admin_name, admin_email, admin_mobile FROM tbl_admin WHERE admin_id = ?';

    connection.query(query, [admin.admin_id], (err, results) => {
        if (err) {
            return resp.status(500).json({ status: false, message: err.message });
        }

        if (results.length === 0) {
            return resp.status(404).json({ status: false, message: "Admin not found" });
        }

        const adminData = results[0];  // Get the first matching result
        return resp.status(200).json({
            status: true,
            message: "Profile accessed successfully",
            data: {
                ...adminData, 
                admin_password: null  // Ensure we don't send the password in the response
            }
        });
    });
};

module.exports = {
    insertNewAdmin,
    updateAdminPassword,
    loginAdmin,
    adminProfile,
};