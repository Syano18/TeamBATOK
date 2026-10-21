import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Home, Users, TrendingUp, Building2 } from 'lucide-react';
import { COLORS, MUNI_COLORS, fmt, fmtCompact, pctChange, YEARS } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle, ModernSelect } from '../common/CommonUI';
import CustomTooltip from '../common/CustomTooltip';

export default function HouseholdsTab({ householdMetric, setHouseholdMetric }) {
  const latestProv = DATA.province_trend[DATA.province_trend.length - 1];
  const prevProv = DATA.province_trend[DATA.province_trend.length - 2];

  // 1. Grouped bar chart data across census years
  const householdsChartData = useMemo(() => (
    YEARS.map(y => {
      const row = { year: y };
      DATA.municipalities.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        row[m] = rec ? rec[householdMetric] : null;
      });
      return row;
    })
  ), [householdMetric]);

  // 2. Average household size trend across census years
  const muniAvgSizeTrendData = useMemo(() => (
    YEARS.map(y => {
      const row = { year: y };
      DATA.municipalities.forEach(m => {
        const rec = DATA.municipality_trend.find(d => d.year === y && d.municipality === m);
        if (rec && rec.num_households) {
          row[m] = +((rec.hh_population || rec.total_population) / rec.num_households).toFixed(2);
        }
      });
      return row;
    })
  ), []);

  const provSize24 = ((latestProv.hh_population || latestProv.total_population) / latestProv.num_households).toFixed(2);
  const totalNetNewHh = latestProv.num_households - prevProv.num_households;
  const provHhGrowth = pctChange(prevProv.num_households, latestProv.num_households);
  const instPopTotal = latestProv.total_population - latestProv.hh_population;

  // Dynamic calculations for all KPI cards
  const tabukRec = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === 'City of Tabuk');
  const tabukHhShare = tabukRec && latestProv.num_households 
    ? ((tabukRec.num_households / latestProv.num_households) * 100).toFixed(1) 
    : '0.0';

  const sortedCompactLgus = useMemo(() => {
    return DATA.municipalities.map(m => {
      const rec = DATA.municipality_trend.find(d => d.year === 2024 && d.municipality === m);
      const size = rec && rec.num_households ? +((rec.hh_population || rec.total_population) / rec.num_households).toFixed(2) : 999;
      return {
        muni: m,
        shortName: m.replace('City of ', ''),
        size
      };
    }).sort((a, b) => a.size - b.size);
  }, []);

  const mostCompactLgu = sortedCompactLgus[0];
  const runnerUpCompact = sortedCompactLgus.slice(1, 3);

  const fastestHhLgu = useMemo(() => {
    const y24 = DATA.municipality_trend.filter(d => d.year === 2024);
    const y20 = DATA.municipality_trend.filter(d => d.year === 2020);
    return y24.map(d24 => {
      const d20 = y20.find(m => m.municipality === d24.municipality);
      const growth = d20 && d20.num_households 
        ? +pctChange(d20.num_households, d24.num_households) 
        : 0;
      return {
        muni: d24.municipality,
        shortName: d24.municipality.replace('City of ', ''),
        startHh: d20?.num_households || 0,
        endHh: d24.num_households,
        growth
      };
    }).sort((a, b) => b.growth - a.growth)[0];
  }, []);

  const hhPopShare = ((latestProv.hh_population / latestProv.total_population) * 100).toFixed(2);
  const instPopShare = ((instPopTotal / latestProv.total_population) * 100).toFixed(2);
  const instPopBreakdown = useMemo(() => {
    return DATA.municipality_trend
      .filter(d => d.year === 2024 && (d.total_population - d.hh_population) > 0)
      .map(d => ({
        muni: d.municipality,
        count: d.total_population - d.hh_population
      }));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      {/* 1. Household Macro KPI Banner Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(6, 182, 212, 0.15)',
            color: COLORS.cyan,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600 }}>Urban Concentration</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.cream, fontFamily: "'Space Grotesk', sans-serif" }}>
              Tabuk ({fmt(tabukRec?.num_households)})
            </div>
            <div style={{ fontSize: 11, color: COLORS.cyan, fontWeight: 600 }}>
              {tabukHhShare}% of all provincial households
            </div>
          </div>
        </div>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(139, 92, 246, 0.15)',
            color: COLORS.purple,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Home size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600 }}>Net New Households Added</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.purple, fontFamily: "'Space Grotesk', sans-serif" }}>
              +{fmt(totalNetNewHh)} Households
            </div>
            <div style={{ fontSize: 11, color: COLORS.emerald, fontWeight: 600 }}>
              +{provHhGrowth}% increase since 2020 CPH
            </div>
          </div>
        </div>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(6, 182, 212, 0.15)',
            color: COLORS.cyan,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600 }}>Most Compact LGU</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.cream, fontFamily: "'Space Grotesk', sans-serif" }}>
              {mostCompactLgu?.shortName} ({mostCompactLgu?.size})
            </div>
            <div style={{ fontSize: 11, color: COLORS.cyan }}>
              {runnerUpCompact.map(r => `${r.shortName}: ${r.size}`).join(' · ')}
            </div>
          </div>
        </div>
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(16, 185, 129, 0.15)',
            color: COLORS.emerald,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: COLORS.creamDim, textTransform: 'uppercase', fontWeight: 600 }}>Fastest Household Growth</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.cream, fontFamily: "'Space Grotesk', sans-serif" }}>
              {fastestHhLgu?.shortName} (+{fastestHhLgu?.growth}%)
            </div>
            <div style={{ fontSize: 11, color: COLORS.emerald }}>
              {fmt(fastestHhLgu?.startHh)} → {fmt(fastestHhLgu?.endHh)} households
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Trajectory & Progression Charts Grid */}
      <div className="panel-grid-two-col">
        {/* Households Grouped Bar Chart */}
        <Panel glow style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <SectionTitle
              badge="Census Comparison"
              note={`Comparing ${householdMetric === 'num_households' ? 'number of households' : 'household population'} across all 8 LGUs.`}
            >
              Households by Municipality
            </SectionTitle>
            <ModernSelect
              value={householdMetric}
              onChange={setHouseholdMetric}
              width={200}
              options={[
                { value: 'num_households', label: 'Number of Households' },
                { value: 'hh_population', label: 'Household Population' }
              ]}
            />
          </div>

          <div className="chart-box-container" style={{ width: '100%', height: 340, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={householdsChartData} barCategoryGap="6%" barGap={1} margin={{ left: 0, right: 15, top: 10, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.creamDim, paddingTop: 6 }} />
                {DATA.municipalities.map((m, i) => (
                  <Bar key={m} dataKey={m} name={m} fill={MUNI_COLORS[i % MUNI_COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Average Household Size Progression */}
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle
            badge="Persons per Household"
            note="Household population ÷ number of households. Reflects regional trends toward smaller nuclear households."
          >
            Average Household Size Trend (2010–2024)
          </SectionTitle>

          <div className="chart-box-container" style={{ width: '100%', height: 340, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={330}>
              <LineChart data={muniAvgSizeTrendData} margin={{ left: 0, right: 15, top: 15, bottom: 5 }}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} domain={[3.5, 6.2]} width={40} />
                <Tooltip content={<CustomTooltip suffix=" persons" />} />
                <Legend wrapperStyle={{ fontSize: 11.5, color: COLORS.creamDim, paddingTop: 6 }} />
                {DATA.municipalities.map((m, i) => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    name={m}
                    stroke={MUNI_COLORS[i % MUNI_COLORS.length]}
                    strokeWidth={2.2}
                    dot={{ r: 3.5 }}
                    activeDot={{ r: 5.5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Household vs. Institutional Population Demographic Context Card */}
      <Panel glow style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(139, 92, 246, 0.05)), rgba(17, 24, 39, 0.75)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Building2 size={16} style={{ color: COLORS.cyan }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.cream, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Household vs. Institutional Population Distribution
          </span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: COLORS.cyanSoft, color: COLORS.cyan, fontWeight: 600 }}>
            2024 POPCEN
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
          fontSize: 12.5,
          color: COLORS.creamDim,
          lineHeight: 1.5
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.cyan, fontWeight: 700, marginBottom: 3 }}>Household Population ({hhPopShare}%)</div>
            <strong>{fmt(latestProv.hh_population)} residents</strong> live in private households across <strong>{fmt(latestProv.num_households)} households</strong>, reflecting an average density of <strong>{provSize24} persons per household</strong>.
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.purple, fontWeight: 700, marginBottom: 3 }}>Institutional Population ({instPopShare}%)</div>
            Only <strong>{fmt(instPopTotal)} individuals</strong> reside in collective institutional quarters across the province: {instPopBreakdown.map((item, idx) => (
              <span key={item.muni}>
                <strong>{fmt(item.count)} persons</strong> in {item.muni}{idx < instPopBreakdown.length - 1 ? ' and ' : ''}
              </span>
            ))} (such as dormitories, medical facilities, and correctional centers).
          </div>
        </div>
      </Panel>
    </div>
  );
}
