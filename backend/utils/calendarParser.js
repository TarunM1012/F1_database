const fs = require('fs');
const path = require('path');

/**
 * Parse calendar.csv and get all races (past and future)
 * @returns {Array} Array of race objects with name, date, location, country
 */
function getAllRaces() {
    try {
        const calendarPath = path.join(__dirname, '../../data/calender.csv');
        
        if (!fs.existsSync(calendarPath)) {
            console.error('❌ Calendar file not found at:', calendarPath);
            return [];
        }
        
        const fileContent = fs.readFileSync(calendarPath, 'utf-8');
        
        // Split by newline and filter out empty lines
        let lines = fileContent.split(/\r?\n/);
        
        lines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed && trimmed.length > 0 && !trimmed.startsWith('#');
        });
        
        const races = lines
            .map((line, index) => {
                const [name, dateStr, location, country] = line.split(',');
                if (!name || !dateStr) {
                    return null;
                }
                
                // Parse date in YYYY-MM-DD format
                const dateParts = dateStr.trim().split('-');
                if (dateParts.length !== 3) {
                    return null;
                }
                
                const raceDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                raceDate.setHours(0, 0, 0, 0);
                
                // Check if date is valid
                if (isNaN(raceDate.getTime())) {
                    return null;
                }
                
                return {
                    name: name.trim(),
                    date: dateStr.trim(),
                    location: location ? location.trim() : '',
                    country: country ? country.trim() : '',
                    raceDate: raceDate
                };
            })
            .filter(race => {
                if (!race) return false;
                if (!race.raceDate || isNaN(race.raceDate.getTime())) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => a.raceDate - b.raceDate);
        
        return races;
    } catch (error) {
        console.error('❌ Error parsing calendar.csv:', error.message);
        return [];
    }
}

/**
 * Parse calendar.csv and get the next N upcoming races
 * @param {number|null} count - Number of races to return (null/undefined = all races)
 * @returns {Array} Array of race objects with name, date, location, country
 */
function getNextRaces(count = null) {
    try {
        const calendarPath = path.join(__dirname, '../../data/calender.csv');
        console.log('📅 Reading calendar from:', calendarPath);
        
        if (!fs.existsSync(calendarPath)) {
            console.error('❌ Calendar file not found at:', calendarPath);
            return [];
        }
        
        const fileContent = fs.readFileSync(calendarPath, 'utf-8');
        console.log(`📅 File content length: ${fileContent.length} characters`);
        
        // Split by newline and filter out empty lines
        let lines = fileContent.split(/\r?\n/);
        console.log(`📅 After split: ${lines.length} lines (before filtering)`);
        
        lines = lines.filter(line => {
            const trimmed = line.trim();
            return trimmed && trimmed.length > 0 && !trimmed.startsWith('#');
        });
        
        console.log(`📅 Found ${lines.length} lines in calendar file (after filtering)`);
        if (lines.length > 0) {
            console.log(`📅 First line: ${lines[0]}`);
            console.log(`📅 Last line: ${lines[lines.length - 1]}`);
        } else {
            console.log(`⚠️  File content preview (first 200 chars): ${fileContent.substring(0, 200)}`);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        console.log('📅 Today is:', today.toISOString().split('T')[0]);
        
        const races = lines
            .map((line, index) => {
                const [name, dateStr, location, country] = line.split(',');
                if (!name || !dateStr) {
                    console.log(`⚠️  Skipping line ${index + 1}: missing name or date`);
                    return null;
                }
                
                // Parse date in YYYY-MM-DD format
                const dateParts = dateStr.trim().split('-');
                if (dateParts.length !== 3) {
                    console.log(`⚠️  Skipping line ${index + 1}: invalid date format: ${dateStr}`);
                    return null;
                }
                
                const raceDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                raceDate.setHours(0, 0, 0, 0);
                
                // Check if date is valid
                if (isNaN(raceDate.getTime())) {
                    console.log(`⚠️  Skipping line ${index + 1}: invalid date: ${dateStr}`);
                    return null;
                }
                
                return {
                    name: name.trim(),
                    date: dateStr.trim(),
                    location: location ? location.trim() : '',
                    country: country ? country.trim() : '',
                    raceDate: raceDate
                };
            })
            .filter(race => {
                if (!race) return false;
                if (!race.raceDate || isNaN(race.raceDate.getTime())) {
                    console.log(`⚠️  Skipping race ${race.name}: invalid raceDate`);
                    return false;
                }
                const isUpcoming = race.raceDate >= today;
                if (!isUpcoming) {
                    console.log(`⚠️  Skipping race ${race.name}: date ${race.date} is in the past`);
                }
                return isUpcoming;
            })
            .sort((a, b) => a.raceDate - b.raceDate);
        
        console.log(`✅ Found ${races.length} upcoming races`);
        if (races.length > 0) {
            console.log(`📅 Next race: ${races[0].name} on ${races[0].date}`);
        }
        
        // Return all races if count is null/undefined, otherwise return first N races
        return (count !== null && count !== undefined) ? races.slice(0, count) : races;
    } catch (error) {
        console.error('❌ Error parsing calendar.csv:', error.message);
        console.error('Stack:', error.stack);
        return [];
    }
}

module.exports = { getNextRaces, getAllRaces };

