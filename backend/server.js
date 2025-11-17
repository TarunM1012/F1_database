const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const { testConnection } = require('./database');
const { initializeUsersTable } = require('./auth');
const { initializeExternalTables } = require('./setup_external_tables');

// Import routes
const authRoutes = require('./routes/auth');
const viewsRoutes = require('./routes/views');
const crudRoutes = require('./routes/crud');
const externalRoutes = require('./routes/external');
const openmeteoRoutes = require('./routes/openmeteo');
const newsdataRoutes = require('./routes/newsdata');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow requests from frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Security middleware
app.use(helmet());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'F1 Database API is running',
        timestamp: new Date().toISOString()
    });
});

// Database status check endpoint
app.get('/api/status', async (req, res) => {
    try {
        const { executeQuery } = require('./database');
        
        // Check table counts
        const tablesResult = await executeQuery(`
            SELECT 'circuits' AS table_name, COUNT(*) AS count FROM circuits
            UNION ALL SELECT 'constructors', COUNT(*) FROM constructors
            UNION ALL SELECT 'drivers', COUNT(*) FROM drivers
            UNION ALL SELECT 'races', COUNT(*) FROM races
        `);
        
        // Check if views exist
        const viewsResult = await executeQuery(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.VIEWS 
            WHERE TABLE_SCHEMA = 'formula1_db'
        `);
        
        res.json({
            success: true,
            tables: tablesResult.data || [],
            views: viewsResult.data || [],
            message: 'Database status check complete'
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            message: 'Database might not be set up yet'
        });
    }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/views', viewsRoutes);
app.use('/api/crud', crudRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/openmeteo', openmeteoRoutes);
app.use('/api/newsdata', newsdataRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        console.log('🚀 Starting F1 Database API Server...');
        
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }
        
        // Initialize users table
        await initializeUsersTable();
        
        // Initialize external API tables
        await initializeExternalTables();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`🔐 Default admin credentials: admin / admin123`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
