/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const numLat1 = parseFloat(lat1);
  const numLon1 = parseFloat(lon1);
  const numLat2 = parseFloat(lat2);
  const numLon2 = parseFloat(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) {
    return 0.0;
  }

  const R = 6371; // Earth's radius in KM
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return isNaN(dist) ? 0.0 : parseFloat(dist.toFixed(2));
}

/**
 * Calculates fare: Base Fee + (Distance * Rate)
 */
function calculateFare(basePrice = 15.00, distanceKm = 0) {
  const numBase = parseFloat(basePrice) || 15.00;
  const numDist = parseFloat(distanceKm) || 0.0;
  const PER_KM_RATE = 2.50;
  const total = numBase + numDist * PER_KM_RATE;
  return parseFloat(total.toFixed(2));
}

module.exports = { calculateHaversineDistance, calculateFare };
