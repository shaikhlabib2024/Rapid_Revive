const db = require('../config/db');

/**
 * Records a timestamped dispatch lifecycle event in the `dispatches` table.
 */
async function recordDispatchEvent({
  requestId,
  previousStatus = null,
  currentStatus,
  actionByRole = 'system',
  mechanicName = null,
  notes = null
}) {
  const [rows] = await db.query(
    `SELECT sr.request_id, sr.user_id, sr.garage_id, sr.request_type,
            sr.location_name, sr.issue_description, sr.mechanic_name, sr.estimated_cost,
            u.full_name AS customer_name, g.garage_name
     FROM service_requests sr
     JOIN users u ON sr.user_id = u.user_id
     LEFT JOIN garages g ON sr.garage_id = g.garage_id
     WHERE sr.request_id = ?`,
    [requestId]
  );

  if (rows.length === 0) return null;
  const r = rows[0];

  const [result] = await db.query(
    `INSERT INTO dispatches
     (request_id, customer_id, customer_name, garage_id, garage_name, request_type,
      location_name, issue_description, mechanic_name, previous_status, current_status,
      estimated_cost, action_by_role, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      r.request_id,
      r.user_id,
      r.customer_name,
      r.garage_id || null,
      r.garage_name || null,
      r.request_type || 'SOS',
      r.location_name || 'Dhaka',
      r.issue_description || '',
      mechanicName ?? r.mechanic_name ?? null,
      previousStatus,
      currentStatus,
      r.estimated_cost || 0,
      actionByRole,
      notes
    ]
  );

  return result.insertId;
}

module.exports = { recordDispatchEvent };

