const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

async function setupViews() {
    try {
        console.log('🚀 Starting to create database views...');
        
        // Read the SQL file
        const sqlFilePath = path.join(__dirname, '..', 'phase2_views.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Split by semicolon to get individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        const connection = await pool.getConnection();
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.trim() === '') {
                continue;
            }
            
            try {
                console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
                await connection.query(statement);
                
                // Extract view name if it's a CREATE VIEW statement
                const viewMatch = statement.match(/CREATE OR REPLACE VIEW (\w+)/i);
                if (viewMatch) {
                    console.log(`   ✅ Created view: ${viewMatch[1]}`);
                }
            } catch (error) {
                console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
            }
        }
        
        connection.release();
        
        // Verify views were created
        const [views] = await pool.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.VIEWS 
            WHERE TABLE_SCHEMA = 'formula1_db'
        `);
        
        console.log(`\n✅ Successfully created ${views.length} views:`);
        views.forEach(view => {
            console.log(`   - ${view.TABLE_NAME}`);
        });
        
        console.log('\n🎉 Database views setup complete!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error setting up views:', error);
        process.exit(1);
    }
}

setupViews();





