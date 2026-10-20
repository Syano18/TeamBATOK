import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Map, Info } from 'lucide-react';
import { COLORS, fmt, fmtCompact } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle, ModernSelect, Pill, MaleBar, FemaleBar } from '../common/CommonUI';
import CustomTooltip, { CustomLegend } from '../common/CustomTooltip';

export default function AgeGenderTab({
  pyramidYear,
  setPyramidYear,
  pyramidLevel,
  setPyramidLevel
}) {
  // Population pyramid data computation
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
        female: groupData.female || 0,
        total: groupData.total || ((groupData.male || 0) + (groupData.female || 0))
      };
    }).reverse();
  }, [pyramidYear, pyramidLevel]);

  // Demographic summary computation for age pyramid
  const demographicSummary = useMemo(() => {
    if (!pyramidData || pyramidData.length === 0) return null;
    let youth = 0; // 0-14
    let working = 0; // 15-64
    let senior = 0; // 65+
    let total = 0;

    pyramidData.forEach(item => {
      const ag = item.age;
      const count = Math.abs(item.male) + item.female;
      total += count;
      if (['0 - 4', '5 - 9', '10 - 14'].includes(ag)) {
        youth += count;
      } else if (['65 - 69', '70 - 74', '75 - 79', '80 and over'].includes(ag)) {
        senior += count;
      } else {
        working += count;
      }
    });

    if (total === 0 || working === 0) return null;

    const youthPct = ((youth / total) * 100).toFixed(1);
    const workingPct = ((working / total) * 100).toFixed(1);
    const seniorPct = ((senior / total) * 100).toFixed(1);
    const dependencyRatio = (((youth + senior) / working) * 100).toFixed(1);

    return { youth, youthPct, working, workingPct, senior, seniorPct, dependencyRatio, total };
  }, [pyramidData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      {/* Demographic Filter Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '10px 14px',
        borderRadius: 12,
        border: `1px solid ${COLORS.border}`,
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.creamDim }}>Census Year:</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {[2010, 2015, 2020].map(y => (
              <Pill key={y} active={pyramidYear === y} onClick={() => setPyramidYear(y)}>
                {y} CPH
              </Pill>
            ))}
          </div>

          {/* 2024 Official Release Notice */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#fbbf24',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '3px 9px',
            borderRadius: 6,
            border: '1px solid rgba(245, 158, 11, 0.25)'
          }}>
            <Info size={12} style={{ flexShrink: 0 }} />
            <span>Note: 2024 POPCEN has no official released age & gender data per province</span>
          </div>
        </div>

        <div className="mobile-stack-full" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.creamDim }}>Scope:</span>
          <ModernSelect
            value={pyramidLevel}
            onChange={setPyramidLevel}
            icon={Map}
            width={220}
            options={[
              { value: 'province', label: 'Kalinga (Province-Wide)' },
              ...DATA.municipalities.map(m => ({ value: m, label: m }))
            ]}
          />
        </div>
      </div>

      {/* Demographic Key Indicators */}
      {demographicSummary && (
        <div className="demographic-summary-grid">
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: '12px 14px' }}>
            <div style={{ color: COLORS.creamDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Working-Age (15–64)</div>
            <div style={{ color: COLORS.emerald, fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {demographicSummary.workingPct}%
            </div>
            <div style={{ color: COLORS.creamSub, fontSize: 11 }}>{fmt(demographicSummary.working)} workers</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: '12px 14px' }}>
            <div style={{ color: COLORS.creamDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Youth (0–14)</div>
            <div style={{ color: COLORS.cyan, fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {demographicSummary.youthPct}%
            </div>
            <div style={{ color: COLORS.creamSub, fontSize: 11 }}>{fmt(demographicSummary.youth)} youth</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: '12px 14px' }}>
            <div style={{ color: COLORS.creamDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Seniors (65+)</div>
            <div style={{ color: COLORS.pink, fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {demographicSummary.seniorPct}%
            </div>
            <div style={{ color: COLORS.creamSub, fontSize: 11 }}>{fmt(demographicSummary.senior)} seniors</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: '12px 14px' }}>
            <div style={{ color: COLORS.creamDim, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>Dependency Ratio</div>
            <div style={{ color: COLORS.amber, fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
              {demographicSummary.dependencyRatio}
            </div>
            <div style={{ color: COLORS.creamSub, fontSize: 11 }}>per 100 workers</div>
          </div>
        </div>
      )}

      <div className="panel-grid-two-col">
        {/* Population Pyramid */}
        <Panel glow style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle
            badge={`${pyramidYear} CPH`}
            note="5-Year age cohorts with Male (Left) and Female (Right) symmetrical distribution. (Note: 2024 POPCEN has no official released age & gender data per province)."
          >
            Population Pyramid: {pyramidLevel === 'province' ? 'Province of Kalinga' : pyramidLevel}
          </SectionTitle>

          <div className="chart-box-container" style={{ width: '100%', height: 350, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={pyramidData}
                layout="vertical"
                stackOffset="sign"
                barCategoryGap="10%"
                margin={{ left: 5, right: 10, top: 5, bottom: 5 }}
              >
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={COLORS.creamDim} tick={{ fontSize: 10.5 }} tickFormatter={v => fmtCompact(Math.abs(v))} />
                <YAxis type="category" dataKey="age" stroke={COLORS.creamDim} tick={{ fontSize: 11 }} width={62} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="male" name="Male" stackId="a" fill={COLORS.male} shape={<MaleBar />} />
                <Bar dataKey="female" name="Female" stackId="a" fill={COLORS.female} shape={<FemaleBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Sex Ratio Across Census Years */}
        <Panel style={{ display: 'flex', flexDirection: 'column' }}>
          <SectionTitle
            badge="Historical Comparison"
            note="Male vs. Female counts and sex ratio across census rounds. (Note: 2024 POPCEN has no official released age & gender data per province)."
          >
            Sex Distribution & Ratios
          </SectionTitle>

          <div className="chart-box-container" style={{ width: '100%', height: 350, minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={pyramidLevel === 'province'
                  ? DATA.province_trend.filter(d => d.male != null)
                  : DATA.municipality_trend.filter(d => d.municipality === pyramidLevel && d.male != null)}
                margin={{ left: 0, right: 15, top: 15, bottom: 5 }}
              >
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke={COLORS.creamDim} tick={{ fontSize: 11.5 }} />
                <YAxis stroke={COLORS.creamDim} tick={{ fontSize: 11 }} tickFormatter={fmtCompact} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="male" name="Male" fill={COLORS.male} radius={[5, 5, 0, 0]} />
                <Bar dataKey="female" name="Female" fill={COLORS.female} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
