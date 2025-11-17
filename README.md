# Formula 1 Database Management System

A full-stack web application for managing and visualizing Formula 1 race data, including race results, driver statistics, constructor information, and real-time weather forecasts for upcoming races.

## Features

- 📊 **Data Visualization**: Interactive charts and analytics for F1 data
- 🔍 **CRUD Operations**: Create, Read, Update, and Delete operations on database records
- 📈 **Views & Analytics**: Pre-built database views for complex queries
- 🌤️ **Weather Forecasts**: Real-time weather data for upcoming F1 race weekends
- 📰 **F1 News**: Trending Formula 1 news from external APIs
- 🔐 **Authentication**: Secure user authentication with JWT tokens
- 📅 **Race Calendar**: View past and upcoming races with weather information

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **MySQL** (v8.0 or higher)
   - **Windows**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
   - **macOS**: `brew install mysql` or download from MySQL website
   - **Linux**: 
     - Ubuntu/Debian: `sudo apt-get install mysql-server`
     - CentOS/RHEL: `sudo yum install mysql-server`
   - Verify installation: `mysql --version`

3. **Git** (optional, for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)

4. **A code editor** (VS Code, WebStorm, etc.)

## Installation Steps

### 1. Clone or Download the Project

If you have the project in a Git repository:
```bash
git clone <repository-url>
cd F1_database
```

Or download and extract the project folder to your desired location.

### 2. Install Backend Dependencies

Open a terminal/command prompt and navigate to the backend folder:

```bash
cd backend
npm install
```

This will install all required Node.js packages for the backend server.

### 3. Install Frontend Dependencies

Open a new terminal/command prompt and navigate to the frontend folder:

```bash
cd frontend
npm install
```

This will install all required packages for the React frontend.

### 4. Set Up MySQL Database

#### Step 4.1: Start MySQL Service

**Windows:**
- Open Services (`Win + R`, type `services.msc`)
- Find "MySQL" service
- Right-click → Start
- OR run in Command Prompt (as Administrator): `net start MySQL`

**macOS:**
```bash
brew services start mysql
# OR
sudo /usr/local/mysql/support-files/mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
# OR
sudo service mysql start
```

#### Step 4.2: Import the Database

1. Locate the SQL dump file in the `data` folder: `Dump20251104.sql` (or your SQL dump file)

2. Import the database using one of these methods:

**Method 1: Using MySQL Command Line**
```bash
# Create the database first
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS formula1_db;"

# Import the dump file
mysql -u root -p formula1_db < data/Dump20251104.sql
```

**Method 2: Using MySQL Workbench**
- Open MySQL Workbench
- Connect to your MySQL server
- Go to Server → Data Import
- Select "Import from Self-Contained File"
- Choose `data/Dump20251104.sql`
- Select "New" under "Default Target Schema" and name it `formula1_db`
- Click "Start Import"

**Method 3: Using phpMyAdmin**
- Open phpMyAdmin in your browser
- Create a new database named `formula1_db`
- Select the database
- Go to the "Import" tab
- Choose the SQL dump file and click "Go"

#### Step 4.3: Verify Database Import

Connect to MySQL and verify:
```bash
mysql -u root -p
```

Then run:
```sql
USE formula1_db;
SHOW TABLES;
```

You should see tables like `races`, `drivers`, `constructors`, `results`, etc.

### 5. Configure the Application

#### Step 5.1: Backend Configuration

1. Navigate to the `backend` folder
2. Open `config.env` in a text editor
3. Update the database credentials to match your MySQL setup:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306          # Change this if your MySQL uses a different port (default is 3306)
DB_USER=root          # Change to your MySQL username
DB_PASSWORD=your_password  # Change to your MySQL password
DB_NAME=formula1_db   # Change if you used a different database name

# JWT Secret (change this to a random string for security)
JWT_SECRET=your_jwt_secret_key_here_change_this

# Server Configuration
PORT=5000
NODE_ENV=development

# External API Keys (optional - system works without them)
NEWSDATA_API_KEY=pub_82ea2edfc06544baba45b76bbfa50740
```

**Important Notes:**
- **Port**: Most MySQL installations use port `3306` by default. If your MySQL uses a different port (like `3307`), update `DB_PORT` accordingly.
- **Database Name**: Make sure `DB_NAME` matches the database name you created when importing the SQL dump.
- **Password**: If you set a password for MySQL root user, update `DB_PASSWORD`. If no password, leave it empty: `DB_PASSWORD=`

#### Step 5.2: Frontend Configuration (if needed)

The frontend is configured to connect to `http://localhost:5000` by default. If you change the backend port, update `frontend/src/services/api.ts`:

```typescript
const API_URL = 'http://localhost:5000'; // Change port if needed
```

## Running the Application

### Start the Backend Server

1. Open a terminal/command prompt
2. Navigate to the backend folder:
```bash
cd backend
```

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ Database connected successfully
✅ Server running on port 5000
📊 API endpoints available at http://localhost:5000/api
🔐 Default admin credentials: admin / admin123
```

**Keep this terminal window open!**

### Start the Frontend Application

1. Open a **new** terminal/command prompt
2. Navigate to the frontend folder:
```bash
cd frontend
```

3. Start the React development server:
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

If it doesn't open automatically, manually navigate to: `http://localhost:3000`

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change these credentials after first login for security!

## Project Structure

```
F1_database/
├── backend/                 # Node.js/Express backend
│   ├── routes/             # API route handlers
│   ├── utils/              # Utility functions
│   ├── config.env          # Configuration file (IMPORTANT!)
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API service
│   └── package.json        # Frontend dependencies
│
├── data/                   # Data files
│   ├── calender.csv        # Race calendar
│   ├── Dump20251104.sql    # Database dump file
│   └── *.csv               # Other CSV data files
│
└── README.md               # This file
```

## Troubleshooting

### Database Connection Issues

**Error: "Failed to connect to database"**

1. **Check MySQL is running:**
   - Windows: Check Services
   - macOS/Linux: `sudo systemctl status mysql`

2. **Verify port number:**
   - Check your MySQL port: `mysql -u root -p -e "SHOW VARIABLES LIKE 'port';"`
   - Update `DB_PORT` in `backend/config.env` to match

3. **Verify database name:**
   - List databases: `mysql -u root -p -e "SHOW DATABASES;"`
   - Update `DB_NAME` in `backend/config.env` to match

4. **Check credentials:**
   - Test connection: `mysql -u root -p`
   - Update `DB_USER` and `DB_PASSWORD` in `backend/config.env`

5. **Verify database was imported:**
   - Check tables exist: `mysql -u root -p -e "USE formula1_db; SHOW TABLES;"`

See `DATABASE_SETUP.md` for detailed troubleshooting guide.

### Port Already in Use

**Error: "Port 5000 already in use" (Backend)**

Change the port in `backend/config.env`:
```env
PORT=5001  # or any other available port
```

Then update `frontend/src/services/api.ts`:
```typescript
const API_URL = 'http://localhost:5001';
```

**Error: "Port 3000 already in use" (Frontend)**

The React app will ask if you want to use a different port. Type `Y` and press Enter.

### Module Not Found Errors

If you see "Cannot find module" errors:

1. Delete `node_modules` folder
2. Delete `package-lock.json` file
3. Run `npm install` again

```bash
# In backend folder
rm -rf node_modules package-lock.json
npm install

# In frontend folder
rm -rf node_modules package-lock.json
npm install
```

### Weather/News API Errors

The application will still work if external APIs fail. Weather and news features may show errors, but core database functionality will work.

## Available Scripts

### Backend

- `npm start` - Start the backend server
- `npm run dev` - Start with auto-reload (requires nodemon)

### Frontend

- `npm start` - Start the React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## API Endpoints

The backend provides RESTful API endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/crud/:table` - Get all records from a table
- `POST /api/crud/:table` - Create a new record
- `PUT /api/crud/:table/:id` - Update a record
- `DELETE /api/crud/:table/:id` - Delete a record
- `GET /api/views/all` - Get data from all views
- `GET /api/openmeteo/weather/race/:index` - Get weather for a race
- `GET /api/newsdata/news/latest` - Get latest F1 news

All endpoints (except login/register) require authentication via JWT token.

## Technologies Used

- **Backend**: Node.js, Express.js, MySQL2
- **Frontend**: React, TypeScript, Chart.js, Tailwind CSS
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **External APIs**: Open-Meteo (weather), NewsData.io (news)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check that MySQL is running
4. Verify database credentials in `backend/config.env`
5. Check terminal/console for error messages
6. See `DATABASE_SETUP.md` for database-specific issues

## License

MIT License - feel free to use this project for learning and development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Coding! 🏎️💨**


