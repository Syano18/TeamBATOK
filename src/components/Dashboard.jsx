import React, { useState, useEffect } from 'react';
import {
  Users, Home, LayoutGrid, PieChart as PieChartIcon,
  TrendingUp, Map, Database, MessageSquare, Sparkles, ExternalLink, Award
} from 'lucide-react';
import { DATA } from '../data/kalingaData';
import { COLORS, fmt, pctChange, growthRate, CENSUS_SOURCES } from '../utils/formatters';
import { StatCard } from './common/CommonUI';

import OverviewTab from './tabs/OverviewTab';
import TrendsTab from './tabs/TrendsTab';
import AgeGenderTab from './tabs/AgeGenderTab';
import HouseholdsTab from './tabs/HouseholdsTab';
import BarangaysTab from './tabs/BarangaysTab';
import TablesTab from './tabs/TablesTab';

import DisclaimerModal from './modals/DisclaimerModal';
import FeedbackModal from './modals/FeedbackModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid, desc: 'Key province metrics & municipal rankings' },
  { id: 'trends', label: 'Population Trends', icon: TrendingUp, desc: 'Census trajectories 2010–2024' },
  { id: 'agegender', label: 'Age & Gender', icon: Users, desc: 'Demographic pyramid & sex ratios' },
  { id: 'households', label: 'Households', icon: Home, desc: 'Household counts & family sizes' },
  { id: 'explorer', label: 'Barangays', icon: Map, desc: 'Barangay search & deep-dive trends' },
  { id: 'tables', label: 'Data Tables', icon: Database, desc: 'Filter, sort & Excel export' },
];

export default function KalingaDashboard() {
  // Read initial states from URL search params if present
  const getInitialParam = (key, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const params = new URLSearchParams(window.location.search);
    return params.get(key) || fallback;
  };

  const [tab, setTab] = useState(() => getInitialParam('tab', 'overview'));
  const [explorerMuni, setExplorerMuni] = useState(() => {
    const fromUrl = getInitialParam('lgu', DATA.municipalities[0]);
    return DATA.municipalities.includes(fromUrl) ? fromUrl : DATA.municipalities[0];
  });
  const [explorerBgy, setExplorerBgy] = useState(null);

  // Sync state to URL without reloading page
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    if (tab === 'explorer') {
      url.searchParams.set('lgu', explorerMuni);
    } else {
      url.searchParams.delete('lgu');
    }
    window.history.replaceState({}, '', url.toString());
  }, [tab, explorerMuni]);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    return localStorage.getItem('hide_psa_disclaimer') !== 'true';
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedMunis, setSelectedMunis] = useState(['City of Tabuk', 'Pinukpuk', 'Balbalan']);
  const [pyramidYear, setPyramidYear] = useState(2020);
  const [pyramidLevel, setPyramidLevel] = useState('province');
  const [householdMetric, setHouseholdMetric] = useState('num_households');
  const [tableLevel, setTableLevel] = useState('municipality');
  const [tableYear, setTableYear] = useState(2024);
  const [tableMuni, setTableMuni] = useState('City of Tabuk');

  // Executive Metric Computations
  const latestProv = DATA.province_trend[DATA.province_trend.length - 1];
  const firstProv = DATA.province_trend[0];
  const prevProv = DATA.province_trend[DATA.province_trend.length - 2];

  const avgHHSize = (latestProv.hh_population / latestProv.num_households).toFixed(2);
  const growthTotal = pctChange(firstProv.total_population, latestProv.total_population);
  const growthRecent = pctChange(prevProv.total_population, latestProv.total_population);
  const annualizedRecent = growthRate(prevProv.total_population, latestProv.total_population, 4);

  const handleNavigateToLgu = (muniName, jumpToExplorer = false) => {
    setExplorerMuni(muniName);
    setExplorerBgy(null);
    if (jumpToExplorer) {
      setTab('explorer');
    }
  };

  return (
    <>
      <div className="dashboard-wrapper">
        {/* Top Header */}
        <header style={{ marginBottom: 20, position: 'relative' }}>
          <div className="header-main-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fb7185',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}>
                  Province of Kalinga
                </div>
              </div>

              <h1 className="header-title-text" style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 30,
                fontWeight: 700,
                margin: 0,
                color: COLORS.cream,
                letterSpacing: -0.5,
                lineHeight: 1.2
              }}>
                Population & Household Census
              </h1>
            </div>
            <div className="header-logos" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <img src="/PSA.png" alt="Philippine Statistics Authority Logo" className="header-logo-item" style={{ height: 60, width: 'auto', objectFit: 'contain' }} />
              <img src="/Bagong.png" alt="Bagong Pilipinas Logo" className="header-logo-item" style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
              <img src="/Kalinga.png" alt="Province of Kalinga Logo" className="header-logo-item" style={{ height: 60, width: 'auto', objectFit: 'contain' }} title="Province of Kalinga" />
            </div>
          </div>
        </header>

        {/* Executive Stat Cards */}
        <div className="stat-cards-grid">
          <StatCard
            label="Total Population"
            value={fmt(latestProv.total_population)}
            growth={`+${growthTotal}%`}
            sub="since 2010 CPH"
            accent={COLORS.cyan}
            icon={Users}
            delay={0.05}
          />
          <StatCard
            label="Household Population"
            value={fmt(latestProv.hh_population)}
            growth={`+${pctChange(firstProv.hh_population, latestProv.hh_population)}%`}
            sub="in households"
            accent={COLORS.sky}
            icon={Home}
            delay={0.1}
          />
          <StatCard
            label="Total Households"
            value={fmt(latestProv.num_households)}
            growth={`+${pctChange(firstProv.num_households, latestProv.num_households)}%`}
            sub="families"
            accent={COLORS.purple}
            icon={LayoutGrid}
            delay={0.15}
          />
          <StatCard
            label="Avg. Household Size"
            value={avgHHSize}
            sub="persons / HH"
            growth="↓ -0.96"
            accent={COLORS.pink}
            icon={PieChartIcon}
            delay={0.2}
          />
          <StatCard
            label="Annualized Growth (2020-2024)"
            value={`+${annualizedRecent}% / yr`}
            growth={`+${growthRecent}% total`}
            sub={`${fmt(latestProv.total_population - prevProv.total_population)} new residents`}
            accent={COLORS.emerald}
            icon={TrendingUp}
            delay={0.25}
          />
        </div>

        {/* Tab Navigation */}
        <div className="tabs-scroll-container no-scrollbar" style={{
          display: 'flex',
          gap: 6,
          marginBottom: 18,
          background: 'rgba(15, 23, 42, 0.6)',
          padding: 6,
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                className={`tab-nav-btn ${active ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {Icon && <Icon size={15} />}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modular Tab Content Views */}
        {tab === 'overview' && (
          <OverviewTab onNavigateToLgu={handleNavigateToLgu} />
        )}

        {tab === 'trends' && (
          <TrendsTab
            selectedMunis={selectedMunis}
            setSelectedMunis={setSelectedMunis}
          />
        )}

        {tab === 'agegender' && (
          <AgeGenderTab
            pyramidYear={pyramidYear}
            setPyramidYear={setPyramidYear}
            pyramidLevel={pyramidLevel}
            setPyramidLevel={setPyramidLevel}
          />
        )}

        {tab === 'households' && (
          <HouseholdsTab
            householdMetric={householdMetric}
            setHouseholdMetric={setHouseholdMetric}
          />
        )}

        {tab === 'explorer' && (
          <BarangaysTab
            explorerMuni={explorerMuni}
            setExplorerMuni={setExplorerMuni}
            explorerBgy={explorerBgy}
            setExplorerBgy={setExplorerBgy}
          />
        )}

        {tab === 'tables' && (
          <TablesTab
            tableLevel={tableLevel}
            setTableLevel={setTableLevel}
            tableYear={tableYear}
            setTableYear={setTableYear}
            tableMuni={tableMuni}
            setTableMuni={setTableMuni}
          />
        )}

        {/* Footer with Census Survey Year Data Sources */}
        <footer style={{
          marginTop: 28,
          padding: '16px 20px',
          borderRadius: 14,
          background: 'rgba(15, 23, 42, 0.45)',
          border: `1px solid ${COLORS.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ fontSize: 12, color: COLORS.creamDim }}>
            <strong style={{ color: COLORS.cream }}>Official PSA Data Sources by Survey Year:</strong>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 8
          }}>
            {Object.values(CENSUS_SOURCES).map(src => (
              <a
                key={src.year}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.cream,
                  textDecoration: 'none',
                  fontSize: 11.5,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = COLORS.cyan;
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: src.year === 2024 ? COLORS.cyan : COLORS.cream }}>
                    {src.name}
                  </span>
                  <span style={{ color: COLORS.creamSub, fontSize: 10.5 }}>
                    ({src.date})
                  </span>
                </div>
                <ExternalLink size={12} style={{ color: COLORS.cyan, flexShrink: 0 }} />
              </a>
            ))}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            paddingTop: 8,
            borderTop: `1px solid ${COLORS.border}`,
            fontSize: 11,
            color: COLORS.creamSub
          }}>
            <span>Mandated by Republic Act No. 10625 (Philippine Statistical Act of 2013)</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '3px 10px',
              borderRadius: 6
            }}>
              <Award size={12} style={{ color: COLORS.cyan }} />
              <span style={{ color: COLORS.creamDim }}>Contest Entry by</span>
              <strong style={{ color: COLORS.cyan, letterSpacing: 0.5 }}>TeamBATOK</strong>
            </div>
            <span>Provincial Government of Kalinga & Philippine Statistics Authority</span>
          </div>
        </footer>

        {/* Modals */}
        {showDisclaimer && (
          <DisclaimerModal onClose={() => setShowDisclaimer(false)} />
        )}


        <FeedbackModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => setShowSuccessModal(true)}
        />

        {showSuccessModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 15, 25, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: 16
          }}>
            <div className="animate-enter" style={{
              background: COLORS.panelAlt,
              border: `1px solid ${COLORS.borderHover}`,
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              textAlign: 'center'
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: COLORS.emerald,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: COLORS.cream, fontSize: 18, fontFamily: "'Space Grotesk', sans-serif" }}>
                Thank You for Your Feedback!
              </h3>
              <p style={{ color: COLORS.creamDim, fontSize: 13, lineHeight: 1.5, margin: '0 0 20px' }}>
                Your response has been recorded. We appreciate your assistance in improving the Kalinga Demographic Portal.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  background: COLORS.emerald,
                  color: '#fff',
                  border: 'none',
                  padding: '9px 24px',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Floating Review Action Button */}
        <button
          onClick={() => setShowReviewModal(true)}
          className="review-floating-btn"
          type="button"
          title="Leave User Feedback"
        >
          <MessageSquare size={15} />
          <span>Feedback</span>
        </button>
      </div>
    </>
  );
}
