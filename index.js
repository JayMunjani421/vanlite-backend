const express = require('express');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const areaRoutes = require('./routes/areaRoutes');
const studentRoutes = require('./routes/studentRoutes');
const busRoutes = require('./routes/busRoutes');
const attendenceRoutes = require('./routes/attendenceRoutes');

require('dotenv').config();

const app = express();

// app.use(cors());  // Allow cross-origin requests
app.use(cors({
    origin: ['http://localhost:3000', 'https://vanlite-frontend-admin.vercel.app','https://vanlite-frontend-school.vercel.app','https://vanlite-frontend-bus.vercel.app'], // allow dev + prod
    credentials: true
}));

app.use(express.json());  // Support JSON requests
app.use(express.urlencoded({ extended: true })); // Support URL-encoded form submissions

// Serve static uploads (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/area", areaRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/attendence", attendenceRoutes);

// Start Server
// app.listen(3000, () => console.log(`🚀 Server Started on Port 3000`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server Started on Port ${PORT}`));


// Start Server
// app.listen(process.env.PORT, () => console.log(`🚀 Server Started on Port ${process.env.PORT}`));

//-----------------------------------------------------------------------------------------------
// const express = require('express');
// const bodyParser = require('body-parser');
// var cors = require('cors');
// const multer = require('multer');
// const path = require('path');

// const adminRoutes = require('./routes/adminRoutes');
// const schoolRoutes = require('./routes/schoolRoutes');
// const areaRoutes = require('./routes/areaRoutes');
// const studentRoutes = require('./routes/studentRoutes');

// require('dotenv').config();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


// const upload = multer();
// app.use(upload.any());

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use("/api/admin", adminRoutes);
// app.use("/api/school", schoolRoutes);
// app.use("/api/area", areaRoutes);
// app.use("/api/student", studentRoutes);

// app.listen(process.env.PORT, () => console.log("Server Started"));

// ---------------------------------------------------------------------------
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');

// const adminRoutes = require('./routes/adminRoutes');
// const schoolRoutes = require('./routes/schoolRoutes');
// const areaRoutes = require('./routes/areaRoutes');
// const studentRoutes = require('./routes/studentRoutes');

// require('dotenv').config();

// const app = express();

// app.use(cors());

// app.use(express.json());  // Built-in JSON parser
// app.use(express.urlencoded({ extended: true })); // For x-www-form-urlencoded


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// // const upload = multer();
// // app.use(upload.any());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use("/api/admin", adminRoutes);
// app.use("/api/school", schoolRoutes);
// app.use("/api/area", areaRoutes);
// app.use("/api/student", studentRoutes);

// app.listen(process.env.PORT, () => console.log("Server Started"));


// ------------------------------------------------------------------------------------

