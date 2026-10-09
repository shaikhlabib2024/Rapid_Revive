const db = require('../config/db');

exports.getUserVehicles = async (req, res) => {
  try {
    const { userId } = req.params;
    const [vehicles] = await db.query(
      'SELECT * FROM vehicles WHERE user_id = ? ORDER BY vehicle_id DESC',
      [userId]
    );
    res.json({ success: true, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addVehicle = async (req, res) => {
  try {
    const { userId, makeModel, licensePlate, fuelType } = req.body;
    if (!makeModel || !licensePlate) {
      return res.status(400).json({ success: false, message: 'Make/model and license plate are required.' });
    }

    const [result] = await db.query(
      'INSERT INTO vehicles (user_id, make_model, license_plate, fuel_type) VALUES (?, ?, ?, ?)',
      [userId || req.user?.userId || 1, makeModel, licensePlate, fuelType || 'Octane']
    );

    res.status(201).json({
      success: true,
      vehicle: {
        vehicle_id: result.insertId,
        user_id: userId || req.user?.userId || 1,
        make_model: makeModel,
        license_plate: licensePlate,
        fuel_type: fuelType || 'Octane'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    await db.query('DELETE FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
    res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
