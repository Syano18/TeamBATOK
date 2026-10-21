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
  const prevProv = DATA.province_trend[DATA.province_trend.length - 2];
  const provAvgHhSize = ((latestProv.hh_population || latestProv.total_population) / latestProv.num_households).toFixed(2);
  const prevAvgHhSize = ((prevProv.hh_population || prevProv.total_population) / prevProv.num_households).toFixed(2);
  const provPopGrowth = pctChange(prevProv.total_population, latestProv.total_population);
  const provHhCountGrowth = pctChange(prevProv.num_households, latestProv.num_households);
  const netNewResidents = latestProv.total_population - prevProv.total_population;

  // LGU-specific figures for narrative
  const tabuk20 = DATA.municipality_trend.find(d => d.year === 2020 && d.municipality === 'City of Tabuk');
  const tabuk24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === 'City of Tabuk');
  const tabukGrowth2024 = tabuk20 && tabuk24 ? pctChange(tabuk20.total_population, tabuk24.total_population) : '1.4';
  const tabukShare = tabuk24 && latestProv.total_population ? ((tabuk24.total_population / latestProv.total_population) * 100).toFixed(1) : '52.2';

  const tanudan20 = DATA.municipality_trend.find(d => d.year === 2020 && d.municipality === 'Tanudan');
  const tanudan24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === 'Tanudan');
  const tanudanGrowth2024 = tanudan20 && tanudan24 ? pctChange(tanudan20.total_population, tanudan24.total_population) : '27.0';

  const lubuagan10 = DATA.municipality_trend.find(d => d.year === 2010 && d.municipality === 'Lubuagan');
  const lubuagan24 = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === 'Lubuagan');
  const lubuaganDrop1024 = lubuagan10 && lubuagan24 ? pctChange(lubuagan10.total_population, lubuagan24.total_population) : '-7.6';

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
      {/* 1. Key Census Takeaways: Executive Narrative Headline */}
      <Panel glow style={{
        padding: '18px 22px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(17, 24, 39, 0.9) 100%)',
        border: `1px solid ${COLORS.borderHover}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: COLORS.cyanSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.cyan
            }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.cream, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Key Census Takeaways
            </span>
          </div>
          <span style={{
            fontSize: 11,
            padding: '3px 10px',
            borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.15)',
            color: COLORS.emerald,
            fontWeight: 700,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            Official 2024 POPCEN Findings
          </span>
        </div>

        <p style={{
          fontSize: 13.5,
          color: COLORS.cream,
          lineHeight: 1.65,
          margin: '0 0 14px 0',
          fontWeight: 400
        }}>
          Between the 2020 CPH and 2024 POPCEN, Kalinga’s population grew by <strong style={{ color: COLORS.cyan }}>{fmt(netNewResidents)} (+{provPopGrowth}%)</strong> to <strong style={{ color: COLORS.cyan }}>{fmt(latestProv.total_population)}</strong>, while households grew much faster (<strong style={{ color: COLORS.purple }}>+{provHhCountGrowth}%</strong>), reducing average household size from <strong style={{ color: COLORS.purple }}>{prevAvgHhSize} to {provAvgHhSize} persons</strong>. <strong>City of Tabuk</strong> remains the population center with <strong style={{ color: COLORS.cyan }}>{tabukShare}%</strong> of residents, but grew only <strong style={{ color: COLORS.cream }}>{tabukGrowth2024}%</strong>. The fastest growth came from smaller upland LGUs, led by <strong style={{ color: COLORS.emerald }}>Tanudan (+{tanudanGrowth2024}%)</strong>, while <strong style={{ color: COLORS.pink }}>Lubuagan</strong> is the only LGU with fewer residents than in 2010 (<strong style={{ color: COLORS.pink }}>{lubuaganDrop1024}%</strong>).
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 10
        }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.cyan, fontWeight: 700, fontSize: 11.5, marginBottom: 2 }}>Urban Concentration</div>
            <div style={{ fontSize: 12, color: COLORS.creamDim, lineHeight: 1.45 }}>
              <strong>{insights.topMuni?.municipality}</strong> holds <strong>{insights.topMuni?.share}%</strong> of all provincial residents ({fmt(insights.topMuni?.total_population)} pop.).
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.emerald, fontWeight: 700, fontSize: 11.5, marginBottom: 2 }}>Recent Growth Leader</div>
            <div style={{ fontSize: 12, color: COLORS.creamDim, lineHeight: 1.45 }}>
              <strong>{insights.fastestRecent.muni}</strong> recorded the fastest 2020–2024 annualized rate at <strong>+{insights.fastestRecent.rate}% / year</strong>.
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.purple, fontWeight: 700, fontSize: 11.5, marginBottom: 2 }}>Household Nuclearization</div>
            <div style={{ fontSize: 12, color: COLORS.creamDim, lineHeight: 1.45 }}>
              Provincial density dropped to <strong>{provAvgHhSize} persons/hh</strong>; <strong>{insights.smallestHh.muni}</strong> is most compact at <strong>{insights.smallestHh.size}</strong>.
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.025)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.pink, fontWeight: 700, fontSize: 11.5, marginBottom: 2 }}>14-Year Cumulative Expansion</div>
            <div style={{ fontSize: 12, color: COLORS.creamDim, lineHeight: 1.45 }}>
              <strong>{insights.topLongTerm.muni}</strong> recorded the largest long-term expansion at <strong>+{insights.topLongTerm.pct}%</strong> over the 2010–2024 census rounds.
            </div>
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
