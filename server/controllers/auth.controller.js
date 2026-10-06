const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // If garage owner, create garage entry
    if (role === 'garage_owner') {
      await db.query(
        'INSERT INTO garages (user_id, garage_name, address, latitude, longitude, trade_license_no, is_verified, is_online) VALUES (?, ?, ?, ?, ?, ?, FALSE, TRUE)',
        [userId, garageName || fullName + "'s Garage", address || 'Main Road', latitude || 23.8103, longitude || 90.4125, tradeLicenseNo || 'TL-PENDING']
      );
    }

    const token = jwt.sign({ userId, role: role || 'car_owner' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

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

    const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
