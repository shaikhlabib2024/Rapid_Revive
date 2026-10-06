const db = require('../config/db');

exports.toggleOnlineStatus = async (req, res) => {
  try {
    const { garageId, isOnline } = req.body;
    await db.query('UPDATE garages SET is_online = ? WHERE garage_id = ?', [isOnline, garageId]);
    res.json({ success: true, isOnline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const { garageId } = req.params;
    const [requests] = await db.query(
      `SELECT sr.*, u.full_name, u.phone_number FROM service_requests sr 
       JOIN users u ON sr.user_id = u.user_id 
       WHERE sr.garage_id = ? AND sr.status IN ('Pending', 'Accepted', 'Dispatched')`,
      [garageId]
    );
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    await db.query('UPDATE service_requests SET status = ? WHERE request_id = ?', [status, requestId]);
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
