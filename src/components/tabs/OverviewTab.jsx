import React, { useMemo } from 'react';
import {
  ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { Sparkles } from 'lucide-react';
import { COLORS, fmt, fmtCompact, pctChange, growthRate } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle } from '../common/CommonUI';
import CustomTooltip from '../common/CustomTooltip';
import KalingaMap from '../map/KalingaMap';

export default function OverviewTab({ onNavigateToLgu }) {
  const latestProv = DATA.province_trend[DATA.province_trend.length - 1];

  // 2024 Municipality populations sorted with percentage share
  const muniPop2024 = useMemo(() => (
    DATA.municipality_trend
      .filter(d => d.year === 2024)
      .map(d => ({
        ...d,
        share: ((d.total_population / latestProv.total_population) * 100).toFixed(1)
      }))
      .sort((a, b) => b.total_population - a.total_population)
  ), [latestProv.total_population]);

  // Province trajectory with mid-points for growth rates
  const overviewTrendData = useMemo(() => {
    const rawYears = [2010, 2015, 2020, 2024];
    const data = [];
    for (let i = 0; i < rawYears.length; i++) {
      const y = rawYears[i];
      const d = DATA.province_trend.find(pt => pt.year === y);
      data.push({
        ...d,
        hh_size: d.num_households ? +((d.hh_population || d.total_population) / d.num_households).toFixed(2) : null
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
            hh_size: +((midHhPop || midPop) / midNumHh).toFixed(2)
          });
        }
      }
    }
    return data;
  }, []);

  // Compute Automated Key Insights
  const insights = useMemo(() => {
    const y24 = DATA.municipality_trend.filter(d => d.year === 2024);
    const y20 = DATA.municipality_trend.filter(d => d.year === 2020);
    const y10 = DATA.municipality_trend.filter(d => d.year === 2010);

    // Fastest growing LGU between 2020 and 2024
    let fastestGrowthLgu = null;
    let maxGrowth = -Infinity;
    y24.forEach(d24 => {
      const d20 = y20.find(m => m.municipality === d24.municipality);
      if (d20) {
        const rate = +growthRate(d20.total_population, d24.total_population, 4);
        if (rate > maxGrowth) {
          maxGrowth = rate;
          fastestGrowthLgu = d24.municipality;
        }
      }
    });

    // Smallest household size in 2024
    const smallestHhLgu = [...y24].sort((a, b) => {
      const sa = (a.hh_population || a.total_population) / a.num_households;
      const sb = (b.hh_population || b.total_population) / b.num_households;
      return sa - sb;
    })[0];
    const smallestHhSize = ((smallestHhLgu.hh_population || smallestHhLgu.total_population) / smallestHhLgu.num_households).toFixed(2);

    // Cumulative fastest growth since 2010
    const topLongTerm = [...y24].map(d => {
      const d10 = y10.find(m => m.municipality === d.municipality);
      return {
        muni: d.municipality,
        pct: +pctChange(d10.total_population, d.total_population)
      };
    }).sort((a, b) => b.pct - a.pct)[0];

    return {
      topMuni: muniPop2024[0],
      secondMuni: muniPop2024[1],
      fastestRecent: { muni: fastestGrowthLgu, rate: maxGrowth },
      smallestHh: { muni: smallestHhLgu.municipality, size: smallestHhSize },
      topLongTerm
    };
  }, [muniPop2024]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      {/* 1. Automated Key Insights Executive Banner */}
      <Panel glow style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%), rgba(17, 24, 39, 0.75)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} style={{ color: COLORS.cyan }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.cream, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Executive Demographic Insights & Highlights
          </span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: COLORS.cyanSoft, color: COLORS.cyan, fontWeight: 600 }}>
            Automated Analysis
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
          fontSize: 12.5,
          color: COLORS.creamDim,
          lineHeight: 1.5
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.cyan, fontWeight: 700, marginBottom: 2 }}>Urban Concentration</div>
            <strong>{insights.topMuni?.municipality}</strong> holds <strong>{insights.topMuni?.share}%</strong> of the entire provincial population ({fmt(insights.topMuni?.total_population)} residents).
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.emerald, fontWeight: 700, marginBottom: 2 }}>Recent Growth Leader</div>
            <strong>{insights.fastestRecent.muni}</strong> recorded the fastest annualized expansion between 2020–2024 at <strong>+{insights.fastestRecent.rate}% / year</strong>.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.purple, fontWeight: 700, marginBottom: 2 }}>Household Nuclearization</div>
            Provincial average household size dropped to <strong>4.25 persons</strong>; <strong>{insights.smallestHh.muni}</strong> has the most compact households at <strong>{insights.smallestHh.size}</strong>.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.pink, fontWeight: 700, marginBottom: 2 }}>14-Year Cumulative Expansion</div>
            <strong>{insights.topLongTerm.muni}</strong> experienced a remarkable <strong>+{insights.topLongTerm.pct}%</strong> population surge since the 2010 CPH census round.
          </div>
        </div>
      </Panel>

      {/* 2. Interactive Geographic Map of Kalinga */}
      <Panel glow>
        <SectionTitle
          badge="Provincial GIS Visualizer"
          note="Click or hover any municipality to inspect 2024 census indicators. Click 'Explore in Barangays' to dive into barangay analytics."
        >
          Geographic Demographic Distribution
        </SectionTitle>
        <div style={{ minHeight: 380 }}>
          <KalingaMap onSelectMuni={onNavigateToLgu} />
        </div>
      </Panel>

      {/* 3. Trajectory & Distribution Grid */}
      <div className="panel-grid-two-col">
        {/* Province Trajectory Composed Chart */}
        <Panel glow style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle
            badge="2010 CPH – 2024 POPCEN"
            note="Province-wide population and household progression. Percentage badges indicate annualized growth rates between census milestones."
          >
            Province-Wide Population & Household Trajectory
          </SectionTitle>

          <div className="chart-box-container" style={{ width: '100%', height: 320, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={overviewTrendData} margin={{ left: 0, right: 15, top: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="popGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} ticks={[2010, 2015, 2020, 2024]} />
                <YAxis yAxisId="left" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: COLORS.creamDim, paddingTop: 6 }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="total_population"
                  name="Total Population"
                  stroke={COLORS.cyan}
                  strokeWidth={2.8}
                  fill="url(#popGrad)"
                  dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? (
                    <circle key={p.index} cx={p.cx} cy={p.cy} r={4} fill={COLORS.cyan} stroke="#fff" strokeWidth={1.5} />
                  ) : null}
                  activeDot={{ r: 6, fill: COLORS.cyan, stroke: '#fff', strokeWidth: 2 }}
                >
                  <LabelList dataKey="pop_pct" position="bottom" offset={8} fill={COLORS.cyan} fontSize={11} fontWeight={700} />
                </Area>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="num_households"
                  name="Number of Households"
                  stroke={COLORS.purple}
                  strokeWidth={2.2}
                  strokeDasharray="5 5"
                  dot={(p) => [2010, 2015, 2020, 2024].includes(p.payload?.year) ? (
                    <circle key={p.index} cx={p.cx} cy={p.cy} r={3.5} fill={COLORS.purple} />
                  ) : null}
                  activeDot={{ r: 5.5, fill: COLORS.purple, stroke: '#fff', strokeWidth: 2 }}
                >
                  <LabelList dataKey="hh_pct" position="bottom" offset={8} fill={COLORS.purple} fontSize={11} fontWeight={700} />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Population by Municipality Ranking */}
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle
            badge="2024 POPCEN Ranking"
            note="Distribution of total residents across City of Tabuk and the 7 municipalities."
          >
            Population by City / Municipality
          </SectionTitle>

          <div className="chart-box-container" style={{ width: '100%', height: 320, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={muniPop2024} layout="vertical" margin={{ left: 5, right: 25, top: 5, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} />
                <YAxis type="category" dataKey="municipality" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} width={88} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="total_population" name="Total Population" fill={COLORS.cyan} radius={[0, 5, 5, 0]}>
                  {muniPop2024.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.cyan : COLORS.sky} />
                  ))}
                  <LabelList dataKey="share" position="right" formatter={v => `${v}%`} fill={COLORS.creamDim} fontSize={10.5} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
