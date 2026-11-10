const db = require('../config/db');
const { emitRealtimeEvent } = require('../services/realtime.service');
const { calculateHaversineDistance } = require('../services/distance.service');
const { reverseGeocode, forwardGeocode } = require('../services/geocoding.service');
const { recordDispatchEvent } = require('../services/dispatchLog.service');

exports.getGarageStatus = async (req, res) => {
  try {
    const { garageId } = req.params;
    const [garages] = await db.query(
      `SELECT g.*, u.phone_number, u.full_name AS owner_name
       FROM garages g
       JOIN users u ON g.user_id = u.user_id
       WHERE g.garage_id = ?`,
      [garageId]
    );
    if (garages.length === 0) {
      return res.status(404).json({ success: false, message: 'Garage not found.' });
    }
    res.json({ success: true, garage: garages[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleOnlineStatus = async (req, res) => {
  try {
    const { garageId, isOnline } = req.body;
    const [rows] = await db.query('SELECT is_verified, verification_status FROM garages WHERE garage_id = ?', [garageId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Garage not found.' });
    }
    if (!rows[0].is_verified && isOnline) {
      return res.status(403).json({
        success: false,
        message: 'Workshop is awaiting System Admin verification before going live on radar.'
      });
    }
    await db.query('UPDATE garages SET is_online = ? WHERE garage_id = ?', [isOnline ? 1 : 0, garageId]);
    emitRealtimeEvent('garage:updated', { garageId: Number(garageId), isOnline: !!isOnline });
    res.json({ success: true, isOnline: !!isOnline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const { garageId } = req.params;
    const [requests] = await db.query(
      `SELECT sr.*, u.full_name, u.phone_number,
              v.make_model, v.license_plate,
              g.latitude AS garage_lat, g.longitude AS garage_lng
       FROM service_requests sr
       JOIN users u ON sr.user_id = u.user_id
       LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
       LEFT JOIN garages g ON sr.garage_id = g.garage_id
       WHERE sr.garage_id = ? AND sr.status IN ('Pending', 'Accepted', 'Dispatched', 'On-Site')
       ORDER BY sr.request_id DESC`,
      [garageId]
    );

    const enriched = requests.map((r) => ({
      ...r,
      vehicle_info: r.make_model ? `${r.make_model} (${r.license_plate})` : null,
      distance_km: calculateHaversineDistance(r.user_lat, r.user_long, r.garage_lat, r.garage_lng)
    }));

    res.json({ success: true, requests: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { requestId, status, mechanicName } = req.body;

    const [existing] = await db.query('SELECT * FROM service_requests WHERE request_id = ?', [requestId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    const requestRow = existing[0];

    if (mechanicName !== undefined) {
      await db.query(
        'UPDATE service_requests SET status = ?, mechanic_name = ? WHERE request_id = ?',
        [status, mechanicName, requestId]
      );
    } else {
      await db.query('UPDATE service_requests SET status = ? WHERE request_id = ?', [status, requestId]);
    }

    await recordDispatchEvent({
      requestId: Number(requestId),
      previousStatus: requestRow.status,
      currentStatus: status,
      actionByRole: req.user?.role || 'garage_owner',
      mechanicName: mechanicName !== undefined ? mechanicName : requestRow.mechanic_name,
      notes: `Status changed from ${requestRow.status} to ${status}`
    });

    if (status === 'Completed') {
      const [existingInv] = await db.query(
        'SELECT invoice_id FROM invoices WHERE request_id = ?',
        [requestId]
      );
      if (existingInv.length === 0) {
        await db.query(
          "INSERT INTO invoices (request_id, total_amount, payment_status, payment_method) VALUES (?, ?, 'Unpaid', 'Cash on Delivery (BDT)')",
          [requestId, requestRow.estimated_cost || 400.00]
        );
        emitRealtimeEvent('invoice:updated', {
          requestId: Number(requestId),
          userId: requestRow.user_id,
          garageId: requestRow.garage_id
        });
      }
    }

    emitRealtimeEvent('sos:updated', {
      requestId: Number(requestId),
      userId: requestRow.user_id,
      garageId: requestRow.garage_id,
      status
    });

    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateGarageLocation = async (req, res) => {
  try {
    const { garageId, latitude, longitude, address } = req.body;
    let resolvedLat = parseFloat(latitude);
    let resolvedLng = parseFloat(longitude);
    let resolvedAddress = (address || '').trim();

    if (resolvedAddress && (Number.isNaN(resolvedLat) || Number.isNaN(resolvedLng))) {
      try {
        const geo = await forwardGeocode(resolvedAddress);
        resolvedLat = geo.latitude;
        resolvedLng = geo.longitude;
        resolvedAddress = geo.formattedAddress || resolvedAddress;
      } catch {
        // Keep existing coordinates in DB if geocoding key is not yet configured
      }
    } else if (!resolvedAddress && !Number.isNaN(resolvedLat) && !Number.isNaN(resolvedLng)) {
      try {
        const geo = await reverseGeocode(resolvedLat, resolvedLng);
        resolvedAddress = geo.formattedAddress;
      } catch {
        resolvedAddress = null;
      }
    }

    if (!Number.isNaN(resolvedLat) && !Number.isNaN(resolvedLng)) {
      await db.query(
        'UPDATE garages SET latitude = ?, longitude = ?, address = COALESCE(?, address) WHERE garage_id = ?',
        [resolvedLat, resolvedLng, resolvedAddress || null, garageId]
      );
    } else if (resolvedAddress) {
      await db.query(
        'UPDATE garages SET address = ? WHERE garage_id = ?',
        [resolvedAddress, garageId]
      );
    }

    emitRealtimeEvent('garage:updated', { garageId: Number(garageId) });
    res.json({
      success: true,
      message: 'Workshop location name saved successfully.',
      location: { address: resolvedAddress }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllVerifiedGarages = async (req, res) => {
  try {
    const [garages] = await db.query(
      `SELECT g.garage_id, g.garage_name, g.address, g.latitude, g.longitude, g.is_online,
              g.trade_license_no, g.nid_number, u.phone_number
       FROM garages g
       JOIN users u ON g.user_id = u.user_id
       WHERE g.is_verified = TRUE`
    );

    const [services] = await db.query(
      'SELECT service_id, garage_id, service_name, description, base_price FROM services WHERE is_active = TRUE'
    );

    const servicesByGarage = {};
    services.forEach((s) => {
      if (!servicesByGarage[s.garage_id]) servicesByGarage[s.garage_id] = [];
      servicesByGarage[s.garage_id].push(s);
    });

    const enriched = garages.map((g) => ({
      ...g,
      services: servicesByGarage[g.garage_id] || []
    }));

    res.json({ success: true, garages: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGarageServices = async (req, res) => {
  try {
    const { garageId } = req.params;
    const [services] = await db.query(
      'SELECT * FROM services WHERE garage_id = ? ORDER BY service_id ASC',
      [garageId]
    );
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addGarageService = async (req, res) => {
  try {
    const { garageId, serviceName, description, basePrice } = req.body;
    if (!garageId || !serviceName) {
      return res.status(400).json({ success: false, message: 'Garage ID and service name are required.' });
    }

    const price = parseFloat(basePrice) || 500.00;
    const [result] = await db.query(
      'INSERT INTO services (garage_id, service_name, description, base_price, is_active) VALUES (?, ?, ?, ?, TRUE)',
      [garageId, serviceName, description || '', price]
    );

    emitRealtimeEvent('service:updated', { garageId: Number(garageId), serviceId: result.insertId });

    res.status(201).json({
      success: true,
      service: {
        service_id: result.insertId,
        garage_id: Number(garageId),
        service_name: serviceName,
        description: description || '',
        base_price: price,
        is_active: 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleGarageService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { isActive } = req.body;
    await db.query('UPDATE services SET is_active = ? WHERE service_id = ?', [isActive ? 1 : 0, serviceId]);
    emitRealtimeEvent('service:updated', { serviceId: Number(serviceId) });
    res.json({ success: true, isActive: !!isActive });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGarageEarnings = async (req, res) => {
  try {
    const { garageId } = req.params;
    const [[summary]] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN DATE(i.issued_at) = CURDATE() THEN i.total_amount ELSE 0 END), 0) AS today,
         COALESCE(SUM(CASE WHEN i.issued_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN i.total_amount ELSE 0 END), 0) AS thisWeek,
         COALESCE(SUM(CASE WHEN MONTH(i.issued_at) = MONTH(CURDATE()) AND YEAR(i.issued_at) = YEAR(CURDATE()) THEN i.total_amount ELSE 0 END), 0) AS thisMonth,
         COALESCE(SUM(i.total_amount), 0) AS totalLifetime,
         COUNT(i.invoice_id) AS completedJobs
       FROM invoices i
       JOIN service_requests sr ON i.request_id = sr.request_id
       WHERE sr.garage_id = ?`,
      [garageId]
    );

    const [transactions] = await db.query(
      `SELECT i.invoice_id, i.request_id, i.total_amount, i.payment_status, i.payment_method, i.issued_at,
              sr.issue_description, sr.request_type, u.full_name AS customer_name
       FROM invoices i
       JOIN service_requests sr ON i.request_id = sr.request_id
       JOIN users u ON sr.user_id = u.user_id
       WHERE sr.garage_id = ?
       ORDER BY i.invoice_id DESC
       LIMIT 25`,
      [garageId]
    );

    res.json({
      success: true,
      summary: {
        today: parseFloat(summary.today) || 0,
        thisWeek: parseFloat(summary.thisWeek) || 0,
        thisMonth: parseFloat(summary.thisMonth) || 0,
        totalLifetime: parseFloat(summary.totalLifetime) || 0,
        completedJobs: Number(summary.completedJobs) || 0
      },
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
