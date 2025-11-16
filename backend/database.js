const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'formula1_db',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
    try {
        // Ensure no bound parameter is undefined – map to SQL NULL
        const safeParams = Array.isArray(params)
            ? params.map((p) => (p === undefined ? null : p))
            : params;
        const [results] = await pool.execute(query, safeParams);
        
        // For INSERT/UPDATE/DELETE, results is an OkPacket with insertId, affectedRows, etc.
        // For SELECT, results is an array of rows
        // Return both the data and metadata (like insertId)
        return { 
            success: true, 
            data: results,
            insertId: results.insertId || null,
            affectedRows: results.affectedRows || null
        };
    } catch (error) {
        console.error('Database query error:', error);
        return { success: false, error: error.message };
    }
}

// Get views data
async function getViewsData() {
    const views = [
        'driver_performance_details',
        'drivers_better_than_hamilton',
        'drivers_above_constructor_average',
        'all_circuits_and_races',
        'race_winners_and_fastest_lap_drivers',
        'top_constructors_by_points',
        'driver_season_performance',
        'circuit_statistics',
        'qualifying_vs_race_performance',
        'pit_stop_analysis'
    ];

    const results = {};
    
    for (const view of views) {
        const result = await executeQuery(`SELECT * FROM ${view} LIMIT 100`);
        // Return just the data array, not the wrapped result object
        results[view] = result.success ? result.data : [];
    }
    
    return results;
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    getViewsData
};
