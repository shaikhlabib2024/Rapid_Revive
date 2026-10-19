const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rapid_revive_super_secret_jwt_key_2026';

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, role, garageName, address, tradeLicenseNo, nidNumber, latitude, longitude } = req.body;

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, phone_number, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, phoneNumber || '', role || 'car_owner']
    );

    const userId = userResult.insertId;

    if (role === 'garage_owner') {
      const randomOffsetLat = (Math.random() - 0.5) * 0.015;
      const randomOffsetLng = (Math.random() - 0.5) * 0.015;
      const garageLat = latitude ? parseFloat(latitude) : (23.8103 + randomOffsetLat);
      const garageLng = longitude ? parseFloat(longitude) : (90.4125 + randomOffsetLng);

      await db.query(
        'INSERT INTO garages (user_id, garage_name, address, latitude, longitude, trade_license_no, nid_number, is_verified, is_online) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)',
        [
          userId, 
          garageName || fullName + "'s Workshop", 
          address || 'Bashundhara R/A, Dhaka', 
          garageLat, 
          garageLng, 
          tradeLicenseNo || `TL-${Date.now().toString().slice(-4)}`,
          nidNumber || `NID-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        ]
      );
    }

    const token = jwt.sign({ userId, role: role || 'car_owner' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, fullName, email, phoneNumber: phoneNumber || '', role: role || 'car_owner' }
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

    let garageDetails = null;
    if (user.role === 'garage_owner') {
      const [garages] = await db.query('SELECT * FROM garages WHERE user_id = ?', [user.user_id]);
      if (garages.length > 0) garageDetails = garages[0];
    }

    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { 
        id: user.user_id, 
        fullName: user.full_name, 
        email: user.email, 
        phoneNumber: user.phone_number || '', 
        role: user.role,
        garageId: garageDetails?.garage_id,
        garageName: garageDetails?.garage_name,
        address: garageDetails?.address,
        latitude: garageDetails?.latitude,
        longitude: garageDetails?.longitude,
        tradeLicenseNo: garageDetails?.trade_license_no,
        nidNumber: garageDetails?.nid_number,
        isVerified: !!garageDetails?.is_verified,
        isOnline: !!garageDetails?.is_online
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user profile info (name, phone number, and garage details if applicable)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { fullName, phoneNumber, garageName, address } = req.body;

    await db.query(
      'UPDATE users SET full_name = ?, phone_number = ? WHERE user_id = ?',
      [fullName, phoneNumber, userId]
    );

    if (garageName || address) {
      await db.query(
        'UPDATE garages SET garage_name = COALESCE(?, garage_name), address = COALESCE(?, address) WHERE user_id = ?',
        [garageName, address, userId]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: { fullName, phoneNumber, garageName, address }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reset / Change account password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { currentPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match.' });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [hashed, userId]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
