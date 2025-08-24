"use client";

export default function ScheduleViewer({ schedule }) {
  // helper to pretty-print time
  const fmt = (t) => {
    const [h, m] = t.split(":");
    const hour = Number(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-6">
      <h2 className="text-xl font-bold mb-4">Your Optimised Week</h2>

      {schedule.map((day) => (
        <div key={day.day} className="border rounded-md p-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">{day.day}</h3>
          <div className="space-y-2">
            {day.activities.map((act, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded text-sm"
              >
                <span className="font-medium">{act.activity}</span>
                <span className="text-gray-600">
                  {fmt(act.start_time)} – {fmt(act.end_time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => window.location.reload()}
        className="w-full mt-4 bg-slate-800 text-white py-2 rounded hover:bg-slate-700"
      >
        Regenerate
      </button>
    </div>
  );
}
