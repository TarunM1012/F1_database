const { executeQuery } = require('./database');

// Initialize external API tables
async function initializeExternalTables() {
    try {
        // Create weather_data table
        const createWeatherTable = `
            CREATE TABLE IF NOT EXISTS weather_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                location VARCHAR(100) NOT NULL,
                temperature DECIMAL(5,2) NOT NULL,
                description VARCHAR(255),
                humidity INT,
                wind_speed DECIMAL(5,2),
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_location (location),
                INDEX idx_recorded_at (recorded_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `;
        
        await executeQuery(createWeatherTable);
        console.log('✅ Weather data table initialized');

        // Create f1_news table
        const createNewsTable = `
            CREATE TABLE IF NOT EXISTS f1_news (
                id INT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                summary TEXT,
                published_at DATETIME NOT NULL,
                source VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_published_at (published_at),
                INDEX idx_source (source)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `;
        
        await executeQuery(createNewsTable);
        console.log('✅ F1 news table initialized');

        // Create driver_sentiment table
        const createSentimentTable = `
            CREATE TABLE IF NOT EXISTS driver_sentiment (
                id INT AUTO_INCREMENT PRIMARY KEY,
                driver_name VARCHAR(100) NOT NULL,
                positive INT DEFAULT 0,
                neutral INT DEFAULT 0,
                negative INT DEFAULT 0,
                total_mentions INT DEFAULT 0,
                sentiment_score DECIMAL(5,2),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_driver_name (driver_name),
                INDEX idx_last_updated (last_updated)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
        `;
        
        await executeQuery(createSentimentTable);
        console.log('✅ Driver sentiment table initialized');

        return true;
    } catch (error) {
        console.error('❌ Error initializing external tables:', error);
        return false;
    }
}

module.exports = {
    initializeExternalTables
};


