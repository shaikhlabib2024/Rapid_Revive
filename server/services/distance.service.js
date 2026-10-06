/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Calculates fare: Base Fee + (Distance * Rate)
 */
function calculateFare(basePrice = 15.00, distanceKm = 0) {
  const PER_KM_RATE = 2.50;
  const total = parseFloat(basePrice) + distanceKm * PER_KM_RATE;
  return parseFloat(total.toFixed(2));
}

module.exports = { calculateHaversineDistance, calculateFare };
