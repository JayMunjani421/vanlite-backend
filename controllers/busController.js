const connection = require("../config/connection");
const jwt = require('jsonwebtoken');

const getSingleBus = async (req, resp) => {
    try {
        const bus_id = req.params.bus_id;
        connection.query("select * from tbl_bus where bus_id = ?", [bus_id], function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Bus_data": [] });
            }

            return resp.status(200).json({ "status": true, "message": "Data found!", "Bus_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const getAllBus = async (req, resp) => {
    try {
        connection.query("select * from tbl_bus", function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Bus_data": [] });
            }
            return resp.status(200).json({ "status": true, "message": "Data found!", "Bus_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const insertBus = async (req, resp) => {
    try {
        const { bus_name, user_name, password, school_id } = req.body;

        if (!bus_name || !user_name || !password || !school_id) {
            return resp.status(400).json({ "status": false, "message": "All fields are required" });
        }

        // Insert Data into Database
        connection.query(
            "INSERT INTO tbl_bus (bus_name, user_name, password, school_id) VALUES (?, ?, ?, ?)",
            [bus_name, user_name, password, school_id],
            function (error, results, fields) {
                if (error) {
                    console.error("DB Error:", error);
                    return resp.status(500).json({ "status": false, "message": error });
                }
                return resp.status(200).json({ "status": true, "message": "Data inserted successfully" });
            }
        );
    } catch (error) {
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};

const deleteBus = async (req, resp) => {
    try {
        const bus_id = req.params.bus_id;
        connection.query("DELETE FROM tbl_bus WHERE bus_id = ?", [bus_id], (error, results, fields) => {
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
}

const updateBus = async (req, resp) => {
    try {
        const bus_id = req.params.bus_id;
        const { bus_name, user_name, password, school_id } = req.body;
        connection.query("UPDATE tbl_bus SET bus_name = ?, user_name = ?, password = ?, school_id = ? WHERE bus_id = ?", 
            [bus_name, user_name, password, school_id, bus_id], 
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

const loginBus = async (req, resp) => {
    const input = req.body;
    console.log('Request Body:', req.body);

    try {
        connection.query('SELECT * FROM tbl_bus WHERE user_name = ?', [input.user_name], async function (error, results, fields) {

            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({
                    status: false,
                    message: "Username Not Found!"
                });
            }

            // Assuming results[0] contains the bus object
            const bus = results[0];
            // Compare plain text password directly
            if (input.password !== bus.password) {
                return resp.status(401).json({
                    status: false,
                    message: "Password not matched"
                });
            }
            console.log("Bus:", input.password);

            const token = jwt.sign({ bus_id: bus.bus_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            connection.query('UPDATE tbl_bus SET access_token = ? WHERE bus_id = ?', [token, bus.bus_id], async function (error, updateResults, fields) {
                if (error) {
                    return resp.status(301).json({ "status": false, "message": error.message });
                }

                return resp.status(200).json({
                    status: true,
                    message: "Login successful...",
                    data: {
                        ...bus,
                        password: null,
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
    getSingleBus,
    getAllBus,
    insertBus,
    deleteBus,
    updateBus,
    loginBus,
}