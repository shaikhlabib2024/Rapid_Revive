CREATE DATABASE IF NOT EXISTS rapid_revive_db;
USE rapid_revive_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('car_owner', 'garage_owner', 'admin') DEFAULT 'car_owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. GARAGES TABLE
CREATE TABLE IF NOT EXISTS garages (
    garage_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    garage_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    trade_license_no VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    make_model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(30) DEFAULT 'Octane',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    garage_id INT NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (garage_id) REFERENCES garages(garage_id) ON DELETE CASCADE
);

-- 5. SERVICE_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS service_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    garage_id INT,
    vehicle_id INT,
    request_type ENUM('SOS', 'Maintenance') DEFAULT 'SOS',
    user_lat DECIMAL(10, 8) NOT NULL,
    user_long DECIMAL(11, 8) NOT NULL,
    issue_description TEXT,
    status ENUM('Pending', 'Accepted', 'Dispatched', 'Completed', 'Cancelled') DEFAULT 'Pending',
    estimated_cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (garage_id) REFERENCES garages(garage_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL
);

-- 6. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('Unpaid', 'Paid', 'Simulated_Success') DEFAULT 'Unpaid',
    payment_method VARCHAR(50) DEFAULT 'Cash',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES service_requests(request_id) ON DELETE CASCADE
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    FOREIGN KEY (request_id) REFERENCES service_requests(request_id) ON DELETE CASCADE
);
