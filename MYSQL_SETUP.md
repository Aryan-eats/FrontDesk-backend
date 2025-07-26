# MySQL Setup Instructions

## Method 1: Using MySQL Workbench (Recommended)

1. **Open MySQL Workbench**
   - If you don't have it, download from: https://dev.mysql.com/downloads/workbench/

2. **Connect to MySQL**
   - Create a new connection or use existing localhost connection
   - Use username: `root` and your MySQL root password

3. **Create Database**
   - Open and execute the file: `setup-database.sql`
   - Or run this command:
   ```sql
   CREATE DATABASE front_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## Method 2: Using Command Line

1. **Find MySQL Installation**
   - Usually located at: `C:\Program Files\MySQL\MySQL Server 8.0\bin\`
   - Or: `C:\xampp\mysql\bin\` if using XAMPP

2. **Add MySQL to PATH (Optional)**
   - Add MySQL bin directory to your system PATH
   - Or use full path in commands

3. **Connect to MySQL**
   ```bash
   # Replace with your actual MySQL path if not in PATH
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

4. **Create Database**
   ```sql
   CREATE DATABASE front_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   SHOW DATABASES;
   EXIT;
   ```

## Method 3: Using phpMyAdmin (if using XAMPP)

1. **Start XAMPP**
   - Start Apache and MySQL services

2. **Open phpMyAdmin**
   - Go to: http://localhost/phpmyadmin/

3. **Create Database**
   - Click "New" in the left sidebar
   - Database name: `front_desk`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

## Configure Your Application

1. **Update .env file** with your MySQL credentials:
   ```
   DB_PASSWORD=your_actual_mysql_password
   ```

2. **Test the connection** by running:
   ```bash
   npm run start:dev
   ```

## Troubleshooting

- **Connection Error**: Check if MySQL service is running
- **Access Denied**: Verify username/password in .env file
- **Database Not Found**: Make sure you created the `front_desk` database
- **Port Issues**: Default MySQL port is 3306, check if it's in use

## Next Steps

After successful database setup:
1. Run the application: `npm run start:dev`
2. The application will automatically create tables
3. Run seed script: `npm run seed`
