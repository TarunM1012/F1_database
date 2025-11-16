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
    const startTime = Date.now();
    try {
        // Ensure no bound parameter is undefined – map to SQL NULL
        const safeParams = Array.isArray(params)
            ? params.map((p) => (p === undefined ? null : p))
            : params;
        const [results] = await pool.execute(query, safeParams);
        
        const queryTime = Date.now() - startTime;
        if (queryTime > 5000) {
            console.warn(`⚠️  Slow query (${queryTime}ms): ${query.substring(0, 100)}...`);
        }
        
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
        const queryTime = Date.now() - startTime;
        console.error(`Database query error (${queryTime}ms):`, error.message);
        if (query && query.length < 200) {
            console.error('Query:', query);
        } else {
            console.error('Query:', query.substring(0, 200) + '...');
        }
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
    const errors = [];
    
    for (const view of views) {
        try {
            // Use limit for initial load - can be adjusted based on performance needs
            const result = await executeQuery(`SELECT * FROM ${view} LIMIT 100`);
            
            if (result.success) {
                // Return just the data array, not the wrapped result object
                results[view] = Array.isArray(result.data) ? result.data : [];
                
                // Log if view is empty but query succeeded
                if (results[view].length === 0) {
                    console.log(`⚠️  View ${view} exists but contains no data`);
                } else {
                    console.log(`✅ View ${view}: ${results[view].length} records`);
                }
            } else {
                // Query failed - log error but continue
                console.error(`❌ Query failed for view ${view}:`, result.error);
                errors.push({ view, error: result.error });
                results[view] = [];
            }
        } catch (error) {
            // Unexpected error - log and continue
            console.error(`❌ Unexpected error fetching view ${view}:`, error.message);
            errors.push({ view, error: error.message });
            results[view] = [];
        }
    }
    
    // Log summary
    const viewsWithData = Object.values(results).filter(arr => arr.length > 0).length;
    console.log(`📊 Views summary: ${viewsWithData}/${views.length} views have data`);
    
    if (errors.length > 0) {
        console.warn(`⚠️  ${errors.length} views had errors:`, errors.map(e => e.view).join(', '));
    }
    
    return results;
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    getViewsData
};
