const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Create users table if it doesn't exist
async function initializeUsersTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user', 'guest') DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    await executeQuery(createTableQuery);
    
    // Create default admin user if no users exist
    const checkUsers = await executeQuery('SELECT COUNT(*) as count FROM users');
    if (checkUsers.success && checkUsers.data[0].count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await executeQuery(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@f1db.com', hashedPassword, 'admin']
        );
        console.log('✅ Default admin user created (username: admin, password: admin123)');
    }
}

// Register new user
async function registerUser(username, email, password, role = 'user') {
    try {
        // Check if user already exists
        const existingUser = await executeQuery(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUser.success && existingUser.data.length > 0) {
            return { success: false, error: 'User already exists' };
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        const result = await executeQuery(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );
        
        if (result.success) {
            return { success: true, userId: result.data.insertId };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUser(username, password) {
    try {
        // Find user
        const userResult = await executeQuery(
            'SELECT id, username, email, password, role FROM users WHERE username = ?',
            [username]
        );
        
        if (!userResult.success || userResult.data.length === 0) {
            return { success: false, error: 'Invalid credentials' };
        }
        
        const user = userResult.data[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return { success: false, error: 'Invalid credentials' };
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        return {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Verify JWT token
function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ success: false, error: 'Invalid token.' });
    }
}

// Check if user is admin
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
    }
    next();
}

module.exports = {
    initializeUsersTable,
    registerUser,
    loginUser,
    verifyToken,
    requireAdmin
};
