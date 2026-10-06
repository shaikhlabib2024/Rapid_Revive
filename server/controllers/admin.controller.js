const db = require('../config/db');

exports.getPendingVerifications = async (req, res) => {
  try {
    const [garages] = await db.query(
      `SELECT g.*, u.full_name as owner_name, u.email FROM garages g 
       JOIN users u ON g.user_id = u.user_id 
       WHERE g.is_verified = FALSE`
    );
    res.json({ success: true, garages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyGarage = async (req, res) => {
  try {
    const { garageId, approve } = req.body;
    await db.query('UPDATE garages SET is_verified = ? WHERE garage_id = ?', [approve ? 1 : 0, garageId]);
    res.json({ success: true, message: approve ? 'Approved' : 'Rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users WHERE role="car_owner"');
    const [[{ totalGarages }]] = await db.query('SELECT COUNT(*) as totalGarages FROM garages WHERE is_verified=TRUE');
    const [[{ totalDispatches }]] = await db.query('SELECT COUNT(*) as totalDispatches FROM service_requests');
    
    res.json({
      success: true,
      stats: { totalUsers, totalGarages, totalDispatches, totalRevenue: 42500.00 }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
