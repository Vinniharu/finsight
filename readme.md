# FinSight 🚀

> *Transform Excel data into actionable financial insights with seamless SQL integration*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://semver.org)

## Project Overview

**FinSight** is an advanced web application designed to bridge the gap between Excel-based financial data and SQL-powered analytics for Small and Medium Enterprises (SMEs). This automated financial reporting system streamlines the process of transforming raw Excel data into comprehensive financial reports and visualizations through intelligent SQL integration.

### Final Year Project Topic
*Designing an Automated Financial Reporting System: Bridging Excel and SQL for SMEs*

## Key Features

- **Smart Excel Import**: Upload .xlsx or .csv files with automatic schema detection
- **Interactive SQL Editor**: Write, save, and execute custom SQL queries against imported data
- **Data Cleaning Automation**: Apply predefined or custom data cleaning rules
- **Dynamic Dashboards**: Generate interactive financial visualizations and KPI tracking
- **Report Templates**: Choose from industry-standard financial report templates or create custom ones
- **Export Options**: Download reports in multiple formats (PDF, Excel, CSV, JSON)
- **User Management**: Role-based access control for team collaboration
- **Scheduled Reports**: Set up automated report generation and distribution

## Technology Stack

### Technology
- Next.js with TypeScript
- Tailwind CSS for responsive design
- Chart.js for interactive visualizations
- PostgreSQL/MySQL for database storage
- Prisma ORM for database operations
- NextAuth.js for authentication

### Data Processing
- SheetJS for Excel file parsing
- SQL query generation
- Data validation and cleaning pipelines

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL/MySQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/vinniharu/finsight.git
cd finsight
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit the .env file with your database credentials and other configurations
```

4. Initialize the database
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
```

6. Access the application at `http://localhost:3000`

## UI Structure

### Core Pages / Screens
1. **Login / Signup Page**
   - User authentication
   - Role selection

2. **Dashboard**
   - Financial overview
   - Recent reports
   - Quick actions

3. **Upload Excel File**
   - File upload interface
   - Schema preview and mapping

4. **SQL Connection & Configuration**
   - Connection settings
   - Query builder
   - Saved queries management

5. **Reports & Visualizations**
   - Report templates
   - Custom report builder
   - Interactive charts and graphs

6. **Export / Download Reports**
   - Format selection
   - Scheduling options

7. **Settings / User Profile**
   - User preferences
   - Team management
   - API keys

## SQL Integration Features

FinSight leverages SQL to provide powerful data manipulation capabilities:

- **Data Transformation**: Convert raw Excel data into structured database tables
- **Data Cleaning**: Remove duplicates, handle missing values, standardize formats
- **Data Aggregation**: Summarize financial data by various dimensions
- **Custom Queries**: Write and save SQL queries for specialized financial analysis
- **Automated ETL**: Schedule and automate extract, transform, load processes

## Deployment

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [SheetJS](https://github.com/SheetJS/sheetjs) - Excel file processing
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Chart.js](https://www.chartjs.org/) - Interactive charts

---

© 2025 FinSight | Developed by Oluwabukolami
