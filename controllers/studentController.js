const connection = require("../config/connection");
const jwt = require('jsonwebtoken');

const getSingleStudent = async (req, resp) => {
    try {
        const student_id = req.params.student_id;
        connection.query("select * from tbl_student where student_id = ?", [student_id], function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Student_data": [] });
            }

            return resp.status(200).json({ "status": true, "message": "Data found!", "Student_data": results });
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const getAllStudent = async (req, resp) => {
    try {
        connection.query("select * from tbl_student", function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Student_data": [] });
            }
            return resp.status(200).json({ "status": true, "message": "Data found!", "Student_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const insertStudent = async (req, resp) => {
    try {
        const { student_name, father_name, father_mobile, mother_name, mother_mobile, student_password, student_birthdate, student_standard, is_active, area_id, addressline1, addressline2, pincode, school_id, bus_id } = req.body;

        // Log request body for debugging
        console.log("Received data:", req.body);

        if (!student_name || !father_name || !father_mobile || !mother_name || !mother_mobile || !student_password || !student_birthdate || !student_standard || !is_active || !area_id || !addressline1 || !addressline2 || !pincode || !school_id || !bus_id) {
            return resp.status(400).json({ "status": false, "message": "All fields are must required !!" });
        }

        connection.query(
            "INSERT INTO tbl_student (student_name, father_name, father_mobile, mother_name, mother_mobile, student_password, student_birthdate, student_standard, is_active, area_id, addressline1, addressline2, pincode, school_id, bus_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [student_name, father_name, father_mobile, mother_name, mother_mobile, student_password, student_birthdate, student_standard, is_active, area_id, addressline1, addressline2, pincode, school_id, bus_id],
            function (error, results, fields) {
                if (error) {
                    console.error("Database error:", error);
                    return resp.status(500).json({ "status": false, "message": error.message });
                }
                return resp.status(200).json({ "status": true, "message": "Data inserted successfully" });
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};

const updateStudent = async (req, resp) => {
    try {
        const student_id = req.params.student_id;
        const { student_name, father_name, father_mobile, mother_name, mother_mobile, student_password, student_birthdate, student_standard, is_active, area_id, addressline1, addressline2, pincode, school_id, bus_id } = req.body;
        connection.query("UPDATE tbl_student SET student_name = ?, father_name = ?, father_mobile = ?, mother_name = ?, mother_mobile = ?, student_password = ?, student_birthdate = ?, student_standard = ?, is_active = ?, area_id = ?, addressline1 = ?, addressline2 = ?, pincode = ?, school_id = ?, bus_id = ? WHERE student_id = ?", 
            [student_name, father_name, father_mobile, mother_name, mother_mobile, student_password, student_birthdate, student_standard, is_active, area_id, addressline1, addressline2, pincode, school_id, bus_id, student_id], 
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

const deleteStudent = async (req, resp) => {
    try {
        const student_id = req.params.student_id;
        connection.query("DELETE FROM tbl_student WHERE student_id = ?", [student_id], (error, results, fields) => {
            if (error) {
                return resp.status(500).json({ "status": false, "message": error.message });
            }

            if (results.affectedRows === 0) {
                return resp.status(404).json({ "status": false, "message": "Data not found" });
            }

            return resp.status(200).json({ "status": true, "message": "Data deleted successfully!" });
        });


    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const getStudentsByBusId = async (req, resp) => {
    try {
        const { bus_id } = req.body;

        if (!bus_id) {
            return resp.status(400).json({ "status": false, "message": "Bus ID is required" });
        }

        connection.query("SELECT student_id, student_name, student_standard FROM tbl_student WHERE bus_id = ?", [bus_id], (error, results) => {
            if (error) {
                return resp.status(500).json({ "status": false, "message": "Database query failed" });
            }

            if (results.length === 0) {
                return resp.status(404).json({ "status": false, "message": "No students found for this bus" });
            }

            return resp.status(200).json({ "status": true, "Student_data": results });
        });

    } catch (error) {
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};

const loginStudent = async (req, resp) => {
    const input = req.body;
    console.log('Request Body:', req.body);

    try {
        connection.query('SELECT * FROM tbl_student WHERE student_name = ?', [input.student_name], async function (error, results, fields) {

            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({
                    status: false,
                    message: "Student Not Found!"
                });
            }

            // Assuming results[0] contains the bus object
            const student = results[0];
            // Compare plain text password directly
            if (input.student_password !== student.student_password) {
                return resp.status(401).json({
                    status: false,
                    message: "Password not matched"
                });
            }
            console.log("Student:", input.password);

            const token = jwt.sign({ student_id: student.student_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            connection.query('UPDATE tbl_student SET access_token = ? WHERE student_id = ?', [token, student.student_id], async function (error, updateResults, fields) {
                if (error) {
                    return resp.status(301).json({ "status": false, "message": error.message });
                }

                return resp.status(200).json({
                    status: true,
                    message: "Login successful...",
                    data: {
                        ...student,
                        student_password: null,
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
    getSingleStudent,
    getAllStudent,
    insertStudent,
    updateStudent,
    deleteStudent,
    getStudentsByBusId,
    loginStudent,
}