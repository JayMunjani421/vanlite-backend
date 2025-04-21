const connection = require("../config/connection");



const getSingleArea = async (req, resp) => {
    try {
        const area_id = req.params.area_id;
        connection.query("select * from tbl_area where area_id = ?", [area_id], function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Area_data": [] });
            }

            return resp.status(200).json({ "status": true, "message": "Data found!", "Area_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const getAllArea = async (req, resp) => {
    try {
        connection.query("select * from tbl_area", function (error, results, fields) {
            if (error) {
                return resp.status(301).json({ "status": false, "message": error.message });
            }
            if (results.length === 0) {
                return resp.status(200).json({ "status": true, "message": "No data found!", "Area_data": [] });
            }
            return resp.status(200).json({ "status": true, "message": "Data found!", "Area_data": results })
        });
    } catch (error) {
        return resp.status(301).json({ "status": false, "message": error.message });
    }
};

const insertArea = async (req, resp) => {
    try {
        const { area_name, school_id } = req.body;

        if (!area_name || !school_id) {
            return resp.status(400).json({ "status": false, "message": "area_name and school_id are required" });
        }

        // Insert Data into Database
        connection.query(
            "INSERT INTO tbl_area (area_name, school_id) VALUES (?, ?)",
            [area_name, school_id],
            function (error, results, fields) {
                if (error) {
                    return resp.status(500).json({ "status": false, "message": "Database query failed" });
                }
                return resp.status(200).json({ "status": true, "message": "Data inserted successfully" });
            }
        );
    } catch (error) {
        return resp.status(500).json({ "status": false, "message": "Server error" });
    }
};


// const insertArea = async (req, resp) => {
//     try {
//         console.log("🔹 Route /insertdata hit");
//         console.log("🔹 Received request at /insertdata");
//         console.log("🔹 Headers:", req.headers);
//         console.log("🔹 Body:", req.body); // 🔥 Check if data is received
//         console.log("🔹 Files:", req.files); // 🔥 Should be undefined

//         const { area_name, school_id } = req.body;

//         if (!area_name || !school_id) {
//             console.error("❌ Missing area_name or school_id");
//             return resp.status(400).json({ "status": false, "message": "area_name and school_id are required" });
//         }

//         // ✅ Insert Data into Database
//         connection.query(
//             "INSERT INTO tbl_area (area_name, school_id) VALUES (?, ?)",
//             [area_name, school_id],
//             function (error, results, fields) {
//                 if (error) {
//                     console.error("❌ Database error:", error);
//                     return resp.status(500).json({ "status": false, "message": "Database query failed" });
//                 }
//                 console.log("✅ Data inserted successfully");
//                 return resp.status(200).json({ "status": true, "message": "Data inserted successfully" });
//             }
//         );
//     } catch (error) {
//         console.error("❌ Server error:", error);
//         return resp.status(500).json({ "status": false, "message": "Server error" });
//     }
// };



const deleteArea = async (req, resp) => {
    try {
        const area_id = req.params.area_id;
        connection.query("DELETE FROM tbl_area WHERE area_id = ?", [area_id], (error, results, fields) => {
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

const updateArea = async (req, resp) => {
    try {
        const area_id = req.params.area_id;
        const { area_name, school_id } = req.body;
        connection.query("UPDATE tbl_area SET area_name = ?, school_id = ? WHERE area_id = ?", 
            [area_name, school_id, area_id], 
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


module.exports = {
    getSingleArea,
    getAllArea,
    insertArea,
    deleteArea,
    updateArea
}