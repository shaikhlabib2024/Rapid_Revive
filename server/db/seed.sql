USE rapid_revive_db;

-- Seed Admin, Garage Owner, Car Owner
INSERT INTO users (user_id, full_name, email, password_hash, phone_number, role) VALUES
(1, 'System Admin', 'admin@rapidrevive.com', '$2a$10$e8wYF.qW8q5C4g/K1J.8E.V1q7mQ2h2g1f1e1d1c1b1a1', '01700000000', 'admin'),
(2, 'MotorFix Owner', 'garage@motorfix.com', '$2a$10$e8wYF.qW8q5C4g/K1J.8E.V1q7mQ2h2g1f1e1d1c1b1a1', '01811111111', 'garage_owner'),
(3, 'Alex Car Owner', 'alex@example.com', '$2a$10$e8wYF.qW8q5C4g/K1J.8E.V1q7mQ2h2g1f1e1d1c1b1a1', '01922222222', 'car_owner');

-- Seed Garages
INSERT INTO garages (garage_id, user_id, garage_name, address, latitude, longitude, trade_license_no, is_verified, is_online) VALUES
(1, 2, 'MotorFix Workshop', 'Gulshan 2, Dhaka', 23.79250000, 90.40780000, 'TL-2026-9901', TRUE, TRUE);

-- Seed Vehicles
INSERT INTO vehicles (vehicle_id, user_id, make_model, license_plate, fuel_type) VALUES
(1, 3, 'Toyota Corolla 2021', 'Dhaka Metro-Ga-12-3456', 'Octane');
