import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie, Rectangle, ComposedChart, LabelList } from 'recharts';
import { Info, Users, Home, LayoutGrid, PieChart as PieChartIcon, TrendingUp, User, Map, ChevronDown, Database, ArrowUp, ArrowDown, ArrowUpDown, X, MessageSquare, Loader2 } from 'lucide-react';
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

function growthRate(a, b, t) {
  if (!a || !b || !t) return null;
  return ((Math.pow(b / a, 1 / t) - 1) * 100).toFixed(2);
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
  
  if (label === 2012.5 || label === 2017.5 || label === 2022) return null;
  
  let displayLabel = label;

  const male = payload.find(p => p.name === 'Male');
  const female = payload.find(p => p.name === 'Female');
  let sexRatio = null;
  if (male && female && Math.abs(female.value) > 0) {
    sexRatio = ((Math.abs(male.value) / Math.abs(female.value)) * 100).toFixed(1);
  }

  return (
    <div style={{ background: COLORS.panelAlt, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 14px', fontSize: 12.5 }}>
      <div style={{ color: COLORS.gold, fontWeight: 700, marginBottom: 4, letterSpacing: 0.3 }}>{displayLabel}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: COLORS.cream, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: p.color || p.fill }}>{p.name}</span>
          <span style={{ fontWeight: 600 }}>{fmt(p.value)}{suffix || ''}</span>
        </div>
      ))}
      {sexRatio && (
        <div style={{ color: COLORS.cream, display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${COLORS.border}` }}>
          <span>Sex Ratio</span>
          <span style={{ fontWeight: 600, color: COLORS.rust }}>{sexRatio}</span>
        </div>
      )}
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

const WrappedYAxisTick = ({ x, y, payload }) => {
  const text = payload.value || '';
  const parts = text.split(' (');
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill={COLORS.creamDim} fontSize={11.5}>
        {parts.length === 1 ? (
          <tspan x={-5} dy="0.32em">{parts[0]}</tspan>
        ) : (
          <>
            <tspan x={-5} dy="-0.2em">{parts[0]}</tspan>
            <tspan x={-5} dy="1.1em" fontSize={10} fill={COLORS.creamDim} opacity={0.7}>({parts[1]}</tspan>
          </>
        )}
      </text>
    </g>
  );
};

export default function KalingaDashboard() {
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    return localStorage.getItem('hide_psa_disclaimer') !== 'true';
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', contact: '', body: '', q1: 0, q2: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDisclaimer = () => {
    if (dontShowAgain) {
      localStorage.setItem('hide_psa_disclaimer', 'true');
    }
    setShowDisclaimer(false);
  };

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
    const rawYears = [2010, 2015, 2020, 2024];
    const data = [];
    for (let i = 0; i < rawYears.length; i++) {
      const y = rawYears[i];
      const row = { year: y };
      selectedMunis.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        row[m] = rec ? rec.total_population : null;
      });
      data.push(row);

      if (i < rawYears.length - 1) {
        const nextY = rawYears[i + 1];
        const midRow = { year: (y + nextY) / 2 };
        selectedMunis.forEach(m => {
          const rec1 = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
          const rec2 = DATA.municipality_trend.find(d => d.year === nextY && d.municipality === m);
          if (rec1 && rec2 && rec1.total_population && rec2.total_population) {
            midRow[m] = (rec1.total_population + rec2.total_population) / 2;
            const t = nextY - y;
            const rate = growthRate(rec1.total_population, rec2.total_population, t);
            midRow[`${m}_pct`] = rate > 0 ? `+${rate}%` : `${rate}%`;
          }
        });
        data.push(midRow);
      }
    }
    return data;
  }, [selectedMunis]);

  const pyramidData = useMemo(() => {
    const src = pyramidYear === 2024 ? null : DATA.age_pyramid[String(pyramidYear)];
    if (!src) return [];
    const ages = pyramidLevel === 'province' ? src.province : src.municipalities[pyramidLevel];
    if (!ages) return [];
    return DATA.age_groups.map(ag => {
      const groupData = ages[ag] || { total: 0, male: 0, female: 0 };
      return {
        age: ag,
        male: -(groupData.male || 0),
        female: groupData.female || 0
      };
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

  const overviewTrendData = useMemo(() => {
    const rawYears = [2010, 2015, 2020, 2024];
    const data = [];
    for (let i = 0; i < rawYears.length; i++) {
      const y = rawYears[i];
      const d = DATA.province_trend.find(pt => pt.year === y);
      data.push({
        ...d,
        hh_size: d.num_households ? +( (d.hh_population || d.total_population) / d.num_households ).toFixed(2) : null
      });

      if (i < rawYears.length - 1) {
        const nextY = rawYears[i + 1];
        const nextD = DATA.province_trend.find(pt => pt.year === nextY);
        if (d && nextD) {
           const midPop = (d.total_population + nextD.total_population) / 2;
           const midHhPop = (d.hh_population + nextD.hh_population) / 2;
           const midNumHh = (d.num_households + nextD.num_households) / 2;
           const t = nextY - y;
           
           const pop_rate = growthRate(d.total_population, nextD.total_population, t);
           const pop_pct = pop_rate > 0 ? `+${pop_rate}%` : `${pop_rate}%`;
           
           const hh_rate = growthRate(d.num_households, nextD.num_households, t);
           const hh_pct = hh_rate > 0 ? `+${hh_rate}%` : `${hh_rate}%`;
           
           data.push({
             year: (y + nextY) / 2,
             total_population: midPop,
             hh_population: midHhPop,
             num_households: midNumHh,
             pop_pct: pop_pct,
             hh_pct: hh_pct,
             hh_size: +( (midHhPop || midPop) / midNumHh ).toFixed(2)
           });
        }
      }
    }
    return data;
  }, []);

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
    setExplorerBgy(null);
  }, [explorerBarangays]);

  const explorerBgyTrend = useMemo(() => {
    if (!explorerBgy) return [];
    const t = DATA.barangay_trend[explorerMuni]?.[explorerBgy];
    if (!t) return [];
    const sorted = [...t].sort((a,b) => a.year - b.year);
    const data = [];
    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i];
      data.push({
        ...d,
        hh_size: d.num_households ? +( (d.hh_population || d.total_population) / d.num_households ).toFixed(2) : null,
        hh_size_actual: d.num_households ? +( (d.hh_population || d.total_population) / d.num_households ).toFixed(2) : null
      });

      if (i < sorted.length - 1) {
        const nextD = sorted[i + 1];
        if (d && nextD) {
           const midPop = (d.total_population + nextD.total_population) / 2;
           const midHhPop = (d.hh_population + nextD.hh_population) / 2;
           const midNumHh = (d.num_households + nextD.num_households) / 2;
           const t = nextD.year - d.year;
           
           const pop_rate = growthRate(d.total_population, nextD.total_population, t);
           const pop_pct = pop_rate > 0 ? `+${pop_rate}%` : `${pop_rate}%`;
           
           const hh_rate = growthRate(d.num_households, nextD.num_households, t);
           const hh_pct = hh_rate > 0 ? `+${hh_rate}%` : `${hh_rate}%`;
           
           data.push({
             year: (d.year + nextD.year) / 2,
             total_population: midPop,
             hh_population: midHhPop,
             num_households: midNumHh,
             pop_pct: pop_pct,
             hh_pct: hh_pct,
             hh_size: midNumHh ? +( (midHhPop || midPop) / midNumHh ).toFixed(2) : null
           });
        }
      }
    }
    return data;
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
    <div className="dashboard-wrapper" style={{
      fontFamily: "'Inter', -apple-system, sans-serif", background: COLORS.bg, height: '100dvh',
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
        
        .mobile-nav-hint { display: none; }
        .mobile-only-text { display: none; }
        .desktop-only-text { display: inline; }
        @media (max-width: 900px) {
          .mobile-only-text { display: inline; }
          .desktop-only-text { display: none; }
          .mobile-nav-hint { display: block; width: 100%; font-size: 11px; color: ${COLORS.creamDim}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 4px; margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.1); }
          .dashboard-wrapper { overflow-y: auto !important; overflow-x: hidden; padding: 14px 16px !important; }
          .header-logos { order: -1; justify-content: center !important; width: 100%; }
          .tabs-container { justify-content: center; }
          .muni-logos { justify-content: center; margin-left: 0 !important; width: 100%; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 4px; }
          .controls-container { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .controls-divider { display: none !important; }
          .panel-hover { padding: 14px 14px !important; }
          .stat-card { 
            padding: 14px 16px !important; 
            flex: 1 1 calc(50% - 7px) !important; 
            max-width: calc(50% - 7px) !important; 
            min-width: 130px !important;
          }
          .info-popup {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            width: 90vw !important;
            max-width: 380px !important;
            z-index: 1000 !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8) !important;
          }
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
        
        .review-button {
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .review-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.6);
          filter: brightness(1.1);
        }
        
        .review-tooltip {
          position: absolute;
          right: 100%;
          top: 50%;
          margin-right: 14px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translateY(-50%) translateX(10px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .review-button:hover .review-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }
        
        .rating-btn {
          transition: all 0.2s ease;
        }
        .rating-btn:hover {
          transform: translateY(-2px);
          background: var(--highlight-hover-bg) !important;
          border-color: var(--highlight-color) !important;
        }
        .rating-btn:hover .emoji {
          transform: scale(1.3);
        }
        .emoji {
          display: inline-block;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20, flex: 'none', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          
          <div className="header-text" style={{ flex: '1 1 auto', minWidth: 320, position: 'relative' }}>
            <div style={{ color: '#f43f5e', fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
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
                  <div className="animate-enter info-popup" style={{
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
                      <br /><br />
                      <strong>Data Source:</strong> <a href="https://psada.psa.gov.ph/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust, textDecoration: 'none' }}>https://psada.psa.gov.ph/</a><br />
                      <strong>Website:</strong> <a href="https://rssocar.psa.gov.ph/kalinga" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust, textDecoration: 'none' }}>rssocar.psa.gov.ph/kalinga</a><br />
                      <strong>Follow us on Facebook:</strong> <a href="https://www.facebook.com/PSACARKalinga/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust, textDecoration: 'none' }}>PSA CAR Kalinga</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ color: COLORS.creamDim, fontSize: 14, marginTop: 6 }}>
              1 City and 7 Municipalities · 2010 CPH – 2024 POPCEN
            </div>
          </div>
          <div className="header-logos" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', flex: '2 1 auto' }}>
            <img src="/PSA.png" alt="Philippine Statistics Authority Logo" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
            <img src="/Bagong.png" alt="Bagong Pilipinas Logo" style={{ height: 85, width: 'auto', objectFit: 'contain' }} />
            <img src="/Kalinga.png" alt="Province of Kalinga Logo" title="Province of Kalinga" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
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
      <div className="tabs-container" style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 14, flex: 'none' }}>
        <div className="mobile-nav-hint">Navigation Menu</div>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`tab-button ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 15px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${tab === t.id ? COLORS.rust : COLORS.border}`, background: tab === t.id ? COLORS.rust : 'transparent',
              color: tab === t.id ? '#fff' : COLORS.creamDim }}>
              {Icon && <Icon size={16} />}
              {t.label}
            </button>
          );
        })}
        <div className="muni-logos" style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
          {['Balbalan', 'Lubuagan', 'Pasil', 'Pinukpuk', 'Rizal', 'Tabuk', 'Tanudan', 'Tinglayan'].map(name => (
            <img 
              key={name} 
              src={`/${name}.png`} 
              alt={`${name} Logo`} 
              style={{ 
                height: 32, 
                width: 'auto', 
                objectFit: 'contain'
              }} 
              title={name === 'Tabuk' ? 'City of Tabuk' : `Municipality of ${name}`}
            />
          ))}
        </div>
      </div>


      {tab === 'overview' && (
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Province-wide population and household growth across the four most recent census years. Trendline percentages show annualized growth rate.">Province-Wide Population & Households</SectionTitle>
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
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} ticks={[2010, 2015, 2020, 2024]} />
                <YAxis yAxisId="left" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={65} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                <Area yAxisId="left" type="monotone" dataKey="total_population" name="Total Population" stroke={COLORS.rust} strokeWidth={2.5} fill="url(#popGrad)" dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={COLORS.rust} /> : <circle key={`dot-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" />} activeDot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={`active-${p.index}`} cx={p.cx} cy={p.cy} r={6} fill={COLORS.rust} stroke="#fff" strokeWidth={2} /> : <circle key={`active-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" stroke="none" />}>
                  <LabelList dataKey="pop_pct" position="bottom" offset={10} fill={COLORS.rust} fontSize={12} fontWeight={600} />
                </Area>
                <Area yAxisId="left" type="monotone" dataKey="num_households" name="Number of Households" stroke={COLORS.male} strokeWidth={2.5} fillOpacity={0} strokeDasharray="5 5" dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={COLORS.male} /> : <circle key={`dot-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" />} activeDot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={`active-${p.index}`} cx={p.cx} cy={p.cy} r={6} fill={COLORS.male} stroke="#fff" strokeWidth={2} /> : <circle key={`active-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" stroke="none" />}>
                  <LabelList dataKey="hh_pct" position="bottom" offset={10} fill={COLORS.male} fontSize={12} fontWeight={600} />
                </Area>
              </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="2024 POPCEN — ranked by total population">Population by City/Municipality</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={muniPop2024} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} tickFormatter={fmtCompact} />
                <YAxis type="category" dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} width={95} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                <Bar dataKey="total_population" name="Total Population" fill={COLORS.rust} radius={[0, 4, 4, 0]} />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'trends' && (
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Click city/municipalities to compare their population trajectories, 2010 CPH – 2024 POPCEN. Trendline percentages show annualized growth rate.">Total Population Trends by City/Municipality</SectionTitle>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {DATA.municipalities.map(m => (
                <Pill key={m} active={selectedMunis.includes(m)} onClick={() => {
                  setSelectedMunis(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
                }}>{m}</Pill>
              ))}
            </div>
            <div style={{ flex: 1 , minHeight: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} ticks={[2010, 2015, 2020, 2024]} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={65} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                {selectedMunis.map((m, i) => (
                  <Line key={m} type="monotone" dataKey={m} stroke={MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length]} strokeWidth={2.5} connectNulls dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length]} /> : <circle key={`dot-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" />} activeDot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={`active-${p.index}`} cx={p.cx} cy={p.cy} r={6} fill={MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length]} stroke="#fff" strokeWidth={2} /> : <circle key={`active-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" stroke="none" />}>
                    {selectedMunis.length === 1 && (
                      <LabelList dataKey={`${m}_pct`} position="bottom" offset={8} fontSize={11} fill={MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length]} />
                    )}
                  </Line>
                ))}
              </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Total population change from 2010 CPH to 2024 POPCEN, by city/municipality">Total Population Growth</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA.municipalities.map(m => {
                const y10 = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === m);
                const y24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === m);
                return { municipality: m, growth: +pctChange(y10.total_population, y24.total_population) };
              }).sort((a,b) => b.growth - a.growth)} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} unit="%" width={55} />
                <Tooltip content={<CustomTooltip suffix="%" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="growth" name="Growth" radius={[4, 4, 0, 0]}>
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
          <div className="controls-container" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[2010, 2015, 2020].map(y => (
                <Pill key={y} active={pyramidYear === y} onClick={() => setPyramidYear(y)}>{y}</Pill>
              ))}
            </div>
            <div className="controls-divider" style={{ width: 1, height: 22, background: COLORS.border }} />
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
              <SectionTitle note="Age and sex distribution by 5-year age groups">Population Pyramid</SectionTitle>
              <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pyramidData} layout="vertical" stackOffset="sign" barCategoryGap="15%" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={v => fmtCompact(Math.abs(v))} />
                <YAxis type="category" dataKey="age" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} width={70} />
                <Tooltip content={({active, payload, label}) => {
                  if (!active || !payload || !payload.length) return null;
                  
                  const male = payload.find(p => p.name === 'Male');
                  const female = payload.find(p => p.name === 'Female');
                  let sexRatio = null;
                  if (male && female && Math.abs(female.value) > 0) {
                    sexRatio = ((Math.abs(male.value) / Math.abs(female.value)) * 100).toFixed(1);
                  }

                  return (
                    <div style={{ background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '10px 14px', fontSize: 12.5 }}>
                      <div style={{ color: COLORS.gold, fontWeight: 700, marginBottom: 4 }}>Ages {label}</div>
                      {payload.map((p, i) => (
                        <div key={i} style={{ color: COLORS.cream, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                          <span style={{ color: p.color }}>{p.name}</span>
                          <span style={{ fontWeight: 600 }}>{fmt(Math.abs(p.value))}</span>
                        </div>
                      ))}
                      {sexRatio && (
                        <div style={{ color: COLORS.cream, display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${COLORS.border}` }}>
                          <span>Sex Ratio</span>
                          <span style={{ fontWeight: 600, color: COLORS.rust }}>{sexRatio}</span>
                        </div>
                      )}
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
            <SectionTitle note="Total male vs. female residents, by census year">Sex Ratio</SectionTitle>
            <div style={{ flex: 1, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pyramidLevel === 'province' ? DATA.province_trend.filter(d => d.male != null) : DATA.municipality_trend.filter(d => d.municipality === pyramidLevel && d.male != null)} margin={{ left: 5, right: 20, top: 35, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={65} />
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
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <SectionTitle note={`Total ${householdMetric === 'num_households' ? 'number of households' : 'household population'} per city/municipality, by census year`}>
                Households by City/Municipality
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
              <BarChart data={householdsChartData} barCategoryGap="5%" barGap={1} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={65} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim }} />
                {DATA.municipalities.map((m, i) => (
                  <Bar key={m} dataKey={m} name={m} fill={MUNI_COLORS[i % MUNI_COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <SectionTitle note="Household population ÷ number of households, by city/municipality">Average Household Size</SectionTitle>
            <div style={{ flex: 1 , minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={muniAvgSizeTrendData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
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
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
              <SectionTitle note="2024 POPCEN — select a city/municipality to view its barangays">
                Total Population by Barangay
              </SectionTitle>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: -6 }}>
                {DATA.municipalities.map(m => (
                  <Pill key={m} active={explorerMuni === m} onClick={() => {
                    setExplorerMuni(m);
                  }}>{m}</Pill>
                ))}
              </div>
            </div>
            
            <div style={{ flex: '1 1 0px', minHeight: 300, overflowY: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: 8, paddingRight: 10 }}>
              <div style={{ height: Math.max(300, explorerBarangays.length * 35) }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={explorerBarangays} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
                  onClick={(e) => { if (e && e.activeLabel) setExplorerBgy(e.activeLabel); }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} tickFormatter={fmtCompact} />
                  <YAxis type="category" dataKey="name" stroke={COLORS.creamDim} tick={<WrappedYAxisTick />} width={130} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="total_population" name="Total Population" radius={[0, 4, 4, 0]} cursor="pointer">
                    {explorerBarangays.map((b, i) => (
                      <Cell key={i} fill={b.name === explorerBgy ? COLORS.gold : COLORS.rust} />
                    ))}
                  </Bar>
                </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ color: COLORS.creamDim, fontSize: 12, marginTop: 10, flex: 'none' }}>
              <span className="desktop-only-text">Click</span><span className="mobile-only-text">Double tap</span> a bar to view a different barangay's trend.
            </div>
          </Panel>

          <Panel style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            {explorerBgy && explorerBgyTrend.length > 0 ? (
              <>
                <SectionTitle note={`${explorerBgy}, ${explorerMuni} — households and total population, 2010 CPH – 2024 POPCEN. Trendline percentages show annualized growth rate.`}>
                  Barangay Total Population & Households Trend
                </SectionTitle>
                <div style={{ flex: 1, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                <LineChart data={explorerBgyTrend} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 12.5 }} ticks={[2010, 2015, 2020, 2024]} />
                  <YAxis yAxisId="left" stroke={COLORS.creamDim} tick={{ fontSize: 12 }} tickFormatter={fmtCompact} width={65} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12.5, color: COLORS.creamDim }} />
                  <Line yAxisId="left" type="monotone" dataKey="total_population" name="Total Population" stroke={COLORS.rust} strokeWidth={2.5} connectNulls dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={COLORS.rust} /> : <circle key={`dot-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" />} activeDot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={`active-${p.index}`} cx={p.cx} cy={p.cy} r={6} fill={COLORS.rust} stroke="#fff" strokeWidth={2} /> : <circle key={`active-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" stroke="none" />}>
                    <LabelList dataKey="pop_pct" position="bottom" offset={8} fontSize={11} fill={COLORS.rust} />
                  </Line>
                  <Line yAxisId="left" type="monotone" dataKey="num_households" name="Households" stroke={COLORS.teal} strokeWidth={2.5} connectNulls dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={COLORS.teal} /> : <circle key={`dot-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" />} activeDot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? <circle key={`active-${p.index}`} cx={p.cx} cy={p.cy} r={6} fill={COLORS.teal} stroke="#fff" strokeWidth={2} /> : <circle key={`active-hidden-${p.index || p.cx}`} cx={p.cx} cy={p.cy} r={0} fill="none" stroke="none" />}>
                    <LabelList dataKey="hh_pct" position="bottom" offset={8} fontSize={11} fill={COLORS.teal} />
                  </Line>
                  </LineChart>
                </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: COLORS.creamDim, minHeight: 300 }}>
                <TrendingUp size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.cream, marginBottom: 8 }}>No Barangay Selected</div>
                <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
                  <span className="desktop-only-text">Click</span><span className="mobile-only-text">Double tap</span> a bar on the population chart to display its growth trend.
                </div>
              </div>
            )}
          </Panel>

        </div>
      )}

      {tab === 'tables' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <Panel style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 4, flex: 'none' }}>
              <SectionTitle note="Comprehensive census data across multiple geographic levels and years">
                Statistical Data Tables
              </SectionTitle>
              <div className="controls-container" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: COLORS.creamDim, fontSize: 12.5, marginBottom: 8, fontStyle: 'italic' }}>
                  Click a City/Municipality below to view its Barangays:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DATA.municipalities.map(m => (
                    <Pill key={m} active={tableMuni === m} onClick={() => setTableMuni(m)}>{m}</Pill>
                  ))}
                </div>
              </div>
            )}

            <div style={{ overflowY: 'auto', flex: 1, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', textAlign: 'left', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>{tableLevel === 'province' ? 'Province' : tableLevel === 'municipality' ? 'City/Municipality' : 'Barangay'} {getSortIcon('name')}</div>
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

      {showDisclaimer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
          {/* ... disclaimer modal body ... */}
          <div className="animate-enter" style={{
            background: COLORS.panelAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 30,
            maxWidth: 500,
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <button 
              onClick={closeDisclaimer}
              title="Close"
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: COLORS.creamDim, cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginTop: 0, color: COLORS.rust, fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Info size={24} />
              Data Source Disclaimer
            </h2>
            <p style={{ color: COLORS.cream, fontSize: 14, lineHeight: 1.6, marginTop: 16 }}>
              The demographic and household information presented in this dashboard is based on official census data from the <strong>Philippine Statistics Authority (PSA)</strong>, with the following reference dates:
            </p>
            <ul style={{ color: COLORS.creamDim, fontSize: 14, lineHeight: 1.6, marginTop: 8, paddingLeft: 24 }}>
              <li>2010 CPH (May 1, 2010)</li>
              <li>2015 POPCEN (August 1, 2015)</li>
              <li>2020 CPH (May 1, 2020)</li>
              <li>2024 POPCEN (July 1, 2024)</li>
            </ul>
            <p style={{ color: COLORS.creamDim, fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>
              <strong>Source:</strong> <a href="https://psada.psa.gov.ph/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust, textDecoration: 'none' }}>https://psada.psa.gov.ph/</a><br />
              <strong>Website:</strong> <a href="https://rssocar.psa.gov.ph/kalinga" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust, textDecoration: 'none' }}>rssocar.psa.gov.ph/kalinga</a><br />
              <strong>Follow us on Facebook:</strong> <a href="https://www.facebook.com/PSACARKalinga/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust, textDecoration: 'none' }}>PSA CAR Kalinga</a>
            </p>
            
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="checkbox" 
                id="dontShowAgain" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={{ cursor: 'pointer', width: 16, height: 16, accentColor: COLORS.rust }}
              />
              <label htmlFor="dontShowAgain" style={{ color: COLORS.creamDim, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
                Do not show this message again
              </label>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={closeDisclaimer}
                style={{
                  background: COLORS.rust,
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="animate-enter" style={{
            background: COLORS.panelAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 30,
            maxWidth: 450,
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => {
                setShowReviewModal(false);
                setReviewForm({ name: '', email: '', contact: '', body: '', q1: 0, q2: 0 });
              }}
              title="Close"
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: COLORS.creamDim, cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ marginTop: 0, color: '#10b981', fontSize: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={24} />
              Leave a Review
            </h2>
            <p style={{ color: COLORS.creamDim, fontSize: 14, marginBottom: 24 }}>
              We'd love to hear your thoughts! Please fill out the form below.
            </p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (reviewForm.q1 === 0 || reviewForm.q2 === 0) {
                alert("Please provide a rating for both questions before submitting.");
                return;
              }
              
              setIsSubmitting(true);
              try {
                const response = await fetch('/api/reviews', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(reviewForm)
                });
                
                if (response.ok) {
                  setShowSuccessModal(true);
                  setShowReviewModal(false);
                  setReviewForm({ name: '', email: '', contact: '', body: '', q1: 0, q2: 0 });
                } else {
                  const errData = await response.json();
                  alert("Failed to submit review: " + (errData.error || "Unknown error"));
                }
              } catch (error) {
                console.error("Submission error:", error);
                alert("Failed to connect to the server. Please ensure the backend is running.");
              } finally {
                setIsSubmitting(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <div>
                <label style={{ display: 'block', color: COLORS.cream, fontSize: 13, marginBottom: 6 }}>Full Name</label>
                <input 
                  type="text" 
                  required
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, background: 'rgba(0,0,0,0.2)', border: `1px solid ${COLORS.border}`, color: COLORS.cream, outline: 'none' }} 
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: COLORS.cream, fontSize: 13, marginBottom: 6 }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({...reviewForm, email: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, background: 'rgba(0,0,0,0.2)', border: `1px solid ${COLORS.border}`, color: COLORS.cream, outline: 'none' }} 
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label style={{ display: 'block', color: COLORS.cream, fontSize: 13, marginBottom: 6 }}>Contact No.</label>
                <input 
                  type="text" 
                  value={reviewForm.contact}
                  onChange={(e) => setReviewForm({...reviewForm, contact: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, background: 'rgba(0,0,0,0.2)', border: `1px solid ${COLORS.border}`, color: COLORS.cream, outline: 'none' }} 
                  placeholder="Enter your contact number"
                />
              </div>

              {/* Question 1 */}
              <div>
                <label style={{ display: 'block', color: COLORS.cream, fontSize: 13, marginBottom: 4 }}>
                  <strong>Question 1: Usability & Performance</strong>
                </label>
                <div style={{ color: COLORS.creamDim, fontSize: 12, marginBottom: 10 }}>
                  "How easy and responsive was it to navigate and use the interactive dashboard?"
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {[
                    { val: 1, em: '😡', label: 'Very Difficult' },
                    { val: 2, em: '🙁', label: 'Difficult' },
                    { val: 3, em: '😐', label: 'Neutral' },
                    { val: 4, em: '🙂', label: 'Easy' },
                    { val: 5, em: '🤩', label: 'Very Easy' }
                  ].map(rating => {
                    const c = rating.val <= 2 ? '#ef4444' : rating.val === 3 ? '#f59e0b' : '#10b981';
                    const bg = rating.val <= 2 ? 'rgba(239, 68, 68, 0.2)' : rating.val === 3 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                    const hbg = rating.val <= 2 ? 'rgba(239, 68, 68, 0.15)' : rating.val === 3 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                    return (
                    <button
                      key={rating.val}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, q1: rating.val})}
                      title={rating.label}
                      className="rating-btn"
                      style={{
                        '--highlight-color': c,
                        '--highlight-bg': bg,
                        '--highlight-hover-bg': hbg,
                        flex: 1,
                        background: reviewForm.q1 === rating.val ? bg : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${reviewForm.q1 === rating.val ? c : COLORS.border}`,
                        borderRadius: 8,
                        padding: '10px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <span className="emoji" style={{ fontSize: 24, opacity: reviewForm.q1 === rating.val || reviewForm.q1 === 0 ? 1 : 0.6 }}>{rating.em}</span>
                      <span style={{ fontSize: 10, color: reviewForm.q1 === rating.val ? c : COLORS.creamDim, textAlign: 'center', lineHeight: 1.2 }}>{rating.val}</span>
                    </button>
                  )})}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <label style={{ display: 'block', color: COLORS.cream, fontSize: 13, marginBottom: 4 }}>
                  <strong>Question 2: Value & Clarity</strong>
                </label>
                <div style={{ color: COLORS.creamDim, fontSize: 12, marginBottom: 10 }}>
                  "How satisfied are you with the relevance, accuracy, and clarity of the dashboard's data and content?"
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  {[
                    { val: 1, em: '😡', label: 'Very Dissatisfied' },
                    { val: 2, em: '🙁', label: 'Dissatisfied' },
                    { val: 3, em: '😐', label: 'Neutral' },
                    { val: 4, em: '🙂', label: 'Satisfied' },
                    { val: 5, em: '🤩', label: 'Very Satisfied' }
                  ].map(rating => {
                    const c = rating.val <= 2 ? '#ef4444' : rating.val === 3 ? '#f59e0b' : '#10b981';
                    const bg = rating.val <= 2 ? 'rgba(239, 68, 68, 0.2)' : rating.val === 3 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)';
                    const hbg = rating.val <= 2 ? 'rgba(239, 68, 68, 0.15)' : rating.val === 3 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                    return (
                    <button
                      key={rating.val}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, q2: rating.val})}
                      title={rating.label}
                      className="rating-btn"
                      style={{
                        '--highlight-color': c,
                        '--highlight-bg': bg,
                        '--highlight-hover-bg': hbg,
                        flex: 1,
                        background: reviewForm.q2 === rating.val ? bg : 'rgba(0,0,0,0.2)',
                        border: `1px solid ${reviewForm.q2 === rating.val ? c : COLORS.border}`,
                        borderRadius: 8,
                        padding: '10px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                    >
                      <span className="emoji" style={{ fontSize: 24, opacity: reviewForm.q2 === rating.val || reviewForm.q2 === 0 ? 1 : 0.6 }}>{rating.em}</span>
                      <span style={{ fontSize: 10, color: reviewForm.q2 === rating.val ? c : COLORS.creamDim, textAlign: 'center', lineHeight: 1.2 }}>{rating.val}</span>
                    </button>
                  )})}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: COLORS.cream, fontSize: 13, marginBottom: 6 }}>Your Review</label>
                <textarea 
                  required
                  rows={4}
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm({...reviewForm, body: e.target.value})}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 6, background: 'rgba(0,0,0,0.2)', border: `1px solid ${COLORS.border}`, color: COLORS.cream, outline: 'none', resize: 'vertical' }} 
                  placeholder="Tell us what you think..."
                />
              </div>

              <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input 
                  type="checkbox" 
                  id="privacyConsent"
                  required
                  style={{ marginTop: 4, cursor: 'pointer', width: 16, height: 16, accentColor: '#10b981', flexShrink: 0 }}
                />
                <label htmlFor="privacyConsent" style={{ color: COLORS.creamDim, fontSize: 12, lineHeight: 1.5, cursor: 'pointer' }}>
                  By submitting this form, I agree to the collection and processing of my personal information in compliance with the <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>. The information provided will be used solely for the purpose of improving our dashboard and addressing your feedback.
                </label>
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({ name: '', email: '', contact: '', body: '', q1: 0, q2: 0 });
                  }}
                  style={{ background: 'transparent', color: COLORS.creamDim, border: 'none', padding: '10px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: isSubmitting ? '#6b7280' : '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isSubmitting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20
        }}>
          <div className="animate-enter" style={{
            background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 16,
            padding: '40px 30px', maxWidth: 400, width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative'
          }}>
            <div style={{ width: 64, height: 64, background: 'rgba(56, 189, 248, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#38bdf8' }}>
              <Loader2 size={32} style={{ animation: 'spin 1.5s linear infinite' }} />
            </div>
            <h2 style={{ marginTop: 0, color: COLORS.cream, fontSize: 24, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
              Sending Review
            </h2>
            <p style={{ color: COLORS.creamDim, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Please wait, sending review to Admin...
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20
        }}>
          <div className="animate-enter" style={{
            background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 16,
            padding: '40px 30px', maxWidth: 400, width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative'
          }}>
            <button 
              onClick={() => setShowSuccessModal(false)}
              title="Close"
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: COLORS.creamDim, cursor: 'pointer', padding: 4 }}
            >
              <X size={20} />
            </button>
            <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#10b981' }}>
              <MessageSquare size={32} />
            </div>
            <h2 style={{ marginTop: 0, color: COLORS.cream, fontSize: 24, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
              Review Sent!
            </h2>
            <p style={{ color: COLORS.creamDim, fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
              Thank you for providing your feedback and it means a lot to us ❤️
            </p>
            <button 
              onClick={() => setShowSuccessModal(false)}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Review Button */}
      <a 
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowReviewModal(true);
        }}
        className="review-button"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: '#10b981',
          color: '#fff',
          padding: 12,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          zIndex: 9000
        }}
      >
        <span className="review-tooltip">Please leave us a review</span>
        <MessageSquare size={18} />
      </a>

    </div>
    </>
  );
}
