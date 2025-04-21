const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, resp, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the Authorization header

    if (!token) {
        return resp.status(403).json({ status: false, message: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return resp.status(401).json({ status: false, message: 'Invalid or expired token.' });
        }
        
        // Save the decoded information for further use (e.g., admin_id)
        req.admin = decoded;
        next(); // Call the next middleware or route handler
    });
};

module.exports = {
    verifyToken
};
