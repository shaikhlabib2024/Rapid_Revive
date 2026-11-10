const db = require('../config/db');
const { emitRealtimeEvent } = require('../services/realtime.service');

exports.getPendingVerifications = async (req, res) => {
  try {
    const [garages] = await db.query(
      `SELECT g.garage_id, g.garage_name, g.address, g.trade_license_no, g.nid_number, g.latitude, g.longitude,
              g.verification_status, u.full_name as owner_name, u.email, u.phone_number
       FROM garages g
       JOIN users u ON g.user_id = u.user_id
       WHERE g.verification_status = 'Pending'`
    );
    res.json({ success: true, garages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyGarage = async (req, res) => {
  try {
    const { garageId, approve } = req.body;
    const verificationStatus = approve ? 'Approved' : 'Rejected';
    await db.query(
      'UPDATE garages SET is_verified = ?, verification_status = ?, is_online = ? WHERE garage_id = ?',
      [approve ? 1 : 0, verificationStatus, approve ? 1 : 0, garageId]
    );
    emitRealtimeEvent('garage:updated', {
      garageId: Number(garageId),
      isVerified: !!approve,
      verificationStatus,
      isOnline: !!approve
    });
    res.json({ success: true, message: approve ? 'Approved' : 'Rejected', verificationStatus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users WHERE role = "car_owner"');
    const [[{ totalGarages }]] = await db.query('SELECT COUNT(*) as totalGarages FROM garages WHERE is_verified = TRUE');
    const [[{ totalDispatches }]] = await db.query('SELECT COUNT(*) as totalDispatches FROM service_requests WHERE status = "Completed"');
    const [[{ activeDispatches }]] = await db.query('SELECT COUNT(*) as activeDispatches FROM service_requests WHERE status IN ("Pending", "Accepted", "Dispatched", "On-Site")');
    const [[{ pendingVerifications }]] = await db.query("SELECT COUNT(*) as pendingVerifications FROM garages WHERE verification_status = 'Pending'");
    const [[{ totalRevenue }]] = await db.query('SELECT COALESCE(SUM(total_amount), 0) as totalRevenue FROM invoices');

    res.json({
      success: true,
      stats: {
        totalUsers: Number(totalUsers) || 0,
        totalGarages: Number(totalGarages) || 0,
        totalDispatches: Number(totalDispatches) || 0,
        activeDispatches: Number(activeDispatches) || 0,
        pendingVerifications: Number(pendingVerifications) || 0,
        totalRevenue: parseFloat(totalRevenue) || 0,
        currency: 'BDT'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDirectory = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone_number, u.role, u.status, u.created_at,
              COUNT(v.vehicle_id) AS vehicle_count
       FROM users u
       LEFT JOIN vehicles v ON u.user_id = v.user_id
       WHERE u.role = 'car_owner'
       GROUP BY u.user_id
       ORDER BY u.user_id DESC`
    );

    const [garages] = await db.query(
      `SELECT g.garage_id, g.garage_name, g.address, g.trade_license_no, g.nid_number,
              g.is_verified, g.verification_status, g.is_online, u.user_id, u.full_name AS owner_name, u.email, u.phone_number
       FROM garages g
       JOIN users u ON g.user_id = u.user_id
       ORDER BY g.garage_id DESC`
    );

    res.json({ success: true, users, garages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    await db.query('UPDATE users SET status = ? WHERE user_id = ?', [status, userId]);
    emitRealtimeEvent('user:updated', { userId: Number(userId), status });
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM platform_settings WHERE id = 1');
    const s = rows[0] || {
      base_price: 400.00,
      per_km_rate: 45.00,
      search_radius_km: 12,
      platform_commission: 10.00,
      currency: 'BDT'
    };
    res.json({
      success: true,
      settings: {
        basePrice: parseFloat(s.base_price),
        perKmRate: parseFloat(s.per_km_rate),
        searchRadiusKm: parseInt(s.search_radius_km, 10),
        platformCommission: parseFloat(s.platform_commission),
        currency: s.currency || 'BDT'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLiveDispatches = async (req, res) => {
  try {
    const [dispatches] = await db.query(
      `SELECT sr.request_id, sr.request_type, sr.location_name, sr.issue_description,
              sr.scheduled_date, sr.scheduled_time, sr.mechanic_name, sr.status,
              sr.estimated_cost, sr.created_at,
              c.user_id AS customer_id, c.full_name AS customer_name, c.phone_number AS customer_phone,
              g.garage_id, g.garage_name, g.address AS garage_address,
              go.phone_number AS garage_phone,
              v.make_model, v.license_plate,
              i.invoice_id, i.payment_status, i.total_amount
       FROM service_requests sr
       JOIN users c ON sr.user_id = c.user_id
       LEFT JOIN garages g ON sr.garage_id = g.garage_id
       LEFT JOIN users go ON g.user_id = go.user_id
       LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
       LEFT JOIN invoices i ON sr.request_id = i.request_id
       ORDER BY FIELD(sr.status, 'Pending', 'Accepted', 'Dispatched', 'On-Site', 'Completed', 'Cancelled'), sr.request_id DESC
       LIMIT 100`
    );

    const [dispatchHistory] = await db.query(
      `SELECT * FROM dispatches ORDER BY dispatch_id DESC LIMIT 200`
    );

    res.json({ success: true, dispatches, dispatchHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { basePrice, perKmRate, searchRadiusKm, platformCommission } = req.body;
    await db.query(
      `UPDATE platform_settings
       SET base_price = ?, per_km_rate = ?, search_radius_km = ?, platform_commission = ?
       WHERE id = 1`,
      [
        parseFloat(basePrice) || 400.00,
        parseFloat(perKmRate) || 45.00,
        parseInt(searchRadiusKm, 10) || 12,
        parseFloat(platformCommission) || 10.00
      ]
    );
    emitRealtimeEvent('settings:updated', { basePrice, perKmRate, searchRadiusKm, platformCommission });
    res.json({ success: true, message: 'Platform parameters updated in database.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
