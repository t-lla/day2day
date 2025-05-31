# Day2Day - Personal Productivity Application

A full-stack personal productivity application with habits tracking, notes management, task organization, financial tracking, and folder organization.

## Tech Stack

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - Database ORM
- **MySQL/MariaDB** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **TypeScript** - Type-safe JavaScript
- **Vanilla HTML/CSS/JS** - No framework dependencies
- **Modular Architecture** - Component-based structure

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL/MariaDB (XAMPP recommended for development)
- npm

### Backend Setup

1. **Clone and navigate to the project:**
   \`\`\`bash
   cd day2day/src/server
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Database setup:**
   - Start XAMPP and ensure MySQL is running
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database called \`day2day\`
   - Import the SQL schema from \`.schema.sql\`

4. **Environment configuration:**
   - Copy \`.env.example\` to \`.env\`
   - Update database credentials in \`.env\`:
     \`\`\`env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USERNAME=root
     DB_PASSWORD=your_xampp_password
     DB_DATABASE=day2day
     JWT_SECRET=your-secret-key-here
     \`\`\`

5. **Start the backend:**
   \`\`\`bash
   npm run start:dev
   \`\`\`

   The API will be available at http://localhost:3001

### Frontend Setup

1. **Navigate to client directory:**
   \`\`\`bash
   cd day2day/src/client
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Build TypeScript:**
   \`\`\`bash
   npm run watch
   \`\`\`

4. **Start development server:**
   \`\`\`bash
   npm run dev / serve .
   \`\`\`

   The frontend will be available at http://localhost:3000

## Features

### 🎯 Habits Tracking
- Create daily, weekly, or monthly habits
- Visual progress tracking with heatmap
- Streak calculation and statistics
- Mark habits as complete/incomplete

### 📝 Notes Management
- Create and organize notes with tags
- Full-text search functionality
- Tag-based organization

### ✅ Task Management
- Create tasks with priorities and due dates
- Filter by status (all, active, completed)
- Task completion tracking
- Overdue task highlighting

### 💰 Financial Tracking
- Multiple account management
- Transaction categorization
- Budget planning and tracking
- Monthly financial summaries
- Income/expense analysis

### 📁 Folder Organization
- Organize items across all sections
- Cross-section item management
- Folder-based filtering

### 👤 User Profile
- User account management
- Theme switching (dark/light)
- Progress statistics

## Development

### Project Structure
\`\`\`
day2day/
├── src/
│   ├── server/          # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/    # Authentication module
│   │   │   ├── users/   # User management
│   │   │   ├── habits/  # Habits module
│   │   │   ├── notes/   # Notes module
│   │   │   ├── tasks/   # Tasks module
│   │   │   └── ...
│   │   └── package.json
│   └── client/          # Frontend
│       ├── ts/          # TypeScript source
│       ├── css/         # Stylesheets
│       ├── components/  # HTML templates
│       └── package.json
└── database/
    └── schema.sql       # Database schema
\`\`\`

### Running in Development

You now have a complete full-stack Day2Day application! Here's what you need to do:
