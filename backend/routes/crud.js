const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database');
const { verifyToken, requireAdmin } = require('../auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// CRUD operations for drivers
router.get('/drivers', async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;
        
        let query = 'SELECT * FROM drivers';
        let params = [];
        
        if (search) {
            query += ' WHERE forename LIKE ? OR surname LIKE ? OR nationality LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }
        
        // Some MySQL environments don't allow placeholders in LIMIT/OFFSET
        const safeLimit = Number.parseInt(String(limit)) || 50;
        const safeOffset = Number.parseInt(String(offset)) || 0;
        query += ` ORDER BY surname LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const result = await executeQuery(query, params);
        
        if (result.success) {
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM drivers';
            let countParams = [];
            
            if (search) {
                countQuery += ' WHERE forename LIKE ? OR surname LIKE ? OR nationality LIKE ?';
                countParams = [`%${search}%`, `%${search}%`, `%${search}%`];
            }
            
            const countResult = await executeQuery(countQuery, countParams);
            // COUNT query returns an array with one row: [{ total: 830 }]
            let total = 0;
            if (countResult.success && countResult.data) {
                if (Array.isArray(countResult.data) && countResult.data.length > 0) {
                    // MySQL returns COUNT(*) as a number, column name might be 'total' or the actual column name
                    const firstRow = countResult.data[0];
                    total = firstRow.total || firstRow['COUNT(*)'] || Object.values(firstRow)[0] || 0;
                } else if (countResult.data.total !== undefined) {
                    total = countResult.data.total;
                }
            }
            
            console.log('Count query result:', { 
                success: countResult.success, 
                data: countResult.data, 
                total 
            });
            
            res.json({ 
                success: true, 
                data: result.data,
                total: total,
                page: Math.floor(safeOffset / safeLimit) + 1,
                limit: safeLimit
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new driver (Admin only)
router.post('/drivers', requireAdmin, async (req, res) => {
    try {
        const { driverRef, number, code, forename, surname, dob, nationality, url } = req.body;
        
        if (!forename || !surname || !nationality) {
            return res.status(400).json({ 
                success: false, 
                error: 'Forename, surname, and nationality are required' 
            });
        }
        
        // Convert undefined to null for optional fields
        const safeDriverRef = driverRef || null;
        const safeNumber = number !== undefined ? number : null;
        const safeCode = code || null;
        const safeDob = dob || null;
        const safeUrl = url || null;
        
        const result = await executeQuery(
            'INSERT INTO drivers (driverRef, number, code, forename, surname, dob, nationality, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [safeDriverRef, safeNumber, safeCode, forename, surname, safeDob, nationality, safeUrl]
        );
        
        if (result.success) {
            // Get insertId from the result (now properly extracted in executeQuery)
            const insertId = result.insertId;
            
            console.log('Driver created successfully:', { 
                insertId, 
                forename, 
                surname,
                affectedRows: result.affectedRows
            });
            
            // Verify the driver was actually inserted by querying it back
            if (insertId) {
                const verifyResult = await executeQuery(
                    'SELECT * FROM drivers WHERE driverId = ?',
                    [insertId]
                );
                
                if (verifyResult.success && verifyResult.data && verifyResult.data.length > 0) {
                    console.log('Driver verified in database:', verifyResult.data[0]);
                } else {
                    console.error('WARNING: Driver insertId returned but driver not found in database!');
                }
            }
            
            res.status(201).json({ 
                success: true, 
                message: 'Driver created successfully',
                driverId: insertId
            });
        } else {
            // If error is about missing default for driverId, provide helpful message
            if (result.error && result.error.includes('driverId') && result.error.includes('default value')) {
                res.status(500).json({ 
                    success: false, 
                    error: 'Database configuration error: driverId column must be set to AUTO_INCREMENT. Please run fix_driver_id.sql' 
                });
            } else {
                res.status(500).json({ success: false, error: result.error });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update driver (Admin only)
router.put('/drivers/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { driverRef, number, code, forename, surname, dob, nationality, url } = req.body;
        
        const result = await executeQuery(
            'UPDATE drivers SET driverRef=?, number=?, code=?, forename=?, surname=?, dob=?, nationality=?, url=? WHERE driverId=?',
            [driverRef, number, code, forename, surname, dob, nationality, url, id]
        );
        
        if (result.success) {
            res.json({ success: true, message: 'Driver updated successfully' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete driver (Admin only)
router.delete('/drivers/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await executeQuery('DELETE FROM drivers WHERE driverId=?', [id]);
        
        if (result.success) {
            res.json({ success: true, message: 'Driver deleted successfully' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CRUD operations for constructors
router.get('/constructors', async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;
        
        let query = 'SELECT * FROM constructors';
        let params = [];
        
        if (search) {
            query += ' WHERE name LIKE ? OR nationality LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }
        
        const safeLimit = Number.parseInt(String(limit)) || 50;
        const safeOffset = Number.parseInt(String(offset)) || 0;
        query += ` ORDER BY name LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const result = await executeQuery(query, params);
        
        if (result.success) {
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) as total FROM constructors';
            let countParams = [];
            
            if (search) {
                countQuery += ' WHERE name LIKE ? OR nationality LIKE ?';
                countParams = [`%${search}%`, `%${search}%`];
            }
            
            const countResult = await executeQuery(countQuery, countParams);
            // COUNT query returns an array with one row: [{ total: 830 }]
            let total = 0;
            if (countResult.success && countResult.data) {
                if (Array.isArray(countResult.data) && countResult.data.length > 0) {
                    // MySQL returns COUNT(*) as a number, column name might be 'total' or the actual column name
                    const firstRow = countResult.data[0];
                    total = firstRow.total || firstRow['COUNT(*)'] || Object.values(firstRow)[0] || 0;
                } else if (countResult.data.total !== undefined) {
                    total = countResult.data.total;
                }
            }
            
            console.log('Count query result:', { 
                success: countResult.success, 
                data: countResult.data, 
                total 
            });
            
            res.json({ 
                success: true, 
                data: result.data,
                total: total,
                page: Math.floor(safeOffset / safeLimit) + 1,
                limit: safeLimit
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new constructor (Admin only)
router.post('/constructors', requireAdmin, async (req, res) => {
    try {
        const { constructorRef, name, nationality, url } = req.body;
        
        if (!name || !nationality) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and nationality are required' 
            });
        }
        
        const result = await executeQuery(
            'INSERT INTO constructors (constructorRef, name, nationality, url) VALUES (?, ?, ?, ?)',
            [constructorRef, name, nationality, url]
        );
        
        if (result.success) {
            res.status(201).json({ 
                success: true, 
                message: 'Constructor created successfully',
                constructorId: result.data.insertId 
            });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update constructor (Admin only)
router.put('/constructors/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { constructorRef, name, nationality, url } = req.body;
        
        const result = await executeQuery(
            'UPDATE constructors SET constructorRef=?, name=?, nationality=?, url=? WHERE constructorId=?',
            [constructorRef, name, nationality, url, id]
        );
        
        if (result.success) {
            res.json({ success: true, message: 'Constructor updated successfully' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete constructor (Admin only)
router.delete('/constructors/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await executeQuery('DELETE FROM constructors WHERE constructorId=?', [id]);
        
        if (result.success) {
            res.json({ success: true, message: 'Constructor deleted successfully' });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get races
router.get('/races', async (req, res) => {
    try {
        const { limit = 50, offset = 0, year, circuit } = req.query;
        
        let query = `
            SELECT r.*, c.name as circuit_name, c.country as circuit_country 
            FROM races r 
            LEFT JOIN circuits c ON r.circuitId = c.circuitId
        `;
        let params = [];
        let conditions = [];
        
        if (year) {
            conditions.push('r.year = ?');
            params.push(year);
        }
        
        if (circuit) {
            conditions.push('c.name LIKE ?');
            params.push(`%${circuit}%`);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        const safeLimit = Number.parseInt(String(limit)) || 50;
        const safeOffset = Number.parseInt(String(offset)) || 0;
        query += ` ORDER BY r.date DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        const result = await executeQuery(query, params);
        
        if (result.success) {
            res.json({ success: true, data: result.data });
        } else {
            res.status(500).json({ success: false, error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
