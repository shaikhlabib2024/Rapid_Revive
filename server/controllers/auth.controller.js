const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rapid_revive_super_secret_jwt_key_2026';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role, garageName, address, tradeLicenseNo, latitude, longitude } = req.body;

    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, phone_number, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, phoneNumber, role || 'car_owner']
    );

    const userId = userResult.insertId;

    // If garage owner, create garage entry with varied coordinates if not provided
    if (role === 'garage_owner') {
      const randomOffsetLat = (Math.random() - 0.5) * 0.015;
      const randomOffsetLng = (Math.random() - 0.5) * 0.015;
      const garageLat = latitude ? parseFloat(latitude) : (23.8103 + randomOffsetLat);
      const garageLng = longitude ? parseFloat(longitude) : (90.4125 + randomOffsetLng);

      await db.query(
        'INSERT INTO garages (user_id, garage_name, address, latitude, longitude, trade_license_no, is_verified, is_online) VALUES (?, ?, ?, ?, ?, ?, FALSE, TRUE)',
        [userId, garageName || fullName + "'s Garage", address || 'Bashundhara R/A, Dhaka', garageLat, garageLng, tradeLicenseNo || `TL-${Date.now().toString().slice(-4)}`]
      );
    }

    const token = jwt.sign({ userId, role: role || 'car_owner' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, fullName, email, role: role || 'car_owner' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
