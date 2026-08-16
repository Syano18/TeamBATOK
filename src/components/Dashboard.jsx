import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie, Rectangle, ComposedChart, LabelList } from 'recharts';
import { Info, Users, Home, LayoutGrid, PieChart as PieChartIcon, TrendingUp, User, Map, ChevronDown, Database, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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
  female: '#ec4899' };

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
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'trends', label: 'Population Trends', icon: TrendingUp },
  { id: 'agegender', label: 'Age & Gender', icon: Users },
  { id: 'households', label: 'Households', icon: Home },
  { id: 'explorer', label: 'Barangays', icon: Map },
  { id: 'tables', label: 'Data Tables', icon: Database },
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

function CustomLegend({ payload }) {
  if (!payload) return null;
  const sortedPayload = [...payload].sort((a, b) => {
    if (a.value === 'Male' && b.value === 'Female') return -1;
    if (a.value === 'Female' && b.value === 'Male') return 1;
    return 0;
  });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: 6 }}>
      {sortedPayload.map((entry, index) => {
        const isLeft = index === 0;
        return (
          <div key={`item-${index}`} style={{ 
            display: 'flex', 
            flex: 1, 
            justifyContent: isLeft ? 'flex-end' : 'flex-start',
            paddingRight: isLeft ? 8 : 0,
            paddingLeft: !isLeft ? 8 : 0,
            alignItems: 'center', 
            gap: 6, 
            color: COLORS.creamDim, 
            fontSize: 12.5 
          }}>
            <div style={{ width: 12, height: 12, backgroundColor: entry.color || entry.fill, borderRadius: 2 }} />
            {entry.value}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon: Icon, delay = 0 }) {
  return (
    <div 
      className="stat-card animate-enter" 
      style={{
        '--accent': accent,
        animationDelay: `${delay}s`,
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
    <button className={`pill-button ${active ? 'active' : ''}`} onClick={onClick} style={{
      padding: '4px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${active ? COLORS.rust : COLORS.border}`,
      background: active ? COLORS.rustSoft : 'transparent',
      color: active ? '#fff' : COLORS.creamDim }}>{children}</button>
  );
}

function ModernSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative', width: 230 }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: COLORS.panelAlt, color: COLORS.cream, border: `1px solid ${open ? COLORS.rust : COLORS.border}`,
          borderRadius: 7, padding: '5px 12px', fontSize: 13, cursor: 'pointer',
          transition: 'all 0.2s ease', outline: 'none'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedOption.label}</span>
        <ChevronDown size={16} style={{ color: COLORS.creamDim, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>
      
      {open && (
        <div className="animate-enter" style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%',
          background: COLORS.panelAlt, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${COLORS.border}`, borderRadius: 8,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 100, padding: 6,
          maxHeight: 300, overflowY: 'auto'
        }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="select-option"
              style={{
                padding: '8px 12px', fontSize: 13, color: value === opt.value ? COLORS.rust : COLORS.cream,
                background: value === opt.value ? COLORS.rustSoft : 'transparent',
                borderRadius: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MaleBar = (props) => {
  let { x, y, width, height, fill } = props;
  if (width == null || width === 0) return null;

  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }

  if (width < 6) {
    x -= (6 - width);
    width = 6;
  }
  return <Rectangle {...props} x={x} y={y} width={width} height={height} fill={fill} radius={[3, 0, 0, 3]} />;
};

const FemaleBar = (props) => {
  let { x, y, width, height, fill } = props;
  if (width == null || width === 0) return null;

  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }

  if (width < 6) {
    width = 6;
  }
  return <Rectangle {...props} x={x} y={y} width={width} height={height} fill={fill} radius={[0, 3, 3, 0]} />;
};

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
  const [explorerMuni, setExplorerMuni] = useState(DATA.municipalities[0]);
  const [explorerBgy, setExplorerBgy] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ marginLeft: 4, opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} style={{ marginLeft: 4, color: COLORS.rust }} /> : <ArrowDown size={14} style={{ marginLeft: 4, color: COLORS.rust }} />;
  };

  const [householdMetric, setHouseholdMetric] = useState('num_households');
  const [tableLevel, setTableLevel] = useState('province');
  const [tableYear, setTableYear] = useState(2024);
  const [tableMuni, setTableMuni] = useState('City of Tabuk');

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
        female: Math.round(total * (1 - maleRatio)) };
    }).reverse();
  }, [pyramidYear, pyramidLevel]);

  const householdsChartData = useMemo(() => (
    years.map(y => {
      const row = { year: y };
      DATA.municipalities.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        row[m] = rec ? rec[householdMetric] : null;
      });
      return row;
    })
  ), [householdMetric]);

  const avgSizeTrend = useMemo(() => (
    DATA.province_trend.map(d => ({ year: d.year, size: +(d.hh_population / d.num_households).toFixed(2) }))
  ), []);

  const overviewTrendData = useMemo(() => (
    DATA.province_trend.map(d => ({
      ...d,
      hh_size: d.num_households ? +( (d.hh_population || d.total_population) / d.num_households ).toFixed(2) : null
    }))
  ), []);

  const muniAvgSizeTrendData = useMemo(() => (
    years.map(y => {
      const row = { year: y };
      DATA.municipalities.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        if (rec && rec.num_households) {
          row[m] = +( (rec.hh_population || rec.total_population) / rec.num_households ).toFixed(2);
        }
      });
      return row;
    })
  ), []);

  const explorerBarangays = useMemo(() => (
    (DATA.barangay_2024[explorerMuni] || []).slice().sort((a,b) => b.total_population - a.total_population)
  ), [explorerMuni]);

  useEffect(() => {
    if (explorerBarangays.length > 0) {
      setExplorerBgy(explorerBarangays[0].name);
    }
  }, [explorerBarangays]);

  const explorerBgyTrend = useMemo(() => {
    if (!explorerBgy) return [];
    const t = DATA.barangay_trend[explorerMuni]?.[explorerBgy];
    if (!t) return [];
    return t.map(d => ({
      ...d,
      hh_size: d.num_households ? +( (d.hh_population || d.total_population) / d.num_households ).toFixed(2) : null
    }));
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

  const tableData = useMemo(() => {
    let results = [];
    if (tableLevel === 'province') {
      const rec = DATA.province_trend.find(d => d.year === tableYear);
      if (rec) results = [{ name: 'Kalinga (Province)', ...rec }];
    } else if (tableLevel === 'municipality') {
      results = DATA.municipality_trend
        .filter(d => d.year === tableYear)
        .map(d => ({ name: d.municipality, ...d }));
    } else if (tableLevel === 'barangay') {
      if (tableYear === 2024 && DATA.barangay_2024[tableMuni]) {
        results = DATA.barangay_2024[tableMuni].slice();
      } else {
        const bgyDict = DATA.barangay_trend[tableMuni];
        if (bgyDict) {
          for (const [bName, trends] of Object.entries(bgyDict)) {
            const yData = trends.find(t => t.year === tableYear);
            if (yData) {
              results.push({ name: bName, ...yData });
            }
          }
        }
      }
    }

    if (sortConfig.key && results.length > 0) {
      results.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'avg_size') {
          aVal = a.num_households && (a.hh_population || a.total_population) ? ((a.hh_population || a.total_population) / a.num_households) : 0;
          bVal = b.num_households && (b.hh_population || b.total_population) ? ((b.hh_population || b.total_population) / b.num_households) : 0;
        }

        if (sortConfig.key === 'name' && tableLevel === 'municipality') {
          aVal = DATA.municipalities.indexOf(a.name);
          bVal = DATA.municipalities.indexOf(b.name);
        }

        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return results;
  }, [tableLevel, tableYear, tableMuni, sortConfig]);

  return (
    <>
    <div className="mobile-alert" style={{
      fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, height: '100vh',
      color: COLORS.cream, boxSizing: 'border-box', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: COLORS.panelAlt, padding: '40px', borderRadius: 16, border: `1px solid ${COLORS.border}`, maxWidth: 450, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: COLORS.rust, marginTop: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Screen Too Small</h2>
        <p style={{ color: COLORS.creamDim, lineHeight: 1.6, fontSize: 15 }}>We regret to inform you that this dashboard was designed to be viewed on ICT equipment with large screens like Desktops and Laptops.</p>
        <p style={{ color: COLORS.creamDim, lineHeight: 1.6, fontSize: 15, marginBottom: 0 }}>Please encourage them to open it in Desktop and Laptops to appreciate the animations and changes of charts and graphs.</p>
      </div>
    </div>
    <div className="dashboard-wrapper" style={{
      fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, height: '100vh',
      color: COLORS.cream, padding: '20px 24px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        body { margin: 0; background: ${COLORS.bg}; color: ${COLORS.cream}; overflow: hidden; }
        
        .mobile-alert { display: none !important; }
        @media (max-width: 900px) {
          .mobile-alert { display: flex !important; }
          .dashboard-wrapper { display: none !important; }
        }
        
        /* Animations */
        .logo-hover {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease;
        }
        .logo-hover:hover {
          transform: scale(1.08);
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)) brightness(1.1) !important;
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
        
        .select-option {
          transition: all 0.15s ease;
        }
        .select-option:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        
        .tab-button {
          transition: all 0.2s ease;
        }
        .tab-button:not(.active):hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: #fff !important;
        }
        
        .pill-button {
          transition: all 0.2s ease;
        }
        .pill-button:not(.active):hover {
          border-color: rgba(255, 255, 255, 0.3) !important;
          color: #fff !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }
        
        .stat-card {
          box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 1px 0 0 rgba(255, 255, 255, 0.05);
          transition: box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease;
        }
        
        .stat-card:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.3), 0 0 15px 0 var(--accent, rgba(255,255,255,0.1));
          border-color: var(--accent, rgba(255, 255, 255, 0.2));
          background: linear-gradient(145deg, rgba(35, 39, 58, 0.95) 0%, rgba(20, 22, 33, 0.8) 100%) !important;
          z-index: 10;
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
      <div style={{ marginBottom: 20, flex: 'none', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          
          <div style={{ flex: '1 1 auto', minWidth: 320, position: 'relative' }}>
            <div style={{ color: COLORS.gold, fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              Province of Kalinga · Cordillera Administrative Region
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
            {['Kalinga', 'Balbalan', 'Lubuagan', 'Pasil', 'Pinukpuk', 'Rizal', 'Tabuk', 'Tanudan', 'Tinglayan'].map(name => (
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
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20, position: 'relative', zIndex: 20, flex: 'none' }}>
        <StatCard 
          label="Total Population (2024)" value={fmt(latestProv.total_population)} sub={`+${growthTotal}% since 2010 CPH`} accent={COLORS.rust} icon={Users} delay={0.1}
        />
        <StatCard 
          label="Household Population (2024)" value={fmt(latestProv.hh_population)} sub={`+${pctChange(firstProv.hh_population, latestProv.hh_population)}% since 2010 CPH`} accent={COLORS.male} icon={Home} delay={0.2}
        />
        <StatCard 
          label="Number of Households (2024)" value={fmt(latestProv.num_households)} sub={`+${pctChange(firstProv.num_households, latestProv.num_households)}% since 2010 CPH`} accent={COLORS.gold} icon={LayoutGrid} delay={0.3}
        />
        <StatCard 
          label="Avg. Household Size (2024)" value={avgHHSize} sub="persons / household" accent={COLORS.teal} icon={PieChartIcon} delay={0.4}
        />
        <StatCard 
          label="Growth, 2020 CPH → 2024 POPCEN" value={`+${growthRecent}%`} sub={`${fmt(latestProv.total_population - prevProv.total_population)} new residents`} accent={COLORS.rust} icon={TrendingUp} delay={0.5}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 14, flex: 'none' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`tab-button ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              border: 'none', background: tab === t.id ? COLORS.rust : 'transparent',
              color: tab === t.id ? '#fff' : COLORS.creamDim }}>
              {Icon && <Icon size={16} />}
              {t.label}
            </button>
          );
        })}
      </div>


      {tab === 'overview' && (
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Combined population growth and average household size across the province, by census year">Province-Wide Population & Households</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overviewTrendData} margin={{ left: 5, right: 25, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.rust} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.rust} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis yAxisId="left" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={55} />
                <YAxis yAxisId="right" orientation="right" hide domain={[3, 6]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                <Area yAxisId="left" type="monotone" dataKey="total_population" name="Total Population" stroke={COLORS.rust} strokeWidth={2.5} fill="url(#popGrad)" dot={{ fill: COLORS.rust, r: 4 }} />
                <Area yAxisId="left" type="monotone" dataKey="hh_population" name="Household Population" stroke={COLORS.male} strokeWidth={2.5} fillOpacity={0} strokeDasharray="5 5" dot={{ fill: COLORS.male, r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="hh_size" name="Avg. HH Size" stroke={COLORS.gold} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} connectNulls>
                  <LabelList dataKey="hh_size" position="top" offset={10} fill="#ffffff" fontSize={13} fontWeight={600} formatter={(val) => val ? val.toFixed(1) : ''} />
                </Line>
              </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="2024 POPCEN — ranked by total population">Population by Municipality</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </Panel>
        </div>
      )}

      {tab === 'trends' && (
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Click municipalities to compare their population trajectories, 2010 CPH – 2024 POPCEN">Population Trends by Municipality</SectionTitle>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {DATA.municipalities.map(m => (
                <Pill key={m} active={selectedMunis.includes(m)} onClick={() => {
                  setSelectedMunis(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
                }}>{m}</Pill>
              ))}
            </div>
            <div style={{ flex: 1 , minHeight: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Total population change from 2010 CPH to 2024 POPCEN, by municipality">Growth Comparison</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
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
            </div>
          </Panel>
        </div>
      )}

      {tab === 'agegender' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[2010, 2015, 2020].map(y => (
                <Pill key={y} active={pyramidYear === y} onClick={() => setPyramidYear(y)}>{y}</Pill>
              ))}
            </div>
            <div style={{ width: 1, height: 22, background: COLORS.border }} />
            <ModernSelect 
              value={pyramidLevel} 
              onChange={setPyramidLevel} 
              options={[
                { value: 'province', label: 'Kalinga (Province-wide)' },
                ...DATA.municipalities.map(m => ({ value: m, label: m }))
              ]} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
            <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
              <SectionTitle note="Male and female counts are estimated per age band using each year's overall gender ratio, since the source only reports gender totals province/municipality-wide">Population Pyramid</SectionTitle>
              <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pyramidData} layout="vertical" stackOffset="sign" barCategoryGap="15%" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
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
                <Legend content={<CustomLegend />} wrapperStyle={{ paddingLeft: 80, paddingRight: 20 }} />
                <Bar dataKey="male" name="Male" stackId="a" fill={COLORS.male} shape={<MaleBar />} />
                <Bar dataKey="female" name="Female" stackId="a" fill={COLORS.female} shape={<FemaleBar />} />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Total male vs. female residents, by census year">Gender Balance Over Time</SectionTitle>
            <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pyramidLevel === 'province' ? DATA.province_trend.filter(d => d.male != null) : DATA.municipality_trend.filter(d => d.municipality === pyramidLevel && d.male != null)} margin={{ left: 0, right: 20, top: 35, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend content={<CustomLegend />} wrapperStyle={{ paddingLeft: 50, paddingRight: 20 }} />
                <Bar dataKey="male" name="Male" fill={COLORS.male} radius={[4,4,0,0]} />
                <Bar dataKey="female" name="Female" fill={COLORS.female} radius={[4,4,0,0]} />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          </div>
        </div>
      )}

      {tab === 'households' && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1.5 1 500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <SectionTitle note={`Total ${householdMetric === 'num_households' ? 'number of households' : 'household population'} per municipality, by census year`}>
                Households by Municipality
              </SectionTitle>
              <ModernSelect 
                value={householdMetric}
                onChange={setHouseholdMetric}
                options={[
                  { value: 'num_households', label: 'Number of Households' },
                  { value: 'hh_population', label: 'Household Population' }
                ]}
              />
            </div>
            <div style={{ flex: 1 , minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={householdsChartData} barCategoryGap="5%" barGap={1} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim }} />
                {DATA.municipalities.map((m, i) => (
                  <Bar key={m} dataKey={m} name={m} fill={MUNI_COLORS[i % MUNI_COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Household population ÷ number of households, by municipality">Average Household Size</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={muniAvgSizeTrendData} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                    <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                    <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} domain={[3, 'auto']} width={40} />
                    <Tooltip content={<CustomTooltip suffix=" persons" />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim }} />
                    {DATA.municipalities.map((m, i) => (
                      <Line key={m} type="monotone" dataKey={m} name={m} stroke={MUNI_COLORS[i % MUNI_COLORS.length]} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
          </Panel>
        </div>
      )}

      {tab === 'explorer' && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1.5 1 500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
              <SectionTitle note="2024 POPCEN — select a municipality to view its barangays">
                Population by Barangay
              </SectionTitle>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: -6 }}>
                {DATA.municipalities.map(m => (
                  <Pill key={m} active={explorerMuni === m} onClick={() => {
                    setExplorerMuni(m);
                  }}>{m}</Pill>
                ))}
              </div>
            </div>
            
            <div style={{ height: 300, overflowY: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: 8, paddingRight: 10 }}>
              <div style={{ height: Math.max(300, explorerBarangays.length * 35) }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={explorerBarangays} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
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
              </div>
            </div>
            <div style={{ color: COLORS.creamDim, fontSize: 12, marginTop: 10, flex: 'none' }}>
              Click a bar to view a different barangay's trend.
            </div>
          </Panel>

          {explorerBgy && explorerBgyTrend.length > 0 && (
            <Panel style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
              <SectionTitle note={`${explorerBgy}, ${explorerMuni} — households and population, 2010 CPH – 2024 POPCEN`}>
                Barangay {explorerBgy} Trend
              </SectionTitle>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={explorerBgyTrend} margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                  <YAxis yAxisId="left" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={50} />
                  <YAxis yAxisId="right" orientation="right" hide domain={[2, 7]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                  <Line yAxisId="left" type="monotone" dataKey="total_population" name="Population" stroke={COLORS.rust} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                  <Line yAxisId="left" type="monotone" dataKey="num_households" name="Households" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 4 }} connectNulls />
                  <Line yAxisId="right" type="monotone" dataKey="hh_size" name="Avg. HH Size" stroke={COLORS.gold} strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} connectNulls>
                    <LabelList dataKey="hh_size" position="top" offset={10} fill="#ffffff" fontSize={13} fontWeight={600} formatter={(val) => val ? val.toFixed(1) : ''} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
              </div>
            </Panel>
          )}

        </div>
      )}

      {tab === 'tables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16, flex: 'none' }}>
              <SectionTitle note="Comprehensive census data across multiple geographic levels and years">
                Statistical Data Tables
              </SectionTitle>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <ModernSelect 
                  value={tableLevel}
                  onChange={setTableLevel}
                  options={[
                    { value: 'province', label: 'Province Level' },
                    { value: 'municipality', label: 'City/Municipality Level' },
                    { value: 'barangay', label: 'Barangay Level' }
                  ]}
                />
                <ModernSelect 
                  value={tableYear}
                  onChange={v => setTableYear(Number(v))}
                  options={years.map(y => ({ value: y, label: String(y) }))}
                />
              </div>
            </div>

            {tableLevel === 'barangay' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {DATA.municipalities.map(m => (
                  <Pill key={m} active={tableMuni === m} onClick={() => setTableMuni(m)}>{m}</Pill>
                ))}
              </div>
            )}

            <div style={{ overflowY: 'auto', flex: 1, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', textAlign: 'left', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>{tableLevel === 'province' ? 'Province' : tableLevel === 'municipality' ? 'Municipality' : 'Barangay'} {getSortIcon('name')}</div>
                    </th>
                    <th onClick={() => handleSort('total_population')} style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>Total Population {getSortIcon('total_population')}</div>
                    </th>
                    <th onClick={() => handleSort('hh_population')} style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>Household Population {getSortIcon('hh_population')}</div>
                    </th>
                    <th onClick={() => handleSort('num_households')} style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>Households {getSortIcon('num_households')}</div>
                    </th>
                    <th onClick={() => handleSort('avg_size')} style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>Avg. HH Size {getSortIcon('avg_size')}</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: COLORS.creamDim }}>No data available for this selection.</td>
                    </tr>
                  ) : tableData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, fontWeight: 500 }}>{row.name}</td>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, textAlign: 'right' }}>{fmt(row.total_population)}</td>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, textAlign: 'right' }}>{row.hh_population != null ? fmt(row.hh_population) : '—'}</td>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, textAlign: 'right' }}>{row.num_households != null ? fmt(row.num_households) : '—'}</td>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, textAlign: 'right' }}>{row.num_households && (row.hh_population || row.total_population) ? ((row.hh_population || row.total_population) / row.num_households).toFixed(2) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

    </div>
    </>
  );
}
