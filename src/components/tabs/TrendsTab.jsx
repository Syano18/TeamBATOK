import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { ArrowRightLeft, Info } from 'lucide-react';
import { COLORS, MUNI_COLORS, fmt, fmtCompact, pctChange } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle, ModernSelect } from '../common/CommonUI';
import CustomTooltip from '../common/CustomTooltip';

function TrajectoryLegend({ payload, selectedCount }) {
  if (!payload || !payload.length) return null;

  if (selectedCount <= 1) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        width: '100%'
      }}>
        {payload.map((entry, index) => (
          <div
            key={`legend-item-${index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: COLORS.creamDim,
              fontSize: 12,
              fontWeight: 500
            }}
          >
            <span style={{ width: 14, height: 3, background: entry.color, borderRadius: 2 }} />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="trajectory-legend-wrapper">
      <div className="trajectory-legend-spacer" aria-hidden="true" />

      <div className="trajectory-legend-items">
        {payload.map((entry, index) => (
          <div
            key={`legend-item-${index}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: COLORS.creamDim,
              fontSize: 12,
              fontWeight: 500
            }}
          >
            <span style={{ width: 14, height: 3, background: entry.color, borderRadius: 2 }} />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>

      <div className="trajectory-legend-note-container">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          color: COLORS.creamSub,
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          padding: '2px 8px',
          borderRadius: 6
        }}>
          <Info size={12} style={{ color: COLORS.cyan, flexShrink: 0 }} />
          <span>
            <strong style={{ color: COLORS.cyan }}>Note:</strong> Labels hidden for clarity • <em>Hover to view counts</em>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TrendsTab({ selectedMunis, setSelectedMunis }) {
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
    const years = [2010, 2015, 2020, 2024];

    return years.map(y => {
      const row = { year: y };
      selectedMunis.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        row[m] = rec ? rec.total_population : null;
      });
      return row;
    });
  }, [selectedMunis]);

  const growthChartData = useMemo(() => {
    return DATA.municipalities.map(m => {
      const y10 = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === m);
      const y24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === m);
      const color = MUNI_COLORS[DATA.municipalities.indexOf(m) % MUNI_COLORS.length];
      return {
        municipality: m,
        growth: +pctChange(y10.total_population, y24.total_population),
        color
      };
    }).sort((a, b) => b.growth - a.growth);
  }, []);
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

          {/* Quick Selection Presets */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
              onClick={() => setSelectedMunis(['Tanudan', 'Pasil', 'Lubuagan'])}
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
              Bottom 3
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
                  background: active ? `${color}30` : 'rgba(255, 255, 255, 0.03)',
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

        <div className="chart-box-container" style={{ width: '100%', height: 360, minHeight: 330 }}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendChartData} margin={{ left: 0, right: 15, top: 15, bottom: 5 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                stroke={COLORS.creamDim}
                tick={{ fontSize: 11.5 }}
              />
              <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<TrajectoryLegend selectedCount={selectedMunis.length} />} />
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
              data={growthChartData}
              margin={{ left: 0, right: 15, top: 15, bottom: 20 }}
            >
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={45} />
              <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} unit="%" width={45} />
              <Tooltip content={<CustomTooltip suffix="%" />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="growth" name="Growth Rate" radius={[5, 5, 0, 0]}>
                {growthChartData.map((d, i) => (
                  <Cell key={d.municipality || i} fill={d.color} />
                ))}
                <LabelList dataKey="growth" position="top" formatter={v => (v > 0 ? `+${v}%` : `${v}%`)} fill={COLORS.cyan} fontSize={10.5} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
