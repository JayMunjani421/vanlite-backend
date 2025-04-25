const connection = require("../config/connection");

const getAllAttendence = async (req, resp) => {
    try {
        connection.query("select * from tbl_attendence", function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Attendence_data": [] });
            }
            return resp.status(200).json({ "status": true, "message": "Data found!", "Attendence_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const getType = async (req, resp) => {
    try {
        const student_id = req.params.student_id;
        const { destination } = req.body;

        if (!student_id) {
            return resp.status(400).json({ "status": false, "message": "Student ID is required" });
        }

        connection.query(
            "SELECT type FROM tbl_attendence WHERE student_id = ? AND destination = ? AND DATE(attendence_date_time) = CURDATE() ORDER BY attendence_date_time DESC LIMIT 1",
            [student_id, destination],
            (error, results) => {
                if (error) {
                    return resp.status(500).json({ "status": false, "message": "Database query failed" });
                }

                if (results.length === 0) {
                    // No record found, return default values
                    return resp.status(200).json({
                        "status": true,
                        "lastType": "-",
                        "nextType": "IN"
                    });
                }

                let lastType = results[0].type;
                let nextType = lastType === "IN" ? "OUT" : "IN";

                return resp.status(200).json({
                    "status": true,
                    "lastType": lastType,
                    "nextType": nextType
                });
            }
        );
    } catch (error) {
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};

const insertAttendence = async (req, resp) => {
    try {
        const { student_id, bus_id, destination, type } = req.body;
        if (!student_id || !bus_id || !destination || !type) {
            return resp.status(400).json({ "status": false, "message": "All fields are required" });
        }

        // Validate type input
        if (type !== "IN" && type !== "OUT") {
            return resp.status(400).json({ "status": false, "message": "Invalid attendance type. Must be 'IN' or 'OUT'." });
        }

        // Fetch today's attendance for the student and destination
        connection.query(
            "SELECT type FROM tbl_attendence WHERE student_id = ? AND destination = ? AND DATE(attendence_date_time) = CURDATE() ORDER BY attendence_date_time ASC",
            [student_id, destination],
            (error, results) => {
                if (error) {
                    return resp.status(500).json({ "status": false, "message": "Database query failed" });
                }

                const lastType = results.length > 0 ? results[results.length - 1].type : null;
                const inExists = results.some((record) => record.type === "IN");
                const outExists = results.some((record) => record.type === "OUT");

                // If both IN and OUT already exist for this destination, prevent further entries
                if (inExists && outExists) {
                    return resp.status(400).json({ "status": false, "message": `Attendance for ${destination} is already completed today.` });
                }

                // Determine the correct type based on existing records
                let expectedType = "IN";
                if (lastType === "IN") {
                    expectedType = "OUT";
                }

                // Validate if the user-provided type is correct
                if (type !== expectedType) {
                    return resp.status(400).json({ "status": false, "message": `Invalid type. Expected '${expectedType}' but received '${type}'.` });
                }

                // Insert attendance record
                connection.query(
                    "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                    [student_id, type, bus_id, destination],
                    (insertError) => {
                        if (insertError) {
                            return resp.status(500).json({ "status": false, "message": "Database insert failed" });
                        }
                        return resp.status(200).json({ "status": true, "message": `Attendance marked as ${type} successfully for ${destination}` });
                    }
                );
            }
        );
    } catch (error) {
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};

const insertAbsentStudent = async (req, resp) => {
    try {
        const { bus_id, destination } = req.body; // Include destination in the request

        if (!bus_id || !destination) {
            return resp.status(400).json({ status: false, message: "Bus ID and destination are required" });
        }

        // Get students with 0 entries for the selected destination today
        connection.query(
            `SELECT s.student_id, s.student_name
             FROM tbl_student s
             LEFT JOIN tbl_attendence a 
             ON s.student_id = a.student_id 
             AND a.destination = ? 
             AND DATE(a.attendence_date_time) = CURDATE()
             WHERE s.bus_id = ? AND a.student_id IS NULL`,
            [destination, bus_id],
            (error, results) => {
                if (error) {
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (results.length === 0) {
                    return resp.status(200).json({ status: true, message: `No absent students found for ${destination}.` });
                }

                // Insert ABSENT records for these students
                const absentRecords = results.map(student => [student.student_id, "ABSENT", bus_id, destination]);

                connection.query(
                    "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES ?",
                    [absentRecords],
                    (insertError) => {
                        if (insertError) {
                            return resp.status(500).json({ status: false, message: "Failed to mark absent students." });
                        }
                        return resp.status(200).json({ status: true, message: `Absent students marked successfully for ${destination}.` });
                    }
                );
            }
        );
    } catch (error) {
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const checkAttendanceCount = async (req, resp) => {
    try {
        const { bus_id, destination } = req.body;

        if (!bus_id || !destination) {
            return resp.status(400).json({ status: false, message: "Bus ID and destination are required" });
        }

        // Query to find students who have both IN and OUT entries for today
        connection.query(
            `SELECT student_id 
             FROM tbl_attendence 
             WHERE bus_id = ? 
             AND destination = ? 
             AND DATE(attendence_date_time) = CURDATE()
             GROUP BY student_id 
             HAVING COUNT(DISTINCT type) = 2`,
            [bus_id, destination],
            (error, results) => {
                if (error) {
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                const completedStudents = results.map(row => row.student_id);
                return resp.status(200).json({ status: true, completedStudents });
            }
        );
    } catch (error) {
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const insertAttendanceHomeToSchoolIN = async (req, resp) => {
    try {
        const { student_id, bus_id } = req.body;

        // Fixed values for this API
        const destination = "Home To School";
        const type = "IN";

        // Validate input fields
        if (!student_id || !bus_id) {
            return resp.status(400).json({ status: false, message: "Student ID and Bus ID are required" });
        }

        // Step 1: Check if "Home To School - IN" already exists for this student today
        connection.query(
            "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'Home To School' AND DATE(attendence_date_time) = CURDATE() AND type = 'IN'",
            [bus_id, student_id],
            (error, inResults) => {
                if (error) {
                    console.error("Database query error (IN check):", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (inResults.length > 0) {
                    return resp.status(400).json({ status: false, message: "Attendance for 'Home To School - IN' is already recorded today." });
                }

                // Step 2: Check how many records exist for the student today
                connection.query(
                    "SELECT COUNT(*) AS count FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND DATE(attendence_date_time) = CURDATE()",
                    [bus_id, student_id],
                    (countError, countResults) => {
                        if (countError) {
                            console.error("Database query error (count check):", countError);
                            return resp.status(500).json({ status: false, message: "Database query failed" });
                        }

                        const recordCount = countResults[0].count;

                        if (recordCount > 0) {
                            return resp.status(400).json({ status: false, message: "Cannot Mark IN. Other attendance records found today." });
                        }

                        // Step 3: Insert the "IN" attendance record
                        connection.query(
                            "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                            [student_id, type, bus_id, destination],
                            (insertError) => {
                                if (insertError) {
                                    console.error("Insert error:", insertError);
                                    return resp.status(500).json({ status: false, message: "Database insert failed" });
                                }
                                return resp.status(200).json({ status: true, message: "Attendance marked as 'IN' successfully for 'Home To School'" });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const insertAttendanceHomeToSchoolOUT = async (req, resp) => {
    try {
        const { student_id, bus_id } = req.body;

        // Fixed values for this API
        const destination = "Home To School";
        const type = "OUT";

        // Validate input fields
        if (!student_id || !bus_id) {
            return resp.status(400).json({ status: false, message: "Student ID and Bus ID are required" });
        }

        // Step 1: Check if "OUT" record already exists for today
        connection.query(
            "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'Home To School' AND DATE(attendence_date_time) = CURDATE() AND type = 'OUT'",
            [bus_id, student_id],
            (error, outResults) => {
                if (error) {
                    console.error("Database query error (OUT check):", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (outResults.length > 0) {
                    return resp.status(400).json({ status: false, message: "Attendance for 'Home To School - OUT' is already recorded today." });
                }

                // Step 2: Check if an "IN" record exists for today before inserting "OUT"
                connection.query(
                    "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'Home To School' AND DATE(attendence_date_time) = CURDATE() AND type = 'IN'",
                    [bus_id, student_id],
                    (inError, inResults) => {
                        if (inError) {
                            console.error("Database query error (IN check):", inError);
                            return resp.status(500).json({ status: false, message: "Database query failed" });
                        }

                        if (inResults.length === 0) {
                            return resp.status(400).json({ status: false, message: "Cannot Mark OUT! Student must be marked IN first today." });
                        }

                        // Step 3: Insert the "OUT" attendance record
                        connection.query(
                            "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                            [student_id, type, bus_id, destination],
                            (insertError) => {
                                if (insertError) {
                                    console.error("Insert error:", insertError);
                                    return resp.status(500).json({ status: false, message: "Database insert failed" });
                                }
                                return resp.status(200).json({ status: true, message: "Attendance marked as 'OUT' successfully for 'Home To School'" });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const insertAttendanceHomeToSchoolABSENT = async (req, resp) => {
    try {
        const { student_id, bus_id } = req.body;

        // Fixed values for this API
        const destination = "Home To School";
        const type = "ABSENT";

        // Validate input fields
        if (!student_id || !bus_id) {
            return resp.status(400).json({ status: false, message: "Student ID and Bus ID are required" });
        }

        // Step 1: Check if "ABSENT" record already exists for today
        connection.query(
            "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'Home To School' AND DATE(attendence_date_time) = CURDATE() AND type = 'ABSENT'",
            [bus_id, student_id],
            (error, absentResults) => {
                if (error) {
                    console.error("Database query error (ABSENT check):", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (absentResults.length > 0) {
                    return resp.status(400).json({ status: false, message: "Student is already marked as ABSENT for today." });
                }

                // Step 2: Check if any attendance record exists for the student today
                connection.query(
                    "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND DATE(attendence_date_time) = CURDATE()",
                    [bus_id, student_id],
                    (recordError, recordResults) => {
                        if (recordError) {
                            console.error("Database query error (Record check):", recordError);
                            return resp.status(500).json({ status: false, message: "Database query failed" });
                        }

                        if (recordResults.length > 0) {
                            return resp.status(400).json({ status: false, message: "Attendance record already exists for today. Cannot mark as ABSENT." });
                        }

                        // Step 3: Insert the "ABSENT" record
                        connection.query(
                            "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                            [student_id, type, bus_id, destination],
                            (insertError) => {
                                if (insertError) {
                                    console.error("Insert error:", insertError);
                                    return resp.status(500).json({ status: false, message: "Database insert failed" });
                                }
                                return resp.status(200).json({ status: true, message: "Student marked as ABSENT successfully for 'Home To School'" });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const insertAttendanceSchoolToHomeIN = async (req, resp) => {
    try {
        const { student_id, bus_id } = req.body;

        // Fixed values for this API
        const destination = "School To Home";
        const type = "IN";

        // Validate input fields
        if (!student_id || !bus_id) {
            return resp.status(400).json({ status: false, message: "Student ID and Bus ID are required" });
        }

        // Step 1: Check if "School To Home - IN" already exists today
        connection.query(
            "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'School To Home' AND DATE(attendence_date_time) = CURDATE() AND type = 'IN'",
            [bus_id, student_id],
            (error, inResults) => {
                if (error) {
                    console.error("Database query error (School To Home IN check):", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (inResults.length > 0) {
                    return resp.status(400).json({ status: false, message: "Student is already marked 'IN' for 'School To Home' today." });
                }

                // Step 2: Check if the student has a valid "Home To School" record (either IN & OUT OR ABSENT)
                connection.query(
                    `SELECT COUNT(*) AS valid_count FROM tbl_attendence 
                     WHERE bus_id = ? AND student_id = ? AND DATE(attendence_date_time) = CURDATE() 
                     AND ( (destination = 'Home To School' AND type IN ('IN', 'OUT')) OR (type = 'ABSENT') )`,
                    [bus_id, student_id],
                    (recordError, recordResults) => {
                        if (recordError) {
                            console.error("Database query error (Home To School record check):", recordError);
                            return resp.status(500).json({ status: false, message: "Database query failed" });
                        }

                        const validCount = recordResults[0].valid_count;

                        if (validCount === 0) {
                            return resp.status(400).json({
                                status: false,
                                message: "Cannot mark 'School To Home - IN'. Student must have a valid 'Home To School' record (IN & OUT or ABSENT)."
                            });
                        }

                        // Step 3: Insert the "School To Home - IN" attendance record
                        connection.query(
                            "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                            [student_id, type, bus_id, destination],
                            (insertError) => {
                                if (insertError) {
                                    console.error("Insert error:", insertError);
                                    return resp.status(500).json({ status: false, message: "Database insert failed" });
                                }
                                return resp.status(200).json({ status: true, message: "Attendance marked as 'IN' successfully for 'School To Home'" });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const insertAttendanceSchoolToHomeOUT = async (req, resp) => {
    try {
        const { student_id, bus_id } = req.body;

        // Fixed values for this API
        const destination = "School To Home";
        const type = "OUT";

        // Validate input fields
        if (!student_id || !bus_id) {
            return resp.status(400).json({ status: false, message: "Student ID and Bus ID are required" });
        }

        // Step 1: Check if "School To Home - OUT" already exists today
        connection.query(
            "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'School To Home' AND DATE(attendence_date_time) = CURDATE() AND type = 'OUT'",
            [bus_id, student_id],
            (error, outResults) => {
                if (error) {
                    console.error("Database query error (OUT check):", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (outResults.length > 0) {
                    return resp.status(400).json({ status: false, message: "Student is already marked 'OUT' for 'School To Home' today." });
                }

                // Step 2: Ensure "School To Home - IN" exists before inserting "OUT"
                connection.query(
                    "SELECT * FROM tbl_attendence WHERE bus_id = ? AND student_id = ? AND destination = 'School To Home' AND DATE(attendence_date_time) = CURDATE() AND type = 'IN'",
                    [bus_id, student_id],
                    (inError, inResults) => {
                        if (inError) {
                            console.error("Database query error (IN check):", inError);
                            return resp.status(500).json({ status: false, message: "Database query failed" });
                        }

                        if (inResults.length === 0) {
                            return resp.status(400).json({
                                status: false,
                                message: "Cannot mark 'School To Home - OUT'. Student must have an 'IN' entry for 'School To Home' first."
                            });
                        }

                        // Step 3: Insert the "School To Home - OUT" attendance record
                        connection.query(
                            "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                            [student_id, type, bus_id, destination],
                            (insertError) => {
                                if (insertError) {
                                    console.error("Insert error:", insertError);
                                    return resp.status(500).json({ status: false, message: "Database insert failed" });
                                }
                                return resp.status(200).json({ status: true, message: "Attendance marked as 'OUT' successfully for 'School To Home'" });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const insertAttendanceSchoolToHomeABSENT = async (req, resp) => {
    try {
        const { student_id, bus_id } = req.body;

        // Fixed values for this API
        const destination = "School To Home";
        const type = "ABSENT";

        // Validate input fields
        if (!student_id || !bus_id) {
            return resp.status(400).json({ status: false, message: "Student ID and Bus ID are required" });
        }

        // Step 1: Check if "School To Home - ABSENT" already exists today
        connection.query(
            "SELECT * FROM tbl_attendence WHERE student_id = ? AND destination = ? AND DATE(attendence_date_time) = CURDATE() AND type = 'ABSENT'",
            [student_id, destination],
            (error, absentResults) => {
                if (error) {
                    console.error("Database query error (ABSENT check):", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (absentResults.length > 0) {
                    return resp.status(400).json({ status: false, message: "Student is already marked 'ABSENT' for 'School To Home' today." });
                }

                // Step 2: Ensure student has "Home To School" attendance completed
                connection.query(
                    "SELECT * FROM tbl_attendence WHERE student_id = ? AND destination = 'Home To School' AND DATE(attendence_date_time) = CURDATE() AND (type = 'IN' OR type = 'OUT' OR type = 'ABSENT')",
                    [student_id],
                    (homeToSchoolError, homeToSchoolResults) => {
                        if (homeToSchoolError) {
                            console.error("Database query error (Home To School check):", homeToSchoolError);
                            return resp.status(500).json({ status: false, message: "Database query failed" });
                        }

                        if (homeToSchoolResults.length === 0) {
                            return resp.status(400).json({
                                status: false,
                                message: "Cannot mark 'School To Home - ABSENT'. Student must have completed 'Home To School' attendance first."
                            });
                        }

                        // Step 3: Ensure student has NO other "School To Home" records today
                        connection.query(
                            "SELECT * FROM tbl_attendence WHERE student_id = ? AND destination = ? AND DATE(attendence_date_time) = CURDATE()",
                            [student_id, destination],
                            (schoolToHomeError, schoolToHomeResults) => {
                                if (schoolToHomeError) {
                                    console.error("Database query error (School To Home check):", schoolToHomeError);
                                    return resp.status(500).json({ status: false, message: "Database query failed" });
                                }

                                if (schoolToHomeResults.length > 0) {
                                    return resp.status(400).json({ status: false, message: "Cannot mark 'ABSENT'. Other attendance records found for 'School To Home' today." });
                                }

                                // Step 4: Insert the "School To Home - ABSENT" attendance record
                                connection.query(
                                    "INSERT INTO tbl_attendence (student_id, type, bus_id, destination) VALUES (?, ?, ?, ?)",
                                    [student_id, type, bus_id, destination],
                                    (insertError) => {
                                        if (insertError) {
                                            console.error("Insert error:", insertError);
                                            return resp.status(500).json({ status: false, message: "Database insert failed" });
                                        }
                                        return resp.status(200).json({ status: true, message: "Attendance marked as 'ABSENT' successfully for 'School To Home'" });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const getStudentAttendanceToday = async (req, resp) => {
    try {
        const { student_id } = req.params; // Get student_id from URL

        if (!student_id) {
            return resp.status(400).json({ status: false, message: "Student ID is required" });
        }

        // Query to get today's attendance for the student
        connection.query(
            "SELECT * FROM tbl_attendence WHERE student_id = ? AND DATE(attendence_date_time) = CURDATE()",
            [student_id],
            (error, results) => {
                if (error) {
                    console.error("Database error:", error);
                    return resp.status(500).json({ status: false, message: "Database query failed" });
                }

                if (results.length === 0) {
                    return resp.status(200).json({ status: true, message: "No attendance found for today!", Attendence_data: [] });
                }

                return resp.status(200).json({ status: true, message: "Data found!", Attendence_data: results });
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

const getAttendenceDataForCalendar = async (req, resp) => {
    try {
        const { student_id } = req.params;
        if ( !student_id) {
            return resp.status(400).json({ error: " student ID are required" });
        }

        connection.query(
            `SELECT destination, 
                    TIME_FORMAT(attendence_date_time, '%h:%i:%s %p') AS attendence_time,
                    DATE_FORMAT(attendence_date_time, '%d-%m-%Y') AS attendence_date,
                    type 
             FROM tbl_attendence 
             WHERE student_id = ?`, 
            [student_id], 
            (err, results) => {
                if (err) {
                    console.error("Error fetching attendance data:", err);
                    return resp.status(500).json({ error: "Database error" });
                }
                if (results.length === 0) {
                    return resp.status(200).json({ status: true, message: "No attendance found for today!", Attendence_data: [] });
                }
                return resp.status(200).json({ status: true, message: "Data found!", Attendence_data: results });
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        return resp.status(500).json({ status: false, message: "Server error" });
    }
};

module.exports = {
    getAllAttendence,
    getType,
    insertAttendence,
    insertAbsentStudent,
    checkAttendanceCount,
    insertAttendanceHomeToSchoolIN,
    insertAttendanceHomeToSchoolOUT,
    insertAttendanceHomeToSchoolABSENT,
    insertAttendanceSchoolToHomeIN,
    insertAttendanceSchoolToHomeOUT,
    insertAttendanceSchoolToHomeABSENT,
    getStudentAttendanceToday,
    getAttendenceDataForCalendar,
};