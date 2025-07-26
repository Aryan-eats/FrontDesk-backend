-- Front Desk Management System Database Setup
-- Run this script in MySQL Workbench or command line

-- Create database
CREATE DATABASE IF NOT EXISTS front_desk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional - you can use root)
-- CREATE USER IF NOT EXISTS 'front_desk_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT ALL PRIVILEGES ON front_desk.* TO 'front_desk_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Use the database
USE front_desk;

-- Show confirmation
SELECT 'Database front_desk created successfully!' as status;
