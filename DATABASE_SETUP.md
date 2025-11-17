# Database Setup & Troubleshooting Guide

## Quick Setup Steps

### 1. Install MySQL
Make sure MySQL is installed and running on your computer:
- **Windows**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
- **macOS**: `brew install mysql` or download from MySQL website
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian) or `sudo yum install mysql-server` (CentOS/RHEL)

### 2. Start MySQL Service
- **Windows**: Open Services, find "MySQL" and start it, OR run `net start MySQL` in Command Prompt (as Administrator)
- **macOS**: `brew services start mysql` or `sudo /usr/local/mysql/support-files/mysql.server start`
- **Linux**: `sudo systemctl start mysql` or `sudo service mysql start`

### 3. Import the SQL Dump
```bash
# Replace 'your_dump_file.sql' with the actual filename
# Replace 'root' and 'your_password' with your MySQL credentials
mysql -u root -p < your_dump_file.sql

# OR if you need to specify the database name:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS formula1_db;"
mysql -u root -p formula1_db < your_dump_file.sql
```

### 4. Configure Database Connection
Edit `backend/config.env` and update these values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306          # ⚠️ IMPORTANT: Change this if your MySQL uses a different port
DB_USER=root          # ⚠️ Change to your MySQL username
DB_PASSWORD=your_password  # ⚠️ Change to your MySQL password
DB_NAME=formula1_db   # ⚠️ Change to match the database name from your SQL dump
```

**Common MySQL Ports:**
- Default MySQL port: `3306`
- XAMPP/WAMP: Usually `3306` (check your MySQL config)
- Custom installations: Check your MySQL configuration file

### 5. Verify Database Name
After importing, check what database name was created:
```sql
SHOW DATABASES;
```

Make sure `DB_NAME` in `config.env` matches the actual database name from your dump.

## Troubleshooting "Failed to Connect to Database"

### Issue 1: Wrong Port Number
**Error**: `ECONNREFUSED` or `connect ECONNREFUSED 127.0.0.1:3307`

**Solution**: 
1. Check your MySQL port:
   ```sql
   SHOW VARIABLES LIKE 'port';
   ```
2. Update `DB_PORT` in `backend/config.env` to match (usually `3306`)

### Issue 2: Wrong Database Name
**Error**: `Unknown database 'formula1_db'`

**Solution**:
1. List all databases:
   ```sql
   SHOW DATABASES;
   ```
2. Update `DB_NAME` in `backend/config.env` to match the actual database name from your dump

### Issue 3: Wrong Credentials
**Error**: `Access denied for user 'root'@'localhost'`

**Solution**:
1. Try connecting manually:
   ```bash
   mysql -u root -p
   ```
2. If that works, use the same username and password in `backend/config.env`
3. If you forgot the password, reset it or create a new user:
   ```sql
   CREATE USER 'f1_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON formula1_db.* TO 'f1_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
   Then update `config.env` with the new credentials.

### Issue 4: MySQL Service Not Running
**Error**: `ECONNREFUSED` or `Can't connect to MySQL server`

**Solution**:
- **Windows**: 
  - Open Services (`services.msc`), find MySQL service, right-click → Start
  - OR: `net start MySQL` (as Administrator)
- **macOS**: `brew services start mysql`
- **Linux**: `sudo systemctl start mysql` or `sudo service mysql start`

### Issue 5: Database Not Imported
**Error**: `Unknown database` or empty database

**Solution**:
1. Make sure you imported the SQL dump:
   ```bash
   mysql -u root -p < your_dump_file.sql
   ```
2. Verify tables exist:
   ```sql
   USE formula1_db;  -- or your database name
   SHOW TABLES;
   ```

### Issue 6: Wrong Host
**Error**: Connection timeout or refused

**Solution**:
- If MySQL is on the same computer: `DB_HOST=localhost`
- If MySQL is on another computer: Use the IP address or hostname
- Make sure MySQL allows remote connections if needed

## Testing the Connection

### Test 1: Manual MySQL Connection
```bash
mysql -u root -p -h localhost -P 3306
# Enter your password when prompted
# If successful, you're connected!
```

### Test 2: Check Database Exists
```sql
SHOW DATABASES;
USE formula1_db;  -- or your database name
SHOW TABLES;
```

### Test 3: Test from Node.js
After updating `backend/config.env`, start the server:
```bash
cd backend
npm install  # if not done already
node server.js
```

You should see:
```
✅ Database connected successfully
✅ Server running on port 5000
```

If you see `❌ Database connection failed`, check the error message and refer to the troubleshooting steps above.

## Common Configuration Mistakes

1. **Port Mismatch**: Default is `3307` in config, but MySQL usually uses `3306`
2. **Database Name Mismatch**: Config says `formula1_db` but dump created `f1` or another name
3. **Password with Special Characters**: If your password has special characters, make sure they're properly escaped or quoted
4. **Case Sensitivity**: On Linux/macOS, database names are case-sensitive
5. **Missing config.env**: Make sure `backend/config.env` exists and is in the correct location

## Quick Checklist

Before running the application, verify:

- [ ] MySQL is installed
- [ ] MySQL service is running
- [ ] SQL dump has been imported
- [ ] Database name matches `DB_NAME` in `config.env`
- [ ] MySQL port matches `DB_PORT` in `config.env` (usually `3306`)
- [ ] MySQL username matches `DB_USER` in `config.env`
- [ ] MySQL password matches `DB_PASSWORD` in `config.env`
- [ ] `backend/config.env` file exists and is properly formatted
- [ ] You can connect manually using: `mysql -u [username] -p`

## Still Having Issues?

1. Check the exact error message in the terminal when starting the server
2. Try connecting manually with MySQL command line client
3. Verify your MySQL installation is working: `mysql --version`
4. Check MySQL error logs (location varies by OS)
5. Make sure no firewall is blocking the connection
6. Verify the `backend/config.env` file has no syntax errors (no spaces around `=`)

## Example config.env

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mypassword123
DB_NAME=formula1_db

# JWT Secret (change this to a random string)
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# External API Keys (optional)
NEWSDATA_API_KEY=pub_82ea2edfc06544baba45b76bbfa50740
```


