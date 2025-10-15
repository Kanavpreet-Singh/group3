import React, { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL;

function Donut({ data = [], size = 220, thickness = 44 }) {
  const radius = size / 2;
  const innerR = radius - thickness;
  const circumference = 2 * Math.PI * radius;

  let startAngle = -90; // start from top

  const rad = deg => (deg * Math.PI) / 180;

  const segments = data.map(d => {
    const sweep = (d.value / 100) * 360;
    const start = startAngle;
    const end = start + sweep;
    startAngle = end;
    const large = sweep > 180 ? 1 : 0;
    const x1 = radius + radius * Math.cos(rad(start));
    const y1 = radius + radius * Math.sin(rad(start));
    const x2 = radius + radius * Math.cos(rad(end));
    const y2 = radius + radius * Math.sin(rad(end));
    const dAttr = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    return { dAttr, color: d.color, label: d.label, value: d.value };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
        </filter>
      </defs>
      <g filter="url(#soft)">
        {segments.map((s, i) => (
          <path key={i} d={s.dAttr} fill={s.color} stroke="#fff" strokeWidth="1" />
        ))}
        {/* center circle to make it donut */}
        <circle cx={radius} cy={radius} r={innerR} fill="#0f172a" />
        <text x={radius} y={radius - 6} textAnchor="middle" fill="#fff" fontSize="18" fontWeight={700}>
          {data.reduce((acc, d) => acc + d.value, 0)}%
        </text>
        <text x={radius} y={radius + 14} textAnchor="middle" fill="#94a3b8" fontSize="12">
          of messages
        </text>
      </g>
    </svg>
  );
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [donutSize, setDonutSize] = useState(220);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/chats/messages/category-stats`, {
        headers: token ? { token } : {}
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json();
      setTotal(json.total || 0);
      setStats(json.stats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // responsive donut size
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setDonutSize(140); // mobile
      else if (w < 1024) setDonutSize(200); // tablet
      else setDonutSize(260); // desktop
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  if (loading) return <div className="p-6 bg-slate-900 rounded-lg text-white">Loading Analytics…</div>;
  if (error) return <div className="p-6 bg-rose-900 rounded-lg text-white">Error: {error}</div>;

  const colors = ['#F97316', '#06B6D4', '#34D399', '#A78BFA'];

  const mapped = stats.map((s, i) => ({
    label: s.category,
    value: total > 0 ? Math.round((s.count / total) * 100) : 0,
    color: colors[i % colors.length],
  }));

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-md text-white max-w-4xl w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold">Message Category Analytics</h3>
          <p className="text-sm text-slate-400">Breakdown of user messages by category</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStats} className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">Refresh</button>
        </div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-none">
          <Donut data={mapped} size={donutSize} />
        </div>

        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mapped.map(m => (
              <div key={m.label} className="p-3 bg-slate-800 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span style={{ width: 14, height: 14, background: m.color }} className="inline-block rounded" />
                    <div>
                      <div className="text-sm sm:text-base text-slate-300">{m.label}</div>
                      <div className="text-lg sm:text-xl font-semibold">{m.value}%</div>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">{Math.round((m.value/100) * total)} msgs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
