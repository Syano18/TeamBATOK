import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { Search, X, TrendingUp, Map, MoveHorizontal } from 'lucide-react';
import { COLORS, fmtCompact, pctChange } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle, Pill, WrappedYAxisTick } from '../common/CommonUI';
import CustomTooltip from '../common/CustomTooltip';

export default function BarangaysTab({
  explorerMuni,
  setExplorerMuni,
  explorerBgy,
  setExplorerBgy
}) {
  const [explorerSearch, setExplorerSearch] = useState('');
  const [bgyFilter, setBgyFilter] = useState('all'); // 'all', 'top10', 'bottom10', 'fastest'

  // Filtered and sorted barangay list
  const explorerBarangays = useMemo(() => {
    let list = (DATA.barangay_2024[explorerMuni] || []).slice().sort((a, b) => b.total_population - a.total_population);

    if (explorerSearch.trim()) {
      list = list.filter(b => b.name.toLowerCase().includes(explorerSearch.toLowerCase()));
    }

    if (bgyFilter === 'top10') {
      return list.slice(0, 10);
    } else if (bgyFilter === 'bottom10') {
      return list.slice(-10).reverse();
    } else if (bgyFilter === 'fastest') {
      // Sort by growth between 2015 and 2024 if trend data available
      const bgyTrends = DATA.barangay_trend[explorerMuni] || {};
      return list.map(b => {
        const trend = bgyTrends[b.name];
        let growth = 0;
        if (trend && trend.length >= 2) {
          const first = trend[0];
          const last = trend[trend.length - 1];
          growth = +pctChange(first.total_population, last.total_population) || 0;
        }
        return { ...b, growthRate: growth };
      }).sort((a, b) => (b.growthRate || 0) - (a.growthRate || 0));
    }

    return list;
  }, [explorerMuni, explorerSearch, bgyFilter]);

  // Selected barangay historical trend
  const explorerBgyTrend = useMemo(() => {
    if (!explorerBgy) return [];
    const t = DATA.barangay_trend[explorerMuni]?.[explorerBgy];
    if (!t) return [];
    const sorted = [...t].sort((a, b) => a.year - b.year);
    const data = [];
    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i];
      data.push({
        ...d,
        hh_size: d.num_households ? +((d.hh_population || d.total_population) / d.num_households).toFixed(2) : null
      });

      if (i < sorted.length - 1) {
        const nextD = sorted[i + 1];
        if (d && nextD && d.total_population && nextD.total_population) {
          const midPop = (d.total_population + nextD.total_population) / 2;
          const midNumHh = d.num_households && nextD.num_households ? (d.num_households + nextD.num_households) / 2 : null;
          const tYears = nextD.year - d.year;
          const rate = ((Math.pow(nextD.total_population / d.total_population, 1 / tYears) - 1) * 100).toFixed(2);
          const pop_pct = rate > 0 ? `+${rate}%` : `${rate}%`;

          let hh_pct = null;
          if (d.num_households && nextD.num_households) {
            const hRate = ((Math.pow(nextD.num_households / d.num_households, 1 / tYears) - 1) * 100).toFixed(2);
            hh_pct = hRate > 0 ? `+${hRate}%` : `${hRate}%`;
          }

          data.push({
            year: (d.year + nextD.year) / 2,
            total_population: midPop,
            num_households: midNumHh,
            pop_pct: pop_pct,
            hh_pct: hh_pct,
            isMid: true
          });
        }
      }
    }
    return data;
  }, [explorerMuni, explorerBgy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      {/* Municipality Filter Pills Ribbon with Official Seals */}
      <div className="no-scrollbar" style={{
        display: 'flex',
        gap: 8,
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '10px 14px',
        borderRadius: 14,
        border: `1px solid ${COLORS.border}`,
        alignItems: 'center',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 11,
            color: COLORS.creamDim,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <Map size={13} style={{ color: COLORS.cyan }} />
            Select LGU:
          </span>
          <span className="swipe-hint-badge-inline">
            <MoveHorizontal size={11} className="swipe-hint-icon" />
            <span>Swipe</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {DATA.municipalities.map(m => {
            const isTabuk = m === 'City of Tabuk';
            const file = isTabuk ? 'Tabuk' : m;
            const bgyCount = DATA.barangay_2024[m]?.length || 0;
            const isActive = explorerMuni === m;
            return (
              <Pill
                key={m}
                active={isActive}
                onClick={() => {
                  setExplorerMuni(m);
                  setExplorerBgy(null);
                }}
                count={bgyCount}
              >
                <img
                  src={`/${file}.png`}
                  alt={`${m} Seal`}
                  style={{
                    height: 18,
                    width: 'auto',
                    objectFit: 'contain',
                    filter: isActive ? 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))' : 'grayscale(15%)',
                    transition: 'filter 0.2s ease'
                  }}
                />
                <span>{m}</span>
              </Pill>
            );
          })}
        </div>
      </div>

      <div className="panel-grid-two-col">
        {/* Barangay List Bar Chart & Search */}
        <Panel glow style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <SectionTitle
              badge={`${explorerBarangays.length} Barangays`}
              note="2024 POPCEN total population. Click any bar to view historical census growth."
            >
              {explorerMuni} Barangays
            </SectionTitle>
            <div className="mobile-stack-full" style={{ position: 'relative', width: 180 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: COLORS.creamDim }} />
              <input
                type="text"
                placeholder="Search barangay..."
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 28px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  color: COLORS.cream,
                  fontSize: 12,
                  outline: 'none'
                }}
              />
              {explorerSearch && (
                <button
                  onClick={() => setExplorerSearch('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: COLORS.creamDim, cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <button
              onClick={() => setBgyFilter('all')}
              style={{
                padding: '3px 9px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                border: `1px solid ${bgyFilter === 'all' ? COLORS.cyan : COLORS.border}`,
                background: bgyFilter === 'all' ? COLORS.cyanSoft : 'rgba(255,255,255,0.02)',
                color: bgyFilter === 'all' ? '#fff' : COLORS.creamDim,
                cursor: 'pointer'
              }}
            >
              All Barangays
            </button>
            <button
              onClick={() => setBgyFilter('top10')}
              style={{
                padding: '3px 9px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                border: `1px solid ${bgyFilter === 'top10' ? COLORS.cyan : COLORS.border}`,
                background: bgyFilter === 'top10' ? COLORS.cyanSoft : 'rgba(255,255,255,0.02)',
                color: bgyFilter === 'top10' ? '#fff' : COLORS.creamDim,
                cursor: 'pointer'
              }}
            >
              Top 10 Populous
            </button>
            <button
              onClick={() => setBgyFilter('bottom10')}
              style={{
                padding: '3px 9px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                border: `1px solid ${bgyFilter === 'bottom10' ? COLORS.cyan : COLORS.border}`,
                background: bgyFilter === 'bottom10' ? COLORS.cyanSoft : 'rgba(255,255,255,0.02)',
                color: bgyFilter === 'bottom10' ? '#fff' : COLORS.creamDim,
                cursor: 'pointer'
              }}
            >
              Bottom 10 Populous
            </button>
            <button
              onClick={() => setBgyFilter('fastest')}
              style={{
                padding: '3px 9px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                border: `1px solid ${bgyFilter === 'fastest' ? COLORS.emerald : COLORS.border}`,
                background: bgyFilter === 'fastest' ? COLORS.emeraldSoft : 'rgba(255,255,255,0.02)',
                color: bgyFilter === 'fastest' ? COLORS.emerald : COLORS.creamDim,
                cursor: 'pointer'
              }}
            >
              Highest Expansion
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 340, maxHeight: 440, overflowY: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '8px 8px 8px 0', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ height: Math.max(300, explorerBarangays.length * 32) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={explorerBarangays}
                  layout="vertical"
                  margin={{ left: 5, right: 20, top: 5, bottom: 5 }}
                  onClick={(e) => { if (e && e.activeLabel) setExplorerBgy(e.activeLabel); }}
                >
                  <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 10.5 }} tickFormatter={fmtCompact} />
                  <YAxis type="category" dataKey="name" stroke={COLORS.creamDim} tick={<WrappedYAxisTick />} width={115} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="total_population" name="Total Population" radius={[0, 4, 4, 0]} cursor="pointer">
                    {explorerBarangays.map((b, i) => (
                      <Cell
                        key={i}
                        fill={b.name === explorerBgy ? COLORS.purple : COLORS.cyan}
                        stroke={b.name === explorerBgy ? '#fff' : 'none'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>

        {/* Barangay Detailed Growth Trend */}
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          {explorerBgy && explorerBgyTrend.length > 0 ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ padding: '2px 7px', borderRadius: 6, background: COLORS.purpleSoft, color: COLORS.purple, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>
                    Selected Barangay
                  </span>
                  <span style={{ fontSize: 11.5, color: COLORS.creamDim }}>{explorerMuni}</span>
                </div>
                <h3 style={{ color: COLORS.cream, fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, margin: '4px 0 2px' }}>
                  Barangay {explorerBgy}
                </h3>
                <div style={{ color: COLORS.creamDim, fontSize: 12 }}>
                  Census Progression (2010 CPH to 2024 POPCEN)
                </div>
              </div>

              <div className="chart-box-container" style={{ width: '100%', height: 330, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={explorerBgyTrend} margin={{ left: 0, right: 15, top: 15, bottom: 5 }}>
                    <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} ticks={[2010, 2015, 2020, 2024]} />
                    <YAxis yAxisId="left" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} width={50} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim, paddingTop: 6 }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_population"
                      name="Total Population"
                      stroke={COLORS.cyan}
                      strokeWidth={2.8}
                      connectNulls
                      dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? (
                        <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={COLORS.cyan} stroke="#fff" strokeWidth={1.5} />
                      ) : null}
                      activeDot={{ r: 6, fill: COLORS.cyan, stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="pop_pct" position="bottom" offset={8} fontSize={10.5} fill={COLORS.cyan} fontWeight={700} />
                    </Line>
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="num_households"
                      name="Households"
                      stroke={COLORS.pink}
                      strokeWidth={2.2}
                      connectNulls
                      dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? (
                        <circle key={p.index} cx={p.cx} cy={p.cy} r={3.5} fill={COLORS.pink} />
                      ) : null}
                      activeDot={{ r: 5.5, fill: COLORS.pink, stroke: '#fff', strokeWidth: 2 }}
                    >
                      <LabelList dataKey="hh_pct" position="bottom" offset={8} fontSize={10.5} fill={COLORS.pink} fontWeight={700} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: COLORS.creamDim, minHeight: 300 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <TrendingUp size={28} style={{ opacity: 0.4, color: COLORS.cyan }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.cream, marginBottom: 4 }}>No Barangay Selected</div>
              <div style={{ fontSize: 12.5, textAlign: 'center', maxWidth: 280, color: COLORS.creamDim, lineHeight: 1.4 }}>
                Click on any bar in the left chart to inspect historical population and household growth for that barangay.
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
