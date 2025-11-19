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


**Method: Using MySQL Workbench**
- Open MySQL Workbench
- Connect to your MySQL server
- Go to Server → Data Import
- Select "Import from Self-Contained File"
- Choose `data/Dump20251104.sql`
- Select "New" under "Default Target Schema" and name it `formula1_db`
- Click "Start Import"


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

# External API Keys 
NEWSDATA_API_KEY=pub_82ea2edfc06544baba45b76bbfa50740
```

`

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

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`


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




## Technologies Used

- **Backend**: Node.js, Express.js, MySQL2
- **Frontend**: React, TypeScript, Chart.js, Tailwind CSS
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **External APIs**: Open-Meteo (weather), NewsData.io (news)



## License

MIT License - feel free to use this project for learning and development.

