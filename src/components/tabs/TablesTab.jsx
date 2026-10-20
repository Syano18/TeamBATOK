import React, { useState, useMemo } from 'react';
import { Search, X, Download, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Map, ChevronsRight, MoveHorizontal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { COLORS, fmt, YEARS, CENSUS_SOURCES } from '../../utils/formatters';
import { DATA } from '../../data/kalingaData';
import { Panel, SectionTitle, ModernSelect, Pill } from '../common/CommonUI';

export default function TablesTab({
  tableLevel,
  setTableLevel,
  tableYear,
  setTableYear,
  tableMuni,
  setTableMuni
}) {
  const [tableSearch, setTableSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'total_population', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={13} style={{ marginLeft: 4, opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp size={13} style={{ marginLeft: 4, color: COLORS.cyan }} />
    ) : (
      <ArrowDown size={13} style={{ marginLeft: 4, color: COLORS.cyan }} />
    );
  };

  // Raw table data extraction & sorting
  const rawTableData = useMemo(() => {
    let list = [];
    if (tableLevel === 'province') {
      const rec = DATA.province_trend.find(d => d.year === tableYear);
      if (rec) list = [{ name: 'Province of Kalinga', ...rec }];
    } else if (tableLevel === 'municipality') {
      list = DATA.municipality_trend
        .filter(d => d.year === tableYear)
        .map(d => ({ name: d.municipality, ...d }));
    } else if (tableLevel === 'barangay') {
      if (tableYear === 2024) {
        list = (DATA.barangay_2024[tableMuni] || []).map(b => ({
          name: b.name,
          total_population: b.total_population,
          hh_population: b.hh_population,
          num_households: b.num_households
        }));
      } else {
        const bgys = DATA.barangay_trend[tableMuni] || {};
        list = Object.entries(bgys).map(([bName, t]) => {
          const rec = t.find(d => d.year === tableYear) || {};
          return {
            name: bName,
            total_population: rec.total_population,
            hh_population: rec.hh_population,
            num_households: rec.num_households
          };
        });
      }
    }

    if (tableSearch.trim()) {
      list = list.filter(r => r.name.toLowerCase().includes(tableSearch.toLowerCase()));
    }

    list.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'avg_size') {
        aVal = a.num_households && (a.hh_population || a.total_population)
          ? (a.hh_population || a.total_population) / a.num_households : 0;
        bVal = b.num_households && (b.hh_population || b.total_population)
          ? (b.hh_population || b.total_population) / b.num_households : 0;
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [tableLevel, tableYear, tableMuni, tableSearch, sortConfig]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [tableLevel, tableYear, tableMuni, tableSearch]);

  // Paginated records
  const totalPages = Math.ceil(rawTableData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return rawTableData.slice(start, start + rowsPerPage);
  }, [rawTableData, currentPage]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportRows = rawTableData.map(r => ({
      [tableLevel === 'province' ? 'Province' : tableLevel === 'municipality' ? 'Municipality' : 'Barangay']: r.name,
      'Census Year': tableYear,
      'Total Population': r.total_population != null ? r.total_population : '—',
      'Household Population': r.hh_population != null ? r.hh_population : '—',
      'Number of Households': r.num_households != null ? r.num_households : '—',
      'Average Household Size': r.num_households && (r.hh_population || r.total_population)
        ? +((r.hh_population || r.total_population) / r.num_households).toFixed(2)
        : '—'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Census_${tableYear}`);
    const filename = `Kalinga_Census_${tableLevel}_${tableYear}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <Panel glow style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Controls Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14
        }}>
          <div>
            <SectionTitle
              badge="Official Records"
              note="Search, sort, filter, and export census statistics directly to Excel."
            >
              Statistical Data Tables
            </SectionTitle>
          </div>

          <div className="mobile-stack-full" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="mobile-stack-full" style={{ position: 'relative', width: 180 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: COLORS.creamDim }} />
              <input
                type="text"
                placeholder="Search record..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 28px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  color: COLORS.cream,
                  fontSize: 12,
                  outline: 'none'
                }}
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: COLORS.creamDim, cursor: 'pointer', padding: 0 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <ModernSelect
              value={tableLevel}
              onChange={setTableLevel}
              width={150}
              options={[
                { value: 'province', label: 'Province Level' },
                { value: 'municipality', label: 'LGU Level' },
                { value: 'barangay', label: 'Barangay Level' }
              ]}
            />

            <ModernSelect
              value={tableYear}
              onChange={v => setTableYear(Number(v))}
              width={130}
              options={YEARS.map(y => ({ value: y, label: `${y} Census` }))}
            />
            <button
              onClick={handleExportExcel}
              title="Export Current Table to Excel (.xlsx)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(16, 185, 129, 0.15)',
                color: COLORS.emerald,
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '7px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <Download size={14} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Barangay Filter Ribbon (if Barangay level active) */}
        {tableLevel === 'barangay' && (
          <div className="no-scrollbar" style={{
            display: 'flex',
            gap: 8,
            marginBottom: 14,
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
                const isActive = tableMuni === m;
                return (
                  <Pill
                    key={m}
                    active={isActive}
                    onClick={() => setTableMuni(m)}
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
        )}

        {/* Selected Survey Year Source Banner */}
        {CENSUS_SOURCES[tableYear] && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
            padding: '7px 12px',
            borderRadius: 8,
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${COLORS.border}`,
            fontSize: 11.5
          }}>
            <div style={{ color: COLORS.creamDim }}>
              Official records for <strong>{CENSUS_SOURCES[tableYear].name}</strong> ({CENSUS_SOURCES[tableYear].date})
            </div>
          </div>
        )}

        {/* Table Horizontal Swipe Helper (Mobile & Small Screens) */}
        <div className="table-swipe-helper">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MoveHorizontal size={13} className="swipe-hint-icon" />
            <span>Table is scrollable — swipe horizontally to view all columns</span>
          </div>
          <ChevronsRight size={13} className="swipe-hint-icon" />
        </div>

        {/* Data Table */}
        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          flex: 1,
          minHeight: 320,
          background: 'rgba(11, 15, 25, 0.6)',
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 480 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}`, background: '#111827' }}>
                <th
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', textAlign: 'left', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {tableLevel === 'province' ? 'Province Name' : tableLevel === 'municipality' ? 'LGU' : 'Barangay'}
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_population')}
                  style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Total Pop {getSortIcon('total_population')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('hh_population')}
                  style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    HH Pop {getSortIcon('hh_population')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('num_households')}
                  style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    HHs {getSortIcon('num_households')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avg_size')}
                  style={{ cursor: 'pointer', textAlign: 'right', padding: '12px 14px', color: COLORS.creamDim, fontWeight: 600 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Avg. Size {getSortIcon('avg_size')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 16px', color: COLORS.creamDim }}>
                    No census data matched your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, i) => {
                  const avgSize = row.num_households && (row.hh_population || row.total_population)
                    ? ((row.hh_population || row.total_population) / row.num_households).toFixed(2)
                    : '—';
                  return (
                    <tr
                      key={i}
                      className="data-table-row"
                      style={{
                        borderBottom: `1px solid rgba(255, 255, 255, 0.04)`,
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                      }}
                    >
                      <td style={{ padding: '10px 14px', color: COLORS.cream, fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '10px 14px', color: COLORS.cyan, textAlign: 'right', fontWeight: 700 }}>
                        {fmt(row.total_population)}
                      </td>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, textAlign: 'right' }}>
                        {row.hh_population != null ? fmt(row.hh_population) : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: COLORS.cream, textAlign: 'right' }}>
                        {row.num_households != null ? fmt(row.num_households) : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: COLORS.pink, textAlign: 'right', fontWeight: 600 }}>
                        {avgSize}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            padding: '8px 12px',
            fontSize: 12,
            color: COLORS.creamDim,
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`
          }}>
            <div>
              Showing {((currentPage - 1) * rowsPerPage) + 1}–{Math.min(currentPage * rowsPerPage, rawTableData.length)} of {rawTableData.length} records
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${COLORS.border}`,
                  background: 'rgba(255,255,255,0.03)',
                  color: currentPage === 1 ? COLORS.creamSub : COLORS.cream,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={14} />
              </button>

              <span style={{ fontWeight: 600, color: COLORS.cream }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${COLORS.border}`,
                  background: 'rgba(255,255,255,0.03)',
                  color: currentPage === totalPages ? COLORS.creamSub : COLORS.cream,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
