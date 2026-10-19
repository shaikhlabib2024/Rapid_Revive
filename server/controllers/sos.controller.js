const db = require('../config/db');
const { calculateHaversineDistance, calculateFare } = require('../services/distance.service');

exports.createSosRequest = async (req, res) => {
  try {
    const { userId, vehicleId, issueType, userLat, userLong, locationName } = req.body;

    const [garages] = await db.query(
      'SELECT * FROM garages WHERE is_online = TRUE AND is_verified = TRUE'
    );

    if (garages.length === 0) {
      return res.status(404).json({ success: false, message: 'No nearby verified garages online.' });
    }

    let nearestGarage = null;
    let shortestDistance = Infinity;

    garages.forEach((g) => {
      const dist = calculateHaversineDistance(userLat, userLong, g.latitude, g.longitude);
      if (dist < shortestDistance) {
        shortestDistance = dist;
        nearestGarage = g;
      }
    });

    const estimatedCost = calculateFare(400.00, shortestDistance); // 400 BDT Base callout fee

    const [result] = await db.query(
      `INSERT INTO service_requests 
       (user_id, garage_id, vehicle_id, request_type, user_lat, user_long, location_name, issue_description, status, estimated_cost) 
       VALUES (?, ?, ?, 'SOS', ?, ?, ?, ?, 'Pending', ?)`,
      [
        userId || 1, 
        nearestGarage.garage_id, 
        vehicleId || null, 
        userLat, 
        userLong, 
        locationName || 'Bashundhara R/A, Dhaka', 
        issueType, 
        estimatedCost
      ]
    );

    res.status(201).json({
      success: true,
      requestId: result.insertId,
      assignedGarage: nearestGarage.garage_name,
      garagePhone: nearestGarage.phone_number || '01711-234567',
      garageAddress: nearestGarage.address || 'Bashundhara R/A, Dhaka',
      distanceKm: shortestDistance,
      locationName: locationName || 'Bashundhara R/A, Dhaka',
      estimatedCost: estimatedCost,
      currency: 'BDT',
      status: 'Pending'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSosStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const [requests] = await db.query(
      `SELECT sr.*, g.garage_name, g.address as garage_address FROM service_requests sr 
       LEFT JOIN garages g ON sr.garage_id = g.garage_id 
       WHERE sr.request_id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    res.json({ success: true, request: requests[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
