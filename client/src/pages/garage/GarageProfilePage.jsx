import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { updateUserProfile, changeUserPassword } from '../../api/authApi';
import { updateGarageLocation, getGarageStatus } from '../../api/garageApi';
import { reverseGeocodeLocation } from '../../api/sosApi';
import { useRealtimeEvents } from '../../hooks/useRealtimeEvents';

export default function GarageProfilePage() {
  const { user, login } = useContext(AuthContext);
  const garageId = user?.garageId || 1;

  const [garageMeta, setGarageMeta] = useState({
    tradeLicenseNo: user?.tradeLicenseNo || '',
    nidNumber: user?.nidNumber || '',
    isVerified: !!user?.isVerified,
    verificationStatus: user?.verificationStatus || (user?.isVerified ? 'Approved' : 'Pending')
  });

  const [garageForm, setGarageForm] = useState({
    garageName: user?.garageName || '',
    ownerName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || 'Bashundhara R/A, Dhaka',
    latitude: user?.latitude || 23.8103,
    longitude: user?.longitude || 90.4125
  });

  const loadLiveGarage = useCallback(async () => {
    try {
      const res = await getGarageStatus(garageId);
      if (res.success && res.garage) {
        const g = res.garage;
        setGarageMeta({
          tradeLicenseNo: g.trade_license_no,
          nidNumber: g.nid_number,
          isVerified: !!g.is_verified,
          verificationStatus: g.verification_status || (g.is_verified ? 'Approved' : 'Pending')
        });
        setGarageForm({
          garageName: g.garage_name || '',
          ownerName: g.owner_name || user?.fullName || '',
          phoneNumber: g.phone_number || user?.phoneNumber || '',
          address: g.address || '',
          latitude: parseFloat(g.latitude) || 23.8103,
          longitude: parseFloat(g.longitude) || 90.4125
        });
      }
    } catch {
      // Keep current state if transient error
    }
  }, [garageId, user?.fullName, user?.phoneNumber]);

  useEffect(() => {
    loadLiveGarage();
  }, [loadLiveGarage]);

  useRealtimeEvents(['garage:updated'], (evt) => {
    if (!evt.payload?.garageId || evt.payload.garageId === garageId) {
      loadLiveGarage();
    }
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [locationMsg, setLocationMsg] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Fetch current workshop location name from Google Maps via GPS
  const handleCaptureGps = () => {
    setLocationMsg('Fetching workshop location name from Google Maps...');
    if (!navigator.geolocation) {
      setLocationMsg('❌ Browser geolocation is unavailable. Enter your location name manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await reverseGeocodeLocation(lat, lng);
          if (res.success && res.locationName) {
            setGarageForm((prev) => ({
              ...prev,
              address: res.locationName,
              latitude: lat,
              longitude: lng
            }));
            setLocationMsg('✓ Location name fetched from Google Maps! Click Save to update.');
          } else {
            setLocationMsg('❌ Could not resolve location name. Please enter it manually.');
          }
        } catch (err) {
          const requiresKey = err.response?.data?.requiresApiKey;
          setLocationMsg(
            requiresKey
              ? '⚠️ Google Maps Geocoding API key not configured yet in server/.env. Enter location name manually or add GOOGLE_MAPS_API_KEY.'
              : '❌ Could not fetch location name from Google Maps. Please enter it manually.'
          );
        }
      },
      () => {
        setLocationMsg('❌ Location permission denied. Please enter your workshop location name manually.');
      }
    );
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      await updateGarageLocation({
        garageId: user?.garageId || 1,
        address: garageForm.address,
        latitude: garageForm.latitude,
        longitude: garageForm.longitude
      });
      const updated = {
        ...user,
        address: garageForm.address
      };
      login(updated, sessionStorage.getItem('token'));
      setLocationMsg('✓ Workshop location name saved in database!');
    } catch (err) {
      setLocationMsg(`❌ ${err.response?.data?.message || 'Failed to save workshop location.'}`);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        userId: user?.id,
        fullName: garageForm.ownerName,
        phoneNumber: garageForm.phoneNumber,
        garageName: garageForm.garageName,
        address: garageForm.address
      });
      const updated = {
        ...user,
        fullName: garageForm.ownerName,
        phoneNumber: garageForm.phoneNumber,
        garageName: garageForm.garageName,
        address: garageForm.address
      };
      login(updated, sessionStorage.getItem('token'));
      setProfileMsg('✓ Workshop profile details saved to database.');
    } catch (err) {
      setProfileMsg(`❌ ${err.response?.data?.message || 'Failed to update workshop profile.'}`);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg('❌ Passwords do not match.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassMsg('❌ Password must be at least 6 characters.');
      return;
    }

    try {
      await changeUserPassword({
        userId: user?.id,
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassMsg('✓ Workshop account password updated in database.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg(`❌ ${err.response?.data?.message || 'Failed to update password.'}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-slate-100 py-2">
      <div>
        <h1 className="text-2xl font-bold text-white">Workshop Profile & Live Location Pinning</h1>
        <p className="text-xs text-slate-400 mt-1">
          Pin your exact workshop coordinates on the map so nearby stranded drivers can find you, and manage verification credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WORKSHOP GPS PINNING FORM */}
        <form onSubmit={handleSaveLocation} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white">📍 Workshop Map Location</h2>
              <p className="text-xs text-slate-400 mt-0.5">Used by our Haversine algorithm to match nearby drivers.</p>
            </div>
            <button
              type="button"
              onClick={handleCaptureGps}
              className="text-[11px] font-bold bg-amber-950/80 border border-amber-700 text-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-900 transition"
            >
              📡 Fetch Location Name
            </button>
          </div>

          {locationMsg && (
            <div className="p-3 bg-slate-950 border border-amber-800/80 rounded-xl text-xs font-semibold text-amber-300">
              {locationMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Workshop Location Name (from Google Maps)</label>
            <input
              required
              type="text"
              value={garageForm.address}
              onChange={(e) => setGarageForm({ ...garageForm, address: e.target.value, latitude: null, longitude: null })}
              placeholder="Click Auto-Capture Location or enter workshop address"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {garageForm.address && (
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-800">
              <iframe
                title="Workshop Google Map Preview"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(garageForm.address)}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* VERIFICATION BADGES */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Trade License:</span>
              <span className="font-mono font-bold text-amber-400">{garageMeta.tradeLicenseNo || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">National ID (NID):</span>
              <span className="font-mono font-bold text-blue-400">{garageMeta.nidNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
              <span className="text-slate-400">Status:</span>
              {garageMeta.verificationStatus === 'Approved' || garageMeta.isVerified ? (
                <span className="text-emerald-400 font-bold">✓ Verified by System Admin</span>
              ) : garageMeta.verificationStatus === 'Rejected' ? (
                <span className="text-rose-400 font-bold">✕ Verification Rejected by Admin</span>
              ) : (
                <span className="text-amber-400 font-bold">⏳ Pending Admin Verification</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition shadow"
          >
            Save Workshop Location Name
          </button>
        </form>

        {/* WORKSHOP DETAILS & PASSWORD FORM */}
        <div className="space-y-6">
          <form onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Workshop Contact Information</h2>
            </div>

            {profileMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-xs font-semibold text-emerald-300">
                {profileMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Workshop Business Name</label>
              <input
                required
                type="text"
                value={garageForm.garageName}
                onChange={(e) => setGarageForm({ ...garageForm, garageName: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Owner / Manager Name</label>
              <input
                required
                type="text"
                value={garageForm.ownerName}
                onChange={(e) => setGarageForm({ ...garageForm, ownerName: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Emergency Dispatch Phone</label>
              <input
                required
                type="text"
                value={garageForm.phoneNumber}
                onChange={(e) => setGarageForm({ ...garageForm, phoneNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition"
            >
              Save Workshop Details
            </button>
          </form>

          {/* PASSWORD RESET */}
          <form onSubmit={handleChangePassword} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Reset Account Password</h3>

            {passMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold border ${
                passMsg.startsWith('✓') ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' : 'bg-rose-950/80 border-rose-700 text-rose-300'
              }`}>
                {passMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                required
                type="password"
                placeholder="New Password"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                required
                type="password"
                placeholder="Confirm Password"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700 transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
