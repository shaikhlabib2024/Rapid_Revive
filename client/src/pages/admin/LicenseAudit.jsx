import React, { useState } from 'react';

export default function LicenseAudit() {
  const [applications, setApplications] = useState([
    { id: 1, name: 'Speedy Motors', owner: 'Kabir Hossain', licenseNo: 'TL-2026-8812' },
    { id: 2, name: 'Apex Auto Care', owner: 'Mahmud Hasan', licenseNo: 'TL-2026-9043' }
  ]);

  const handleVerify = (id, status) => {
    setApplications(applications.filter(a => a.id !== id));
    alert(`Application ${status}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Garage License Verification Queue</h1>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b text-slate-700">
            <tr>
              <th className="p-4">Garage Name</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Trade License No</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b">
                <td className="p-4 font-bold">{app.name}</td>
                <td className="p-4">{app.owner}</td>
                <td className="p-4 font-mono">{app.licenseNo}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleVerify(app.id, 'APPROVED')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Approve</button>
                  <button onClick={() => handleVerify(app.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
