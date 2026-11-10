const db = require('../config/db');
const { calculateHaversineDistance, calculateFare } = require('../services/distance.service');
const { emitRealtimeEvent } = require('../services/realtime.service');
const { reverseGeocode, forwardGeocode } = require('../services/geocoding.service');
const { recordDispatchEvent } = require('../services/dispatchLog.service');

async function loadPlatformSettings() {
  const [rows] = await db.query('SELECT * FROM platform_settings WHERE id = 1');
  if (rows.length > 0) {
    return {
      basePrice: parseFloat(rows[0].base_price) || 400.00,
      perKmRate: parseFloat(rows[0].per_km_rate) || 45.00,
      searchRadiusKm: parseInt(rows[0].search_radius_km, 10) || 12,
      platformCommission: parseFloat(rows[0].platform_commission) || 10.00,
      currency: rows[0].currency || 'BDT'
    };
  }
  return {
    basePrice: 400.00,
    perKmRate: 45.00,
    searchRadiusKm: 12,
    platformCommission: 10.00,
    currency: 'BDT'
  };
}

exports.getPricing = async (req, res) => {
  try {
    const settings = await loadPlatformSettings();
    res.json({ success: true, pricing: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reverseGeocodeCoords = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required.' });
    }
    const result = await reverseGeocode(lat, lng);
    res.json({
      success: true,
      locationName: result.formattedAddress,
      placeId: result.placeId
    });
  } catch (error) {
    if (error.code === 'MISSING_API_KEY') {
      return res.status(503).json({
        success: false,
        requiresApiKey: true,
        message: error.message
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSosRequest = async (req, res) => {
  try {
    const { userId, vehicleId, issueType, userLat, userLong, locationName } = req.body;
    const resolvedUserId = req.user?.userId || userId;
    if (!resolvedUserId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    let resolvedLat = parseFloat(userLat);
    let resolvedLng = parseFloat(userLong);
    let resolvedLocationName = (locationName || '').trim();

    if ((Number.isNaN(resolvedLat) || Number.isNaN(resolvedLng)) && resolvedLocationName) {
      try {
        const geo = await forwardGeocode(resolvedLocationName);
        resolvedLat = geo.latitude;
        resolvedLng = geo.longitude;
        resolvedLocationName = geo.formattedAddress || resolvedLocationName;
      } catch {
        resolvedLat = 23.8103;
        resolvedLng = 90.4125;
      }
    } else if (!resolvedLocationName && !Number.isNaN(resolvedLat) && !Number.isNaN(resolvedLng)) {
      try {
        const geo = await reverseGeocode(resolvedLat, resolvedLng);
        resolvedLocationName = geo.formattedAddress;
      } catch {
        resolvedLocationName = 'Bashundhara R/A, Dhaka';
      }
    }

    if (Number.isNaN(resolvedLat) || Number.isNaN(resolvedLng)) {
      resolvedLat = 23.8103;
      resolvedLng = 90.4125;
    }
    if (!resolvedLocationName) {
      resolvedLocationName = 'Bashundhara R/A, Dhaka';
    }

    const settings = await loadPlatformSettings();

    const [garages] = await db.query(
      `SELECT g.*, u.phone_number
       FROM garages g
       JOIN users u ON g.user_id = u.user_id
       WHERE g.is_online = TRUE AND g.is_verified = TRUE`
    );

    if (garages.length === 0) {
      return res.status(404).json({ success: false, message: 'No nearby verified garages are currently online.' });
    }

    let nearestInRadius = null;
    let shortestInRadius = Infinity;
    let nearestOverall = null;
    let shortestOverall = Infinity;

    garages.forEach((g) => {
      const dist = calculateHaversineDistance(resolvedLat, resolvedLng, g.latitude, g.longitude);
      if (dist <= settings.searchRadiusKm && dist < shortestInRadius) {
        shortestInRadius = dist;
        nearestInRadius = g;
      }
      if (dist < shortestOverall) {
        shortestOverall = dist;
        nearestOverall = g;
      }
    });

    const nearestGarage = nearestInRadius || nearestOverall;
    const shortestDistance = nearestInRadius ? shortestInRadius : shortestOverall;

    const estimatedCost = calculateFare(settings.basePrice, shortestDistance, settings.perKmRate);

    const [result] = await db.query(
      `INSERT INTO service_requests
       (user_id, garage_id, vehicle_id, request_type, user_lat, user_long, location_name, issue_description, status, estimated_cost)
       VALUES (?, ?, ?, 'SOS', ?, ?, ?, ?, 'Pending', ?)`,
      [
        resolvedUserId,
        nearestGarage.garage_id,
        vehicleId || null,
        resolvedLat,
        resolvedLng,
        resolvedLocationName,
        issueType,
        estimatedCost
      ]
    );

    const requestId = result.insertId;

    await recordDispatchEvent({
      requestId,
      previousStatus: null,
      currentStatus: 'Pending',
      actionByRole: req.user?.role || 'car_owner',
      notes: 'Emergency SOS dispatch created'
    });

    emitRealtimeEvent('sos:created', {
      requestId,
      userId: resolvedUserId,
      garageId: nearestGarage.garage_id,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      requestId,
      assignedGarage: nearestGarage.garage_name,
      garageId: nearestGarage.garage_id,
      garagePhone: nearestGarage.phone_number || 'N/A',
      garageAddress: nearestGarage.address || 'Dhaka',
      distanceKm: shortestDistance,
      locationName: resolvedLocationName,
      estimatedCost,
      currency: settings.currency,
      status: 'Pending'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getActiveSosForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const [requests] = await db.query(
      `SELECT sr.*, g.garage_name, g.address AS garage_address, g.latitude AS garage_lat, g.longitude AS garage_lng,
              u.phone_number AS garage_phone, v.make_model, v.license_plate
       FROM service_requests sr
       LEFT JOIN garages g ON sr.garage_id = g.garage_id
       LEFT JOIN users u ON g.user_id = u.user_id
       LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
       WHERE sr.user_id = ? AND sr.request_type = 'SOS'
         AND sr.status IN ('Pending', 'Accepted', 'Dispatched', 'On-Site')
       ORDER BY sr.request_id DESC
       LIMIT 1`,
      [userId]
    );

    if (requests.length === 0) {
      return res.json({ success: true, request: null });
    }

    const r = requests[0];
    const distanceKm = calculateHaversineDistance(r.user_lat, r.user_long, r.garage_lat, r.garage_lng);

    res.json({
      success: true,
      request: {
        ...r,
        distanceKm
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSosStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const [requests] = await db.query(
      `SELECT sr.*, g.garage_name, g.address AS garage_address, g.latitude AS garage_lat, g.longitude AS garage_lng,
              u.phone_number AS garage_phone, v.make_model, v.license_plate
       FROM service_requests sr
       LEFT JOIN garages g ON sr.garage_id = g.garage_id
       LEFT JOIN users u ON g.user_id = u.user_id
       LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
       WHERE sr.request_id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const r = requests[0];
    const distanceKm = calculateHaversineDistance(r.user_lat, r.user_long, r.garage_lat, r.garage_lng);

    res.json({ success: true, request: { ...r, distanceKm } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelSosRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const [existing] = await db.query(
      'SELECT request_id, garage_id, user_id, status FROM service_requests WHERE request_id = ?',
      [requestId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    await db.query(
      "UPDATE service_requests SET status = 'Cancelled' WHERE request_id = ?",
      [requestId]
    );

    await recordDispatchEvent({
      requestId: Number(requestId),
      previousStatus: existing[0].status,
      currentStatus: 'Cancelled',
      actionByRole: req.user?.role || 'car_owner',
      notes: 'Dispatch cancelled'
    });

    emitRealtimeEvent('sos:updated', {
      requestId: Number(requestId),
      garageId: existing[0].garage_id,
      userId: existing[0].user_id,
      status: 'Cancelled'
    });

    res.json({ success: true, message: 'Request cancelled successfully.', status: 'Cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createBookingRequest = async (req, res) => {
  try {
    const { userId, garageId, serviceId, vehicleId, scheduledDate, scheduledTime, notes } = req.body;
    const resolvedUserId = req.user?.userId || userId;

    if (!resolvedUserId || !garageId || !serviceId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'Garage, service, date, and time slot are required.' });
    }

    // Anti-double-booking check
    const [conflicts] = await db.query(
      `SELECT request_id FROM service_requests
       WHERE garage_id = ? AND request_type = 'Maintenance'
         AND scheduled_date = ? AND scheduled_time = ?
         AND status NOT IN ('Cancelled', 'Completed')`,
      [garageId, scheduledDate, scheduledTime]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'That time slot is already booked at this workshop. Please pick another slot.'
      });
    }

    const [services] = await db.query('SELECT * FROM services WHERE service_id = ?', [serviceId]);
    if (services.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected service not found.' });
    }

    const [garages] = await db.query('SELECT * FROM garages WHERE garage_id = ?', [garageId]);
    if (garages.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected workshop not found.' });
    }

    const service = services[0];
    const garage = garages[0];
    const issueDescription = notes
      ? `${service.service_name} — ${notes}`
      : service.service_name;

    const [result] = await db.query(
      `INSERT INTO service_requests
       (user_id, garage_id, vehicle_id, service_id, request_type, user_lat, user_long, location_name, issue_description, scheduled_date, scheduled_time, status, estimated_cost)
       VALUES (?, ?, ?, ?, 'Maintenance', ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        resolvedUserId,
        garageId,
        vehicleId || null,
        serviceId,
        garage.latitude,
        garage.longitude,
        garage.address,
        issueDescription,
        scheduledDate,
        scheduledTime,
        service.base_price
      ]
    );

    await recordDispatchEvent({
      requestId: result.insertId,
      previousStatus: null,
      currentStatus: 'Pending',
      actionByRole: req.user?.role || 'car_owner',
      notes: `Scheduled maintenance (${scheduledDate} ${scheduledTime})`
    });

    emitRealtimeEvent('sos:created', {
      requestId: result.insertId,
      userId: resolvedUserId,
      garageId: Number(garageId),
      requestType: 'Maintenance',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      booking: {
        request_id: result.insertId,
        garage_name: garage.garage_name,
        service_name: service.service_name,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        estimated_cost: service.base_price,
        status: 'Pending'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const [bookings] = await db.query(
      `SELECT sr.*, g.garage_name, g.address AS garage_address, v.make_model, v.license_plate
       FROM service_requests sr
       LEFT JOIN garages g ON sr.garage_id = g.garage_id
       LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
       WHERE sr.user_id = ? AND sr.request_type = 'Maintenance'
       ORDER BY sr.request_id DESC`,
      [userId]
    );
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserInvoices = async (req, res) => {
  try {
    const { userId } = req.params;
    const [invoices] = await db.query(
      `SELECT i.*, sr.issue_description, sr.request_type, sr.location_name, sr.user_lat, sr.user_long,
              g.garage_name, g.latitude AS garage_lat, g.longitude AS garage_lng
       FROM invoices i
       JOIN service_requests sr ON i.request_id = sr.request_id
       LEFT JOIN garages g ON sr.garage_id = g.garage_id
       WHERE sr.user_id = ?
       ORDER BY i.invoice_id DESC`,
      [userId]
    );

    const enriched = invoices.map((inv) => ({
      ...inv,
      distance_km: calculateHaversineDistance(inv.user_lat, inv.user_long, inv.garage_lat, inv.garage_lng)
    }));

    res.json({ success: true, invoices: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethod } = req.body;

    const [existing] = await db.query('SELECT * FROM invoices WHERE invoice_id = ?', [invoiceId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    await db.query(
      "UPDATE invoices SET payment_status = 'Paid', payment_method = ? WHERE invoice_id = ?",
      [paymentMethod || 'bKash / Nagad (Settled)', invoiceId]
    );

    emitRealtimeEvent('invoice:updated', { invoiceId: Number(invoiceId), paymentStatus: 'Paid' });

    res.json({ success: true, message: 'Invoice paid successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
