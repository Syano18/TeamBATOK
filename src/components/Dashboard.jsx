import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { Info, Users, Home, LayoutGrid, PieChart as PieChartIcon, TrendingUp, User } from 'lucide-react';
import { DATA } from '../data/kalingaData';

const COLORS = {
  bg: '#0f172a',
  panel: 'linear-gradient(145deg, rgba(35, 39, 58, 0.85) 0%, rgba(20, 22, 33, 0.6) 100%)',
  panelAlt: 'linear-gradient(145deg, rgba(45, 50, 70, 0.9) 0%, rgba(25, 28, 41, 0.7) 100%)',
  border: 'rgba(255, 255, 255, 0.08)',
  rust: '#06b6d4',
  rustSoft: 'rgba(6, 182, 212, 0.15)',
  gold: '#8b5cf6',
  teal: '#ec4899',
  cream: '#f8fafc',
  creamDim: '#94a3b8',
  male: '#3b82f6',
  female: '#ec4899',
};

const MUNI_COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#f43f5e'];

function fmt(n) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-US');
}
function fmtCompact(n) {
  if (n === null || n === undefined) return '—';
  if (n >= 1000) return (n/1000).toFixed(1) + 'k';
  return n.toString();
}
function pctChange(a, b) {
  if (!a || !b) return null;
  return (((b - a) / a) * 100).toFixed(1);
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'trends', label: 'Population Trends' },
  { id: 'agegender', label: 'Age & Gender' },
  { id: 'households', label: 'Households' },
  { id: 'explorer', label: 'Municipalities & Barangays' },
];

function CustomTooltip({ active, payload, label, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: COLORS.panelAlt, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 14px', fontSize: 12.5 }}>
      <div style={{ color: COLORS.gold, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: COLORS.cream, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: p.color || p.fill }}>{p.name}</span>
          <span style={{ fontWeight: 600 }}>{fmt(p.value)}{suffix || ''}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div 
      className="stat-card" 
      style={{
        background: COLORS.panel, 
        border: `1px solid ${COLORS.border}`, 
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        padding: '18px 20px', flex: '1 1 200px', position: 'relative', overflow: 'visible'
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 10, zIndex: -1 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ color: COLORS.creamDim, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        {Icon && <Icon size={16} style={{ color: accent, opacity: 0.8 }} />}
      </div>
      <div style={{ color: COLORS.cream, fontSize: 26, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      {sub && <div style={{ color: accent, fontSize: 12.5, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, note }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ color: COLORS.cream, fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: 0.2 }}>{children}</h3>
      {note && <div style={{ color: COLORS.creamDim, fontSize: 12.5, marginTop: 4 }}>{note}</div>}
    </div>
  );
}

function Panel({ children, style, delay = 0 }) {
  return (
    <div className="panel-hover animate-enter" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: '20px 22px', animationDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${active ? COLORS.rust : COLORS.border}`,
      background: active ? COLORS.rustSoft : 'transparent',
      color: active ? COLORS.gold : COLORS.creamDim,
      transition: 'all 0.15s',
    }}>{children}</button>
  );
}

export default function KalingaDashboard() {
  const [tab, setTab] = useState('overview');
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    }
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfo]);

  const [selectedMunis, setSelectedMunis] = useState(['City of Tabuk', 'Pinukpuk']);
  const [pyramidYear, setPyramidYear] = useState(2020);
  const [pyramidLevel, setPyramidLevel] = useState('province');
  const [explorerMuni, setExplorerMuni] = useState('Balbalan');
  const [explorerBgy, setExplorerBgy] = useState(null);

  const years = [2010, 2015, 2020, 2024];
  const latestProv = DATA.province_trend[DATA.province_trend.length - 1];
  const firstProv = DATA.province_trend[0];
  const prevProv = DATA.province_trend[DATA.province_trend.length - 2];

  const avgHHSize = (latestProv.hh_population / latestProv.num_households).toFixed(2);
  const growthTotal = pctChange(firstProv.total_population, latestProv.total_population);
  const growthRecent = pctChange(prevProv.total_population, latestProv.total_population);

  const muniPop2024 = useMemo(() => (
    DATA.municipality_trend.filter(d => d.year === 2024).sort((a,b) => b.total_population - a.total_population)
  ), []);

  const trendChartData = useMemo(() => {
    return years.map(y => {
      const row = { year: y };
      selectedMunis.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        row[m] = rec ? rec.total_population : null;
      });
      return row;
    });
  }, [selectedMunis]);

  const pyramidData = useMemo(() => {
    const src = pyramidYear === 2024 ? null : DATA.age_pyramid[String(pyramidYear)];
    if (!src) return [];
    const ages = pyramidLevel === 'province' ? src.province : src.municipalities[pyramidLevel];
    if (!ages) return [];
    // approximate male/female split per age group using overall province or muni ratio for that year
    const totalsRec = pyramidLevel === 'province'
      ? DATA.province_trend.find(d => d.year === pyramidYear)
      : DATA.municipality_trend.find(d => d.year === pyramidYear && d.municipality === pyramidLevel);
    const maleRatio = totalsRec && totalsRec.male ? totalsRec.male / (totalsRec.male + totalsRec.female) : 0.51;
    return DATA.age_groups.map(ag => {
      const total = ages[ag] || 0;
      return {
        age: ag,
        male: -Math.round(total * maleRatio),
        female: Math.round(total * (1 - maleRatio)),
      };
    }).reverse();
  }, [pyramidYear, pyramidLevel]);

  const householdsChartData = useMemo(() => (
    years.map(y => {
      const row = { year: y };
      DATA.municipalities.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        row[m] = rec ? rec.num_households : null;
      });
      return row;
    })
  ), []);

  const avgSizeTrend = useMemo(() => (
    DATA.province_trend.map(d => ({ year: d.year, size: +(d.hh_population / d.num_households).toFixed(2) }))
  ), []);

  const explorerBarangays = useMemo(() => (
    (DATA.barangay_2024[explorerMuni] || []).slice().sort((a,b) => b.total_population - a.total_population)
  ), [explorerMuni]);

  const explorerBgyTrend = useMemo(() => {
    if (!explorerBgy) return [];
    const t = DATA.barangay_trend[explorerMuni]?.[explorerBgy];
    return t || [];
  }, [explorerMuni, explorerBgy]);

  const genderPieLatest = useMemo(() => {
    // latest year with gender data
    const rec = [...DATA.province_trend].reverse().find(d => d.male != null);
    if (!rec) return { year: null, data: [] };
    return { year: rec.year, data: [
      { name: 'Male', value: rec.male },
      { name: 'Female', value: rec.female },
    ]};
  }, []);

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, minHeight: '100%',
      color: COLORS.cream, padding: '28px 24px 24px', boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        body { margin: 0; background: ${COLORS.bg}; color: ${COLORS.cream}; }
        
        /* Animations */
        .logo-hover {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease;
        }
        .logo-hover:hover {
          transform: translateY(-5px) scale(1.08);
          filter: drop-shadow(0 12px 24px rgba(0,0,0,0.6)) brightness(1.1) !important;
          z-index: 10;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.85); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.6); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
          100% { transform: scale(0.85); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
        
        .info-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.4);
          color: #06b6d4;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }
        
        .info-button:hover {
          background: rgba(6, 182, 212, 0.3);
          color: #fff;
          transform: scale(1.05);
        }
        
        .info-button::after {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          border-radius: 50%;
          animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
          z-index: -1;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-enter {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
        }
        
        .stat-card {
          box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 1px 0 0 rgba(255, 255, 255, 0.05);
          transition: box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease;
        }
        
        .panel-hover {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .panel-hover:hover {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 36, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          
          <div style={{ flex: '1 1 auto', minWidth: 320, position: 'relative' }}>
            <div style={{ color: COLORS.gold, fontSize: 12.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              Province of Kalinga · CAR
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, margin: 0,
                color: COLORS.cream, letterSpacing: -0.3
              }}>Population & Household Census</h1>
              
              <div ref={infoRef} style={{ position: 'relative' }}>
                <button 
                  className="info-button"
                  onClick={() => setShowInfo(!showInfo)}
                  title="View Data Source"
                  style={{ width: 34, height: 34 }}
                >
                  <Info size={18} />
                </button>

                {showInfo && (
                  <div className="animate-enter" style={{
                    position: 'absolute',
                    top: -10,
                    left: '100%',
                    marginLeft: 16,
                    width: 350,
                    padding: 16,
                    background: COLORS.panelAlt,
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                    zIndex: 50,
                    fontSize: 13,
                    color: COLORS.cream,
                    lineHeight: 1.5,
                    textAlign: 'left'
                  }}>
                    <div style={{ color: COLORS.gold, fontWeight: 700, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Data Source
                    </div>
                    Philippine Statistics Authority (PSA) census data, reference dates:
                    <ul style={{ margin: '8px 0 0', paddingLeft: 22, color: COLORS.creamDim }}>
                      <li>2010 CPH (May 1, 2010)</li>
                      <li>2015 POPCEN (August 1, 2015)</li>
                      <li>2020 CPH (May 1, 2020)</li>
                      <li>2024 POPCEN (July 1, 2024)</li>
                    </ul>
                    <div style={{ marginTop: 12, color: COLORS.creamDim, fontSize: 11, lineHeight: 1.4, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                      The Philippine Statistics Authority (PSA) conducts these censuses as mandated by Republic Act No. 10625 (Philippine Statistical Act of 2013).
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ color: COLORS.creamDim, fontSize: 14, marginTop: 6 }}>
              1 City and 7 Municipalities · 2010 CPH – 2024 POPCEN
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', flex: '2 1 auto' }}>
            {['Kalinga', 'Tabuk', 'Balbalan', 'Lubuagan', 'Pasil', 'Pinukpuk', 'Rizal', 'Tanudan', 'Tinglayan'].map(name => (
              <img 
                key={name} 
                src={`/${name}.png`} 
                alt={`${name} Logo`} 
                style={{ 
                  height: 75, 
                  width: 'auto', 
                  objectFit: 'contain', 
                  filter: name === 'Kalinga' ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))' : 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                }} 
                className="logo-hover"
                title={name === 'Kalinga' ? 'Province of Kalinga' : name === 'Tabuk' ? 'City of Tabuk' : `Municipality of ${name}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 26, position: 'relative', zIndex: 20 }}>
        <StatCard 
          label="Total Population (2024)" value={fmt(latestProv.total_population)} sub={`+${growthTotal}% since 2010 CPH`} accent={COLORS.rust} icon={Users}
        />
        <StatCard 
          label="Household Population (2024)" value={fmt(latestProv.hh_population)} sub={`+${pctChange(firstProv.hh_population, latestProv.hh_population)}% since 2010 CPH`} accent={COLORS.male} icon={Home}
        />
        <StatCard 
          label="Number of Households (2024)" value={fmt(latestProv.num_households)} sub={`+${pctChange(firstProv.num_households, latestProv.num_households)}% since 2010 CPH`} accent={COLORS.gold} icon={LayoutGrid}
        />
        <StatCard 
          label="Avg. Household Size (2024)" value={avgHHSize} sub="persons / household" accent={COLORS.teal} icon={PieChartIcon}
        />
        <StatCard 
          label="Growth, 2020 CPH → 2024 POPCEN" value={`+${growthRecent}%`} sub={`${fmt(latestProv.total_population - prevProv.total_population)} new residents`} accent={COLORS.rust} icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 14 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
            border: 'none', background: tab === t.id ? COLORS.rust : 'transparent',
            color: tab === t.id ? '#fff' : COLORS.creamDim,
          }}>{t.label}</button>
        ))}
      </div>


      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel>
            <SectionTitle note="Combined total population across the city and 7 municipalities, by census year">Province-Wide Population Growth</SectionTitle>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={DATA.province_trend} margin={{ left: 5, right: 25, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.rust} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.rust} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                <Area type="monotone" dataKey="total_population" name="Total Population" stroke={COLORS.rust} strokeWidth={2.5} fill="url(#popGrad)" dot={{ fill: COLORS.rust, r: 4 }} />
                <Area type="monotone" dataKey="hh_population" name="Household Population" stroke={COLORS.male} strokeWidth={2.5} fillOpacity={0} strokeDasharray="5 5" dot={{ fill: COLORS.male, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Panel style={{ flex: '2 1 420px' }}>
              <SectionTitle note="2024 POPCEN — ranked by total population">Population by Municipality</SectionTitle>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={muniPop2024} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} tickFormatter={fmtCompact} />
                  <YAxis type="category" dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} width={95} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                  <Bar dataKey="total_population" name="Total Population" fill={COLORS.rust} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="hh_population" name="Household Population" fill={COLORS.male} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            <Panel style={{ flex: '1 1 260px' }}>
              <SectionTitle note="Source: 2020 CPH">Gender Distribution</SectionTitle>
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={genderPieLatest.data} 
                      dataKey="value" 
                      nameKey="name" 
                      innerRadius={70} 
                      outerRadius={95} 
                      paddingAngle={6}
                      stroke="none"
                      cornerRadius={5}
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (
                          <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                            {`${(percent * 100).toFixed(1)}%`}
                          </text>
                        );
                      }}
                    >
                      <Cell fill={COLORS.male} />
                      <Cell fill={COLORS.female} />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: COLORS.creamDim, fontWeight: 500 }}>
                  <User size={16} color={COLORS.male} /> Male
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: COLORS.creamDim, fontWeight: 500 }}>
                  <User size={16} color={COLORS.female} /> Female
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: COLORS.creamDim, lineHeight: 1.5 }}>
                Note: As of this date, there is no available released data on gender and age breakdowns for the 2024 POPCEN. We will update this once available.
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel>
            <SectionTitle note="Click municipalities to compare their population trajectories, 2010 CPH – 2024 POPCEN">Population Trends by Municipality</SectionTitle>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {DATA.municipalities.map(m => (
                <Pill key={m} active={selectedMunis.includes(m)} onClick={() => {
                  setSelectedMunis(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
                }}>{m}</Pill>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={trendChartData} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                {selectedMunis.map((m, i) => (
                  <Line key={m} type="monotone" dataKey={m} stroke={MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel>
            <SectionTitle note="Total population change from 2010 CPH to 2024 POPCEN, by municipality">Growth Comparison</SectionTitle>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DATA.municipalities.map(m => {
                const y10 = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === m);
                const y24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === m);
                return { municipality: m, growth: +pctChange(y10.total_population, y24.total_population) };
              }).sort((a,b) => b.growth - a.growth)} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} unit="%" width={50} />
                <Tooltip content={<CustomTooltip suffix="%" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="growth" name="Growth 2010 CPH–2024 POPCEN" radius={[4, 4, 0, 0]}>
                  {DATA.municipalities.map((m, i) => <Cell key={i} fill={COLORS.gold} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      )}

      {tab === 'agegender' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel>
            <SectionTitle note="Male and female counts are estimated per age band using each year's overall gender ratio, since the source only reports gender totals province/municipality-wide">Population Pyramid</SectionTitle>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[2010, 2015, 2020].map(y => (
                  <Pill key={y} active={pyramidYear === y} onClick={() => setPyramidYear(y)}>{y}</Pill>
                ))}
              </div>
              <div style={{ width: 1, height: 22, background: COLORS.border }} />
              <select value={pyramidLevel} onChange={e => setPyramidLevel(e.target.value)} style={{
                background: COLORS.panelAlt, color: COLORS.cream, border: `1px solid ${COLORS.border}`,
                borderRadius: 7, padding: '8px 12px', fontSize: 13, cursor: 'pointer'
              }}>
                <option value="province">Kalinga (Province-wide)</option>
                {DATA.municipalities.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={pyramidData} layout="vertical" stackOffset="sign" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={v => fmtCompact(Math.abs(v))} />
                <YAxis type="category" dataKey="age" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} width={70} />
                <Tooltip content={({active, payload, label}) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div style={{ background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 14px', fontSize: 12.5 }}>
                      <div style={{ color: COLORS.gold, fontWeight: 700, marginBottom: 4 }}>Ages {label}</div>
                      {payload.map((p, i) => (
                        <div key={i} style={{ color: COLORS.cream, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ color: p.color }}>{p.name}</span>
                          <span style={{ fontWeight: 600 }}>{fmt(Math.abs(p.value))}</span>
                        </div>
                      ))}
                    </div>
                  );
                }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                <Bar dataKey="male" name="Male" fill={COLORS.male} radius={[3, 0, 0, 3]} />
                <Bar dataKey="female" name="Female" fill={COLORS.female} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel>
            <SectionTitle note="Total male vs. female residents, by census year">Gender Balance Over Time</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={DATA.province_trend.filter(d => d.male != null)} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                <Bar dataKey="male" name="Male" fill={COLORS.male} radius={[4,4,0,0]} />
                <Bar dataKey="female" name="Female" fill={COLORS.female} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      )}

      {tab === 'households' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel>
            <SectionTitle note="Number of households per municipality, by census year">Households by Municipality</SectionTitle>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={householdsChartData} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim }} />
                {DATA.municipalities.map((m, i) => (
                  <Bar key={m} dataKey={m} name={m} stackId="hh" fill={MUNI_COLORS[i % MUNI_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Panel style={{ flex: '1 1 400px' }}>
              <SectionTitle note="Household population ÷ number of households, province-wide">Average Household Size</SectionTitle>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={avgSizeTrend} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                  <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} domain={['auto', 'auto']} width={40} />
                  <Tooltip content={<CustomTooltip suffix=" persons" />} />
                  <Line type="monotone" dataKey="size" name="Avg. household size" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.teal }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel style={{ flex: '1 1 400px' }}>
              <SectionTitle note="2024 POPCEN — households ranked by municipality">Households, 2024</SectionTitle>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...muniPop2024].sort((a,b) => b.num_households - a.num_households)} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} tickFormatter={fmtCompact} />
                  <YAxis type="category" dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} width={95} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="num_households" name="Households" radius={[0, 4, 4, 0]} fill={COLORS.gold} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'explorer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
              <SectionTitle note="2024 POPCEN — every barangay in the selected municipality">Barangay Explorer</SectionTitle>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {DATA.municipalities.map(m => (
                <Pill key={m} active={explorerMuni === m} onClick={() => { setExplorerMuni(m); setExplorerBgy(null); }}>{m}</Pill>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={Math.max(280, explorerBarangays.length * 26)}>
              <BarChart data={explorerBarangays} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                onClick={(e) => { if (e && e.activeLabel) setExplorerBgy(e.activeLabel); }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} tickFormatter={fmtCompact} />
                <YAxis type="category" dataKey="name" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} width={140} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="total_population" name="Population" radius={[0, 4, 4, 0]} cursor="pointer">
                  {explorerBarangays.map((b, i) => (
                    <Cell key={i} fill={b.name === explorerBgy ? COLORS.gold : COLORS.rust} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ color: COLORS.creamDim, fontSize: 12, marginTop: 10 }}>
              Click a bar to see that barangay's population trend below.
            </div>
          </Panel>

          {explorerBgy && explorerBgyTrend.length > 0 && (
            <Panel>
              <SectionTitle note={`${explorerBgy}, ${explorerMuni} — households and population, 2010 CPH – 2024 POPCEN`}>
                {explorerBgy} Trend
              </SectionTitle>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={explorerBgyTrend} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                  <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                  <Line type="monotone" dataKey="total_population" name="Population" stroke={COLORS.rust} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="num_households" name="Households" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          )}

          <Panel>
            <SectionTitle note={`All barangays in ${explorerMuni}, 2024 POPCEN`}>Detail Table</SectionTitle>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px', color: COLORS.creamDim, fontWeight: 600 }}>Barangay</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: COLORS.creamDim, fontWeight: 600 }}>Population</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: COLORS.creamDim, fontWeight: 600 }}>Households</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: COLORS.creamDim, fontWeight: 600 }}>Avg. HH Size</th>
                  </tr>
                </thead>
                <tbody>
                  {explorerBarangays.map((b, i) => (
                    <tr key={i} onClick={() => setExplorerBgy(b.name)} style={{
                      borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer',
                      background: b.name === explorerBgy ? COLORS.rustSoft : 'transparent'
                    }}>
                      <td style={{ padding: '8px 10px', color: COLORS.cream }}>{b.name}</td>
                      <td style={{ padding: '8px 10px', color: COLORS.cream, textAlign: 'right' }}>{fmt(b.total_population)}</td>
                      <td style={{ padding: '8px 10px', color: COLORS.cream, textAlign: 'right' }}>{fmt(b.num_households)}</td>
                      <td style={{ padding: '8px 10px', color: COLORS.cream, textAlign: 'right' }}>{(b.total_population / b.num_households).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

    </div>
  );
}
