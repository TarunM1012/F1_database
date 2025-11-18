const express = require('express');
const router = express.Router();
const { executeQuery, getViewsData } = require('../database');
const { verifyToken } = require('../auth');

// Apply authentication middleware to all routes
//router.use(verifyToken);

// =========================================
// GET /api/views/all
// Returns all views data (flattened for frontend)
// =========================================
router.get('/all', async (req, res) => {
    const startTime = Date.now();
    try {
        console.log('📥 Fetching all views data...');
        const viewsData = await getViewsData();
        const fetchTime = Date.now() - startTime;
        console.log(`⏱️  Total fetch time: ${fetchTime}ms`);

        // Normalize shape for frontend: ensure each entry is an array
        const normalized = {};
        let totalRecords = 0;
        
        for (const [viewName, value] of Object.entries(viewsData)) {
            if (Array.isArray(value)) {
                normalized[viewName] = value;
                totalRecords += value.length;
            } else if (value && Array.isArray(value.data)) {
                normalized[viewName] = value.data;
                totalRecords += value.data.length;
            } else {
                normalized[viewName] = [];
            }
        }

        // Check if any views have data
        const viewsWithData = Object.entries(normalized).filter(([_, arr]) => Array.isArray(arr) && arr.length > 0);
        const hasData = viewsWithData.length > 0;
        
        if (!hasData) {
            console.warn('⚠️  Warning: All views are empty. Views may exist but contain no data.');
        } else {
            console.log(`✅ Successfully fetched data from ${viewsWithData.length} views (${totalRecords} total records)`);
        }

        res.json({ 
            success: true, 
            data: normalized,
            summary: {
                totalViews: Object.keys(normalized).length,
                viewsWithData: viewsWithData.length,
                totalRecords: totalRecords
            }
        });
    } catch (error) {
        console.error('❌ Error fetching all views:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            hint: 'Check server logs for detailed error information. Ensure views exist and database connection is working.'
        });
    }
});

// =========================================
// GET /api/views/summary
// Returns lightweight counts for dashboard KPIs
// =========================================
router.get('/summary', async (_req, res) => {
    try {
        const drivers = await executeQuery('SELECT COUNT(*) AS cnt FROM drivers');
        const constructors = await executeQuery('SELECT COUNT(*) AS cnt FROM constructors');
        const circuits = await executeQuery('SELECT COUNT(*) AS cnt FROM circuits');

        res.json({
            success: true,
            data: {
                drivers: drivers.success ? drivers.data[0]?.cnt || 0 : 0,
                constructors: constructors.success ? constructors.data[0]?.cnt || 0 : 0,
                circuits: circuits.success ? circuits.data[0]?.cnt || 0 : 0,
                races: 1125
            }
        });
    } catch (error) {
        console.error('Error fetching views summary:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================
// GET /api/views/:viewName
// Fetches a specific view with pagination
// =========================================
router.get('/:viewName', async (req, res) => {
    try {
        const { viewName } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const validViews = [
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

        if (!validViews.includes(viewName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid view name'
            });
        }

        // ✅ FIX: interpolate limit/offset directly (placeholders not allowed here)
        const query = `SELECT * FROM ${viewName} LIMIT ${limit} OFFSET ${offset}`;
        const result = await executeQuery(query);

        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error fetching view:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================================
// POST /api/views/search
// Performs text search in allowed views
// =========================================
router.post('/search', async (req, res) => {
    try {
        const { viewName, searchTerm, column } = req.body;

        if (!viewName || !searchTerm) {
            return res.status(400).json({
                success: false,
                error: 'View name and search term are required'
            });
        }

        const validViews = [
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

        if (!validViews.includes(viewName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid view name'
            });
        }

        // First, get column names from the view
        const columnsQuery = `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = ?
        `;
        const columnsResult = await executeQuery(columnsQuery, [viewName]);
        
        if (!columnsResult.success || !columnsResult.data || columnsResult.data.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'Could not retrieve columns for this view'
            });
        }

        const availableColumns = columnsResult.data.map(row => row.COLUMN_NAME);
        
        // Define searchable text columns (common across views)
        const textColumnCandidates = [
            'forename', 'surname', 'name', 'driverRef', 'code',
            'constructor_name', 'constructorRef', 
            'race_name', 'circuit_name', 'location', 'country',
            'nationality', 'status'
        ];
        
        // Filter to only columns that exist in this view
        const searchableColumns = textColumnCandidates.filter(col => 
            availableColumns.includes(col)
        );

        let query;
        let params;

        if (column && availableColumns.includes(column)) {
            // Search specific column
            query = `SELECT * FROM ${viewName} WHERE ${column} LIKE ? LIMIT 100`;
            params = [`%${searchTerm}%`];
        } else if (searchableColumns.length > 0) {
            // Search across all text columns available in this view
            const conditions = searchableColumns.map(col => `CAST(${col} AS CHAR) LIKE ?`).join(' OR ');
            query = `SELECT * FROM ${viewName} WHERE ${conditions} LIMIT 100`;
            params = searchableColumns.map(() => `%${searchTerm}%`);
        } else {
            // Fallback: search all columns by converting to string
            const conditions = availableColumns.map(col => `CAST(${col} AS CHAR) LIKE ?`).join(' OR ');
            query = `SELECT * FROM ${viewName} WHERE ${conditions} LIMIT 100`;
            params = availableColumns.map(() => `%${searchTerm}%`);
        }

        const result = await executeQuery(query, params);

        if (result.success) {
            res.json({ 
                success: true, 
                data: result.data,
                searchedColumns: column ? [column] : searchableColumns
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        console.error('Error searching view:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Search failed'
        });
    }
});

module.exports = router;
