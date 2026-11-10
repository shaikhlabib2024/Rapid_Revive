const GEOCODE_BASE = 'https://geocode.googleapis.com/v4/geocode';

function getApiKey() {
  return (process.env.GOOGLE_MAPS_API_KEY || '').trim();
}

function createMissingKeyError() {
  const err = new Error('GOOGLE_MAPS_API_KEY is not configured in server/.env');
  err.code = 'MISSING_API_KEY';
  return err;
}

/**
 * Translates latitude/longitude into a human-readable location name using
 * Google Maps Platform Geocoding API v4 (server-side proxy).
 */
async function reverseGeocode(lat, lng) {
  const apiKey = getApiKey();
  if (!apiKey) throw createMissingKeyError();

  const url = new URL(`${GEOCODE_BASE}/location`);
  url.searchParams.append('location.latitude', String(lat));
  url.searchParams.append('location.longitude', String(lng));
  url.searchParams.append('languageCode', 'en');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'results.placeId,results.formattedAddress,results.addressComponents',
      'X-Goog-Maps-Solution-ID': 'gmp_git_agentskills_v1'
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Geocoding API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const top = data.results?.[0];
  if (!top) {
    throw new Error('No location name found for those coordinates.');
  }

  return {
    formattedAddress: top.formattedAddress,
    placeId: top.placeId || null
  };
}

/**
 * Translates a human-readable address/location name into coordinates using
 * Google Maps Platform Geocoding API v4.
 */
async function forwardGeocode(address) {
  const apiKey = getApiKey();
  if (!apiKey) throw createMissingKeyError();

  const encoded = encodeURIComponent(address);
  const url = `${GEOCODE_BASE}/address/${encoded}?languageCode=en`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'results.placeId,results.location,results.formattedAddress',
      'X-Goog-Maps-Solution-ID': 'gmp_git_agentskills_v1'
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Geocoding API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const top = data.results?.[0];
  if (!top || !top.location) {
    throw new Error('Unable to resolve coordinates for that location name.');
  }

  return {
    latitude: top.location.latitude,
    longitude: top.location.longitude,
    formattedAddress: top.formattedAddress || address,
    placeId: top.placeId || null
  };
}

module.exports = { reverseGeocode, forwardGeocode };

