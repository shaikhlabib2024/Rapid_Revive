const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function ensureSchema() {
  // 0. Ensure core tables exist on fresh cloud MySQL databases
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20),
      role ENUM('car_owner', 'garage_owner', 'admin') DEFAULT 'car_owner',
      status ENUM('Active', 'Suspended') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS garages (
      garage_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      garage_name VARCHAR(150) NOT NULL,
      address TEXT NOT NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      trade_license_no VARCHAR(100) NOT NULL,
      nid_number VARCHAR(50) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      is_online BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      make_model VARCHAR(100) NOT NULL,
      license_plate VARCHAR(50) NOT NULL,
      fuel_type VARCHAR(30) DEFAULT 'Octane',
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS services (
      service_id INT AUTO_INCREMENT PRIMARY KEY,
      garage_id INT NOT NULL,
      service_name VARCHAR(100) NOT NULL,
      description TEXT,
      base_price DECIMAL(10, 2) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (garage_id) REFERENCES garages(garage_id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      request_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      garage_id INT,
      vehicle_id INT,
      request_type ENUM('SOS', 'Maintenance') DEFAULT 'SOS',
      user_lat DECIMAL(10, 8) NOT NULL,
      user_long DECIMAL(11, 8) NOT NULL,
      location_name VARCHAR(255) DEFAULT 'Bashundhara R/A, Dhaka',
      issue_description TEXT,
      scheduled_date VARCHAR(20) NULL,
      scheduled_time VARCHAR(50) NULL,
      service_id INT NULL,
      mechanic_name VARCHAR(100) NULL,
      status ENUM('Pending', 'Accepted', 'Dispatched', 'On-Site', 'Completed', 'Cancelled') DEFAULT 'Pending',
      estimated_cost DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (garage_id) REFERENCES garages(garage_id) ON DELETE SET NULL,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      invoice_id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      payment_status ENUM('Unpaid', 'Paid', 'Simulated_Success') DEFAULT 'Unpaid',
      payment_method VARCHAR(50) DEFAULT 'Cash on Delivery (BDT)',
      issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests(request_id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      review_id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      FOREIGN KEY (request_id) REFERENCES service_requests(request_id) ON DELETE CASCADE
    )
  `);

  // 1. users.status
  if (!(await columnExists('users', 'status'))) {
    await db.query(
      "ALTER TABLE users ADD COLUMN status ENUM('Active', 'Suspended') DEFAULT 'Active'"
    );
  }

  // 2. garages.nid_number & garages.verification_status
  if (!(await columnExists('garages', 'nid_number'))) {
    await db.query(
      "ALTER TABLE garages ADD COLUMN nid_number VARCHAR(50) NOT NULL DEFAULT 'NID-1984269104882'"
    );
  }
  if (!(await columnExists('garages', 'verification_status'))) {
    await db.query(
      "ALTER TABLE garages ADD COLUMN verification_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'"
    );
    await db.query(
      "UPDATE garages SET verification_status = 'Approved' WHERE is_verified = TRUE"
    );
  }

  await db.query('ALTER TABLE garages MODIFY COLUMN is_online BOOLEAN DEFAULT FALSE');
  await db.query('UPDATE garages SET is_online = FALSE WHERE is_verified = FALSE');

  // 3. services.is_active
  if (!(await columnExists('services', 'is_active'))) {
    await db.query(
      'ALTER TABLE services ADD COLUMN is_active BOOLEAN DEFAULT TRUE'
    );
  }

  // 4. service_requests missing columns + expanded status enum
  if (!(await columnExists('service_requests', 'location_name'))) {
    await db.query(
      "ALTER TABLE service_requests ADD COLUMN location_name VARCHAR(255) DEFAULT 'Bashundhara R/A, Dhaka'"
    );
  }
  if (!(await columnExists('service_requests', 'scheduled_date'))) {
    await db.query(
      'ALTER TABLE service_requests ADD COLUMN scheduled_date VARCHAR(20) NULL'
    );
  }
  if (!(await columnExists('service_requests', 'scheduled_time'))) {
    await db.query(
      'ALTER TABLE service_requests ADD COLUMN scheduled_time VARCHAR(50) NULL'
    );
  }
  if (!(await columnExists('service_requests', 'service_id'))) {
    await db.query(
      'ALTER TABLE service_requests ADD COLUMN service_id INT NULL'
    );
  }
  if (!(await columnExists('service_requests', 'mechanic_name'))) {
    await db.query(
      'ALTER TABLE service_requests ADD COLUMN mechanic_name VARCHAR(100) NULL'
    );
  }

  await db.query(
    "ALTER TABLE service_requests MODIFY COLUMN status ENUM('Pending', 'Accepted', 'Dispatched', 'On-Site', 'Completed', 'Cancelled') DEFAULT 'Pending'"
  );

  // 5. platform_settings table
  await db.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INT PRIMARY KEY DEFAULT 1,
      base_price DECIMAL(10, 2) NOT NULL DEFAULT 400.00,
      per_km_rate DECIMAL(10, 2) NOT NULL DEFAULT 45.00,
      search_radius_km INT NOT NULL DEFAULT 12,
      platform_commission DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
      currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(
    `INSERT IGNORE INTO platform_settings (id, base_price, per_km_rate, search_radius_km, platform_commission, currency)
     VALUES (1, 400.00, 45.00, 12, 10.00, 'BDT')`
  );

  // 6. Fix invalid placeholder bcrypt hashes in seeded accounts (< 60 chars) so real login works
  const [seedUsers] = await db.query(
    'SELECT user_id, password_hash FROM users WHERE LENGTH(password_hash) < 60'
  );
  if (seedUsers.length > 0) {
    const validHash = await bcrypt.hash('password123', 10);
    for (const u of seedUsers) {
      await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [
        validHash,
        u.user_id
      ]);
    }
  }

  // 7. Ensure at least one verified garage is online and has default services if services table is empty
  const [[{ onlineCount }]] = await db.query(
    'SELECT COUNT(*) as onlineCount FROM garages WHERE is_verified = TRUE AND is_online = TRUE'
  );
  if (onlineCount === 0) {
    await db.query(
      'UPDATE garages SET is_online = TRUE WHERE garage_id = 1 AND is_verified = TRUE'
    );
  }

  const [[{ serviceCount }]] = await db.query('SELECT COUNT(*) as serviceCount FROM services');
  if (serviceCount === 0) {
    const [garages] = await db.query('SELECT garage_id FROM garages ORDER BY garage_id ASC LIMIT 1');
    if (garages.length > 0) {
      const gid = garages[0].garage_id;
      const defaultServices = [
        [gid, 'Flatbed Towing Service', 'Emergency flatbed recovery across Dhaka', 1500.00],
        [gid, '12V Battery Jump Start', 'On-site battery boost and terminal inspection', 400.00],
        [gid, 'Flat Tire Swap & Puncture Fix', 'Spare wheel installation or roadside patch', 450.00],
        [gid, 'Emergency Fuel Delivery', '5L emergency Octane/Diesel delivery', 350.00],
        [gid, 'OBD-II Engine Diagnostic Scan', 'Computerized fault code scan & tune-up', 600.00],
        [gid, 'Lockout Vehicle Door Assistance', 'Non-destructive vehicle door unlock', 500.00]
      ];
      await db.query(
        'INSERT INTO services (garage_id, service_name, description, base_price) VALUES ?',
        [defaultServices]
      );
    }
  }

  // 8. Ensure completed service requests have corresponding invoice rows
  await db.query(`
    INSERT INTO invoices (request_id, total_amount, payment_status, payment_method)
    SELECT sr.request_id, COALESCE(sr.estimated_cost, 400.00), 'Unpaid', 'Cash on Delivery (BDT)'
    FROM service_requests sr
    LEFT JOIN invoices i ON sr.request_id = i.request_id
    WHERE sr.status = 'Completed' AND i.invoice_id IS NULL
  `);

  // 9. Dedicated dispatches record / audit log table
  await db.query(`
    CREATE TABLE IF NOT EXISTS dispatches (
      dispatch_id INT AUTO_INCREMENT PRIMARY KEY,
      request_id INT NOT NULL,
      customer_id INT NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      garage_id INT NULL,
      garage_name VARCHAR(150) NULL,
      request_type ENUM('SOS', 'Maintenance') DEFAULT 'SOS',
      location_name VARCHAR(255) NOT NULL,
      issue_description TEXT,
      mechanic_name VARCHAR(100) NULL,
      previous_status VARCHAR(30) NULL,
      current_status ENUM('Pending', 'Accepted', 'Dispatched', 'On-Site', 'Completed', 'Cancelled') NOT NULL,
      estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
      action_by_role ENUM('car_owner', 'garage_owner', 'admin', 'system') DEFAULT 'system',
      notes VARCHAR(255) NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests(request_id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (garage_id) REFERENCES garages(garage_id) ON DELETE SET NULL
    )
  `);

  // Backfill any existing service_requests that have no dispatch record yet
  await db.query(`
    INSERT INTO dispatches
      (request_id, customer_id, customer_name, garage_id, garage_name, request_type,
       location_name, issue_description, mechanic_name, previous_status, current_status,
       estimated_cost, action_by_role, notes)
    SELECT sr.request_id, sr.user_id, u.full_name, sr.garage_id, g.garage_name, sr.request_type,
           COALESCE(sr.location_name, 'Dhaka'), sr.issue_description, sr.mechanic_name,
           NULL, sr.status, COALESCE(sr.estimated_cost, 0.00), 'system', 'Initial record synced'
    FROM service_requests sr
    JOIN users u ON sr.user_id = u.user_id
    LEFT JOIN garages g ON sr.garage_id = g.garage_id
    LEFT JOIN dispatches d ON sr.request_id = d.request_id
    WHERE d.dispatch_id IS NULL
  `);
}

module.exports = { ensureSchema };

