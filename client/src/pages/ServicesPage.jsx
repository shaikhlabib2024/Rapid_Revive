import React from 'react';
import { Link } from 'react-router-dom';

export default function ServicesPage() {
  const serviceGuides = [
    {
      id: 'towing',
      title: 'Flatbed & Hook Towing Service',
      category: 'Emergency Dispatch',
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
      problem: 'Vehicle completely stalled due to severe engine failure, transmission breakdown, or major accident damage.',
      symptoms: ['Engine does not crank at all', 'Metal clunking noises', 'Transmission fluid leak', 'Post-collision mobility loss'],
      solutionSteps: [
        'Pull over safely to the road shoulder and turn on your hazard emergency lights.',
        'Trigger Rapid-Revive 1-Click SOS from your phone to send GPS coordinates.',
        'Our system matches the nearest flatbed tow truck in Bashundhara / Dhaka.',
        'Professional mechanic arrives, safely winches your vehicle onto the hydraulic flatbed, and transports it to your preferred verified workshop.'
      ]
    },
    {
      id: 'battery',
      title: 'On-Site Battery Jump Start & Replacement',
      category: 'Electrical Troubleshooting',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      problem: 'Dead or depleted 12V automotive battery leaving the car unable to ignite.',
      symptoms: ['Rapid clicking sound when turning the key', 'Dim headlights and dashboard indicators', 'Vehicle sat idle for prolonged time'],
      solutionSteps: [
        'Verify transmission is in Park/Neutral with the emergency brake engaged.',
        'Request Rapid-Revive Mobile Battery Dispatch.',
        'Mechanic tests battery voltage with a digital multimeter and alternator output.',
        'Performs jump start using heavy-duty booster cables or replaces old battery on-site with a brand-new unit.'
      ]
    },
    {
      id: 'tire',
      title: 'Flat Tire Replacement & Puncture Fix',
      category: 'Wheel & Suspension',
      image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
      problem: 'Punctured, blown out, or low-pressure tire stranded on the road.',
      symptoms: ['Vehicle pulling severely to one side', 'Thumping sound while driving', 'Visible nail or tire deflation'],
      solutionSteps: [
        'Steer vehicle onto a flat, non-sloped ground away from oncoming traffic.',
        'Dispatch Rapid-Revive mobile tire mechanic.',
        'Mechanic jacks up vehicle, removes damaged wheel, and mounts your spare donut or installs plug repair.',
        'Checks tire pressure (PSI) on all 4 wheels before you resume driving.'
      ]
    },
    {
      id: 'fuel',
      title: 'Emergency Fuel Delivery Service',
      category: 'Roadside Delivery',
      image: 'https://images.unsplash.com/photo-1527016021513-b09758b777bd?auto=format&fit=crop&w=800&q=80',
      problem: 'Fuel tank empty before reaching the nearest filling station in Dhaka.',
      symptoms: ['Engine sputtering and losing RPMs', 'Fuel gauge on empty indicator', 'Fuel pump humming loudly'],
      solutionSteps: [
        'Turn off ignition immediately to prevent fuel pump dry-running damage.',
        'Select "Fuel Delivery" on Rapid-Revive SOS.',
        'Dispatcher delivers 5-10 Liters of Octane, Diesel, or CNG assistance directly to your location.',
        'Primes the fuel system and verifies engine restart.'
      ]
    },
    {
      id: 'lockout',
      title: 'Car Door Lockout Assistance',
      category: 'Key & Security',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      problem: 'Keys locked inside the vehicle or electronic key fob malfunction.',
      symptoms: ['Doors auto-locked with key in ignition', 'Key fob battery dead', 'Key snapped in lock cylinder'],
      solutionSteps: [
        'Request Lockout Specialist through Rapid-Revive.',
        'Verified locksmith arrives with non-destructive air-wedge and long-reach tools.',
        'Safely unlocks door without scratching paint or damaging weatherstripping.',
        'Replaces key fob battery if required.'
      ]
    },
    {
      id: 'diagnostics',
      title: 'Engine OBD-II Computer Diagnostics',
      category: 'Maintenance & Repairs',
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      problem: 'Check Engine Light illuminated with erratic engine performance.',
      symptoms: ['Check Engine Light (CEL) on', 'Poor fuel economy & hesitation', 'Excessive exhaust smoke'],
      solutionSteps: [
        'Connect OBD-II scanner to car diagnostic port under steering column.',
        'Read exact Diagnostic Trouble Codes (DTCs) for engine/transmission sensors.',
        'Mechanic provides diagnostic report and executes on-site sensor clean/replace or schedules workshop repair.'
      ]
    }
  ];

  return (
    <div className="py-12 bg-slate-950 text-slate-100 space-y-12">
      <section className="max-w-6xl mx-auto px-6 text-center space-y-4">
        <span className="inline-block bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-extrabold px-3 py-1 rounded-full">
          🛠️ Detailed Service & Troubleshooting Guides
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Vehicle Breakdown Solutions & Step-by-Step Fixes
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-400 leading-relaxed">
          Learn how Rapid-Revive diagnoses common roadside breakdowns, what symptoms to look for, and the exact steps our verified mechanics perform.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 space-y-12">
        {serviceGuides.map((guide) => (
          <div key={guide.id} className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-5 relative min-h-[260px] md:min-h-full bg-slate-950">
              <img src={guide.image} alt={guide.title} className="w-full h-full object-cover opacity-85" />
              <span className="absolute top-4 left-4 bg-slate-950/90 text-slate-200 border border-slate-800 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                {guide.category}
              </span>
            </div>

            <div className="md:col-span-7 p-6 md:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-white">{guide.title}</h2>
                
                <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3.5 text-xs text-rose-200">
                  <span className="font-bold text-rose-400">⚠️ Problem: </span>
                  {guide.problem}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Common Symptoms:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-slate-300">
                    {guide.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-red-500 font-bold">•</span> {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">How Rapid-Revive Fixes It:</h4>
                  <ol className="space-y-2 text-xs text-slate-300">
                    {guide.solutionSteps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-900/60 border border-blue-700 text-blue-300 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Available 24/7 across Dhaka & Bashundhara</span>
                <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition">
                  Dispatch Assistance Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
