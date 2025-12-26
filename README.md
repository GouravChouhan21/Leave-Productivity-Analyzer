# Leave & Productivity Analyzer

A full-stack web application that analyzes employee attendance, leave usage, and productivity from uploaded Excel files.

## Features

- **Excel Upload & Processing**: Upload .xlsx files with employee attendance data
- **Organization Dashboard**: KPI cards and analytics charts for overall insights
- **Employee Analysis**: Individual employee deep-dive with detailed metrics
- **Real-time Analytics**: Productivity trends, leave patterns, and work hour analysis

## Tech Stack

### Frontend
- React.js
- Tailwind CSS 4.x
- Axios
- React Router DOM
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ORM
- ExcelJS

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Backend Setup
1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env file with the following content:
MONGODB_URI=write URI
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```
Server will run on http://localhost:5000

### Frontend Setup
1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```
Frontend will run on http://localhost:3000

### Database Setup
- **Local MongoDB**: Ensure MongoDB is running on your machine
- **MongoDB Atlas**: Replace the MONGODB_URI in .env with your Atlas connection string

### Testing the Application
1. Open http://localhost:3000 in your browser
2. Upload the provided `sample-attendance.csv` file (convert to .xlsx format)
3. Navigate through the dashboard and employee analysis pages

## API Endpoints

- `POST /api/attendance/upload` - Upload Excel file
- `GET /api/attendance/dashboard` - Get dashboard analytics
- `GET /api/attendance/employee/:id` - Get employee details

## Business Rules

- **Working Hours**: Mon-Fri (10:00-18:30), Sat (10:00-14:00), Sun (Off)
- **Leave Policy**: 2 leaves per employee per month
- **Productivity**: (Actual Hours / Expected Hours) × 100

## Sample Excel Format

| Employee Name | Date       | In-Time | Out-Time |
|--------------|------------|---------|----------|
| John Doe     | 2024-01-01 | 10:00   | 18:30    |
| John Doe     | 2024-01-02 | 10:15   | 18:45    |
| John Doe     | 2024-01-03 |         |          |

## Deployment

### Backend Deployment (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: production
3. Deploy from the `server` directory

### Frontend Deployment (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build directory to `client`
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP address to whitelist
4. Create a database user
5. Get the connection string and update MONGODB_URI

## Project Structure Details

### Backend Architecture
- **MVC Pattern**: Controllers handle business logic, models define data structure
- **Middleware**: CORS, file upload handling, error management
- **Utils**: Reusable functions for calculations and Excel parsing
- **RESTful APIs**: Clean endpoint structure for frontend consumption

### Frontend Architecture
- **Component-based**: Reusable UI components with clear separation
- **Service Layer**: Centralized API communication
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Chart Integration**: Professional data visualization with Recharts

### Key Features Implemented
- ✅ Excel file upload and validation
- ✅ Attendance data parsing and storage
- ✅ Business rule enforcement (working hours, leave policy)
- ✅ Productivity calculations
- ✅ Interactive dashboard with KPIs
- ✅ Individual employee analysis
- ✅ Professional charts and visualizations
- ✅ Responsive design
- ✅ Error handling and loading states

## Performance Considerations
- Efficient MongoDB queries with aggregation pipelines
- Optimized chart rendering with responsive containers
- File upload size limits and validation
- Clean data processing with proper error handling

## Security Features
- File type validation (.xlsx only)
- Input sanitization
- CORS configuration
- Environment variable protection