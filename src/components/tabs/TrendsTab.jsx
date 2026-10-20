import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { ArrowRightLeft, Sparkles } from 'lucide-react';
import { COLORS, MUNI_COLORS, fmt, fmtCompact, pctChange, growthRate } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle, ModernSelect } from '../common/CommonUI';
import CustomTooltip from '../common/CustomTooltip';

export default function TrendsTab({ selectedMunis, setSelectedMunis }) {
  const [showProjection, setShowProjection] = useState(false);
  const [compareLguA, setCompareLguA] = useState('City of Tabuk');
  const [compareLguB, setCompareLguB] = useState('Pinukpuk');

  const optionsLguA = useMemo(() => (
    DATA.municipalities
      .filter(m => m !== compareLguB)
      .map(m => ({ value: m, label: m }))
  ), [compareLguB]);

  const optionsLguB = useMemo(() => (
    DATA.municipalities
      .filter(m => m !== compareLguA)
      .map(m => ({ value: m, label: m }))
  ), [compareLguA]);

  const handleSelectA = (val) => {
    if (val === compareLguB) return;
    setCompareLguA(val);
  };

  const handleSelectB = (val) => {
    if (val === compareLguA) return;
    setCompareLguB(val);
  };

  const handleSwapLgus = () => {
    setCompareLguA(compareLguB);
    setCompareLguB(compareLguA);
  };

  const trendChartData = useMemo(() => {
    const years = showProjection
      ? [2010, 2015, 2020, 2024, 2026, 2028, 2030]
      : [2010, 2015, 2020, 2024];

    return years.map(y => {
      const row = { year: y };
      selectedMunis.forEach(m => {
        if (y <= 2024) {
          const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
          row[m] = rec ? rec.total_population : null;
        } else {
          // Geometric projection based on 2020–2024 CAGR
          const rec20 = DATA.municipality_trend.find(d => d.year === 2020 && d.municipality === m);
          const rec24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === m);
          if (rec20 && rec24) {
            const annualRate = (growthRate(rec20.total_population, rec24.total_population, 4) / 100);
            const dt = y - 2024;
            row[m] = Math.round(rec24.total_population * Math.pow(1 + annualRate, dt));
          }
        }
      });
      return row;
    });
  }, [selectedMunis, showProjection]);
  const headToHead = useMemo(() => {
    if (compareLguA === compareLguB) return null;
    const y24A = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === compareLguA);
    const y24B = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === compareLguB);
    const y10A = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === compareLguA);
    const y10B = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === compareLguB);

    if (!y24A || !y24B) return null;

    const hhSizeA = y24A.num_households ? ((y24A.hh_population || y24A.total_population) / y24A.num_households).toFixed(2) : '—';
    const hhSizeB = y24B.num_households ? ((y24B.hh_population || y24B.total_population) / y24B.num_households).toFixed(2) : '—';

    const growth14A = y10A ? pctChange(y10A.total_population, y24A.total_population) : '0';
    const growth14B = y10B ? pctChange(y10B.total_population, y24B.total_population) : '0';

    return {
      a: {
        name: compareLguA,
        pop2024: y24A.total_population,
        numHh: y24A.num_households,
        hhSize: hhSizeA,
        growth14: growth14A
      },
      b: {
        name: compareLguB,
        pop2024: y24B.total_population,
        numHh: y24B.num_households,
        hhSize: hhSizeB,
        growth14: growth14B
      }
    };
  }, [compareLguA, compareLguB]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      {/* 1. Multi-LGU Trend Line Chart */}
      <Panel glow style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div>
            <SectionTitle
              badge="Multi-LGU Comparison"
              note="Compare population growth trajectories across selected municipalities from 2010 CPH to 2024 POPCEN."
            >
              Population Growth Trajectory
            </SectionTitle>
          </div>

          {/* Quick Selection Presets & Projection Switch */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowProjection(!showProjection)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 600,
                border: `1px solid ${showProjection ? COLORS.emerald : COLORS.border}`,
                background: showProjection ? COLORS.emeraldSoft : 'rgba(255, 255, 255, 0.04)',
                color: showProjection ? COLORS.emerald : COLORS.creamDim,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={12} />
              <span>{showProjection ? 'Projection (2025–2030) ON' : 'Show 2025–2030 Projection'}</span>
            </button>

            <span style={{ fontSize: 11.5, color: COLORS.creamDim, fontWeight: 600 }}>Presets:</span>
            <button
              onClick={() => setSelectedMunis([...DATA.municipalities])}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.cream,
                cursor: 'pointer'
              }}
            >
              All (8)
            </button>
            <button
              onClick={() => setSelectedMunis(['City of Tabuk', 'Pinukpuk', 'Rizal'])}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.cream,
                cursor: 'pointer'
              }}
            >
              Top 3
            </button>
            <button
              onClick={() => setSelectedMunis(['City of Tabuk'])}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.creamDim,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Municipality Selector Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {DATA.municipalities.map((m, i) => {
            const active = selectedMunis.includes(m);
            const color = MUNI_COLORS[i % MUNI_COLORS.length];
            return (
              <button
                key={m}
                onClick={() => {
                  setSelectedMunis(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
                }}
                style={{
                  padding: '5px 11px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${active ? color : COLORS.border}`,
                  background: active ? `rgba(${color === '#06b6d4' ? '6,182,212' : '139,92,246'}, 0.2)` : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#fff' : COLORS.creamDim,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                {m}
              </button>
            );
          })}
        </div>

        <div className="chart-box-container" style={{ width: '100%', height: 350, minHeight: 320 }}>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={trendChartData} margin={{ left: 0, right: 15, top: 15, bottom: 5 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                stroke={COLORS.creamDim}
                tick={{ fontSize: 11.5 }}
                ticks={showProjection ? [2010, 2015, 2020, 2024, 2026, 2028, 2030] : [2010, 2015, 2020, 2024]}
              />
              <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim, paddingTop: 6 }} />
              {selectedMunis.map((m) => {
                const color = MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length];
                return (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    name={m}
                    stroke={color}
                    strokeWidth={2.6}
                    strokeDasharray={showProjection ? '4 4' : undefined}
                    connectNulls
                    dot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6.5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                  >
                    {selectedMunis.length === 1 && (
                      <LabelList dataKey={m} position="top" formatter={fmtCompact} fontSize={10.5} fill={color} fontWeight={700} />
                    )}
                  </Line>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showProjection && (
          <div style={{ fontSize: 11, color: COLORS.creamDim, marginTop: 8, fontStyle: 'italic', textAlign: 'right' }}>
            * 2026–2030 values represent geometric population forecasting using 2020–2024 annualized CAGRs.
          </div>
        )}
      </Panel>

      {/* 2. Head-to-Head Comparison Matrix */}
      {headToHead && (
        <Panel glow style={{ position: 'relative', zIndex: 30, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(139, 92, 246, 0.05)), rgba(17, 24, 39, 0.75)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <SectionTitle
              badge="Side-by-Side Comparison"
              note="Direct head-to-head demographic benchmark between any two local government units."
            >
              LGU Head-to-Head Comparison
            </SectionTitle>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <ModernSelect
                value={compareLguA}
                options={optionsLguA}
                onChange={handleSelectA}
                width={160}
              />
              <button
                type="button"
                onClick={handleSwapLgus}
                title="Swap LGUs"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: '7px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: COLORS.cyan,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.borderColor = COLORS.cyan;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = COLORS.border;
                }}
              >
                <ArrowRightLeft size={16} style={{ flexShrink: 0 }} />
              </button>
              <ModernSelect
                value={compareLguB}
                options={optionsLguB}
                onChange={handleSelectB}
                width={160}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12
          }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>2024 Population</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.cyan, fontWeight: 600 }}>{headToHead.a.name}:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.cream }}>{fmt(headToHead.a.pop2024)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: COLORS.purple, fontWeight: 600 }}>{headToHead.b.name}:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.cream }}>{fmt(headToHead.b.pop2024)}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Avg. Household Size</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.cyan, fontWeight: 600 }}>{headToHead.a.name}:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.pink }}>{headToHead.a.hhSize}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: COLORS.purple, fontWeight: 600 }}>{headToHead.b.name}:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.pink }}>{headToHead.b.hhSize}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>14-Yr Growth (2010–24)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: COLORS.cyan, fontWeight: 600 }}>{headToHead.a.name}:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.emerald }}>+{headToHead.a.growth14}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: COLORS.purple, fontWeight: 600 }}>{headToHead.b.name}:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.emerald }}>+{headToHead.b.growth14}%</span>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* 3. Total Percentage Growth (2010 to 2024) */}
      <Panel style={{ display: 'flex', flexDirection: 'column' }}>
        <SectionTitle
          badge="2010 CPH → 2024 POPCEN"
          note="Total cumulative growth percentage across 14 years, ranked by highest expansion."
        >
          14-Year Cumulative Population Growth Rate (%)
        </SectionTitle>

        <div className="chart-box-container" style={{ width: '100%', height: 280, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={DATA.municipalities.map(m => {
                const y10 = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === m);
                const y24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === m);
                return {
                  municipality: m,
                  growth: +pctChange(y10.total_population, y24.total_population)
                };
              }).sort((a, b) => b.growth - a.growth)}
              margin={{ left: 0, right: 15, top: 15, bottom: 20 }}
            >
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={45} />
              <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} unit="%" width={45} />
              <Tooltip content={<CustomTooltip suffix="%" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="growth" name="Growth Rate" radius={[5, 5, 0, 0]}>
                {DATA.municipalities.map((_, i) => (
                  <Cell key={i} fill={COLORS.purple} />
                ))}
                <LabelList dataKey="growth" position="top" formatter={v => `+${v}%`} fill={COLORS.cyan} fontSize={10.5} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
