import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import { useToast } from '../../context/ToastContext';

const DAY = 24 * 60 * 60 * 1000;
const iso = (d) => d.toISOString().slice(0, 10);
const today = () => iso(new Date());
const daysAgo = (n) => iso(new Date(Date.now() - n * DAY));

const PRESETS = [
  { id: '7', label: 'Last 7 days', from: () => daysAgo(6) },
  { id: '30', label: 'Last 30 days', from: () => daysAgo(29) },
  { id: '90', label: 'Last 90 days', from: () => daysAgo(89) },
  { id: 'year', label: 'This year', from: () => `${new Date().getFullYear()}-01-01` },
  { id: '365', label: 'Last 12 months', from: () => daysAgo(364) },
];

const STATUS_ICON = { Pending: '⏳', Confirmed: '✅', Processing: '📦', Shipped: '🚚', Delivered: '🏁', Cancelled: '✖️' };

/** KPI tile with change vs the previous period of the same length. */
const Kpi = ({ label, value, change, hint }) => {
  const dir = change === null || change === undefined ? 'flat' : change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  return (
    <div className="card kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className={`kpi-change ${dir}`}>
          {change === null ? 'No earlier data' : `${change > 0 ? '▲' : change < 0 ? '▼' : '•'} ${Math.abs(change)}% vs previous period`}
        </div>
      )}
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{hint}</div>}
    </div>
  );
};

/** Single-series column chart (revenue over time) with hover tooltip and a table fallback. */
const RevenueChart = ({ timeline, groupedBy }) => {
  const [hover, setHover] = useState(null);
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...timeline.map((p) => p.revenue));
  const W = 760;
  const H = 220;
  const pad = { top: 12, right: 8, bottom: 26, left: 52 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const slot = innerW / Math.max(1, timeline.length);
  const barW = Math.max(2, Math.min(28, slot - 2)); // 2px gap between bars
  const ticks = [0, 0.5, 1].map((f) => f * max);
  const labelEvery = Math.ceil(timeline.length / 8);
  const fmtDate = (key) => {
    const d = new Date(groupedBy === 'month' ? `${key}-01T00:00:00Z` : `${key}T00:00:00Z`);
    return d.toLocaleDateString('en-US', groupedBy === 'month' ? { month: 'short', year: '2-digit', timeZone: 'UTC' } : { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Revenue by {groupedBy === 'month' ? 'month' : 'day'}</h3>
        <button type="button" className="btn btn-outline btn-xs" onClick={() => setAsTable((v) => !v)}>
          {asTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {asTable ? (
        <div className="data-table-container" style={{ maxHeight: 280, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Period</th><th>Orders</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {timeline.map((p) => (
                <tr key={p.date}><td>{fmtDate(p.date)}</td><td>{p.orders}</td><td>{formatCurrency(p.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ position: 'relative', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 420, height: 'auto', display: 'block' }} role="img" aria-label="Revenue over time" onMouseLeave={() => setHover(null)}>
            {ticks.map((tv, i) => {
              const y = pad.top + innerH - (tv / max) * innerH;
              return (
                <g key={i}>
                  <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="var(--border-subtle)" strokeWidth="1" />
                  <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)">
                    {tv >= 1000 ? `$${Math.round(tv / 100) / 10}k` : `$${Math.round(tv)}`}
                  </text>
                </g>
              );
            })}
            {timeline.map((p, i) => {
              const h = (p.revenue / max) * innerH;
              const x = pad.left + i * slot + (slot - barW) / 2;
              const y = pad.top + innerH - h;
              const r = Math.min(4, barW / 2, h);
              return (
                <g key={p.date} onMouseEnter={() => setHover({ i, x: x + barW / 2, y })}>
                  {/* hit target taller and wider than the bar */}
                  <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" />
                  {h > 0 && (
                    <path
                      d={`M${x},${pad.top + innerH} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${pad.top + innerH} Z`}
                      fill="var(--accent)"
                      opacity={hover && hover.i !== i ? 0.45 : 1}
                    />
                  )}
                  {i % labelEvery === 0 && (
                    <text x={pad.left + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)">
                      {fmtDate(p.date)}
                    </text>
                  )}
                </g>
              );
            })}
            <line x1={pad.left} x2={W - pad.right} y1={pad.top + innerH} y2={pad.top + innerH} stroke="var(--border-active)" strokeWidth="1" />
          </svg>
          {hover && (
            <div
              className="card"
              style={{
                position: 'absolute',
                left: `${(hover.x / W) * 100}%`,
                top: 0,
                transform: 'translateX(-50%)',
                padding: '8px 12px',
                pointerEvents: 'none',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ fontWeight: 800 }}>{fmtDate(timeline[hover.i].date)}</div>
              <div>{formatCurrency(timeline[hover.i].revenue)} · {timeline[hover.i].orders} orders</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Horizontal magnitude bars (one hue), value always shown as text. */
const HBarList = ({ title, rows, valueKey, format, labelKey = 'name', icon, empty = 'No data in this period.' }) => {
  const max = Math.max(1, ...rows.map((r) => r[valueKey] || 0));
  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 14 }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{empty}</p>
      ) : (
        rows.map((r) => (
          <div key={r[labelKey]} className="hbar-row" title={`${r[labelKey]}: ${format(r[valueKey])}`}>
            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {icon ? `${icon(r)} ` : ''}{r[labelKey]}
            </span>
            <div className="hbar-track">
              <div className="hbar-fill" style={{ width: `${Math.max(2, (r[valueKey] / max) * 100)}%` }} />
            </div>
            <span style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{format(r[valueKey])}</span>
          </div>
        ))
      )}
    </div>
  );
};

const AdminAnalytics = () => {
  const [preset, setPreset] = useState('30');
  const [range, setRange] = useState({ from: daysAgo(29), to: today() });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminService
      .getAnalytics(range)
      .then((res) => !cancelled && res.success && setData(res.data))
      .catch((err) => !cancelled && showToast(err.message, 'error'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const choosePreset = (p) => {
    setPreset(p.id);
    setRange({ from: p.from(), to: today() });
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await adminService.exportOrdersCsv(range);
    } catch (err) {
      showToast(err.message || 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const s = data?.summary;
  const pct = (n) => `${n}%`;
  const statusRows = useMemo(() => (data?.byStatus || []).map((r) => ({ ...r, name: r.status })), [data]);
  const paymentRows = useMemo(() => (data?.byPayment || []).map((r) => ({ ...r, name: r.method })), [data]);

  return (
    <AdminLayout title="Analytics & Insights">
      {/* Filters: one row above everything */}
      <div className="range-bar">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className={`help-pill${preset === p.id ? ' active' : ''}`} onClick={() => choosePreset(p)}>
            {p.label}
          </button>
        ))}
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginInlineStart: 6 }}>or</span>
        <input type="date" className="input-field" aria-label="From date" value={range.from} max={range.to} onChange={(e) => { setPreset(''); setRange({ ...range, from: e.target.value }); }} />
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>to</span>
        <input type="date" className="input-field" aria-label="To date" value={range.to} min={range.from} max={today()} onChange={(e) => { setPreset(''); setRange({ ...range, to: e.target.value }); }} />
        <button type="button" className="btn btn-outline btn-sm" style={{ marginInlineStart: 'auto' }} disabled={exporting} onClick={handleExport}>
          {exporting ? 'Preparing…' : '⬇ Download orders (CSV)'}
        </button>
      </div>

      {loading && !data ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>Loading analytics…</div>
      ) : !data ? null : (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          <div className="kpi-grid">
            <Kpi label="Revenue" value={formatCurrency(s.revenue)} change={s.change.revenue} hint="Excludes cancelled orders" />
            <Kpi label="Orders" value={s.orders} change={s.change.orders} hint={`${s.cancelled} cancelled (${pct(s.cancelRate)})`} />
            <Kpi label="Average order" value={formatCurrency(s.avgOrderValue)} change={s.change.avgOrderValue} />
            <Kpi label="New customers" value={s.newCustomers} change={s.change.newCustomers} hint={`${s.buyers} buyers · ${s.repeatBuyers} bought again`} />
          </div>
          <div className="kpi-grid">
            <Kpi label="Payments collected" value={formatCurrency(s.collected)} hint="Orders marked Paid" />
            <Kpi label="Refunded" value={formatCurrency(s.refunded)} />
            <Kpi label="Discounts given" value={formatCurrency(s.discounts)} hint="Promo codes" />
            <Kpi label="Shipping charged" value={formatCurrency(s.shipping)} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <RevenueChart timeline={data.timeline} groupedBy={data.range.groupedBy} />
          </div>

          <div className="analytics-grid">
            <HBarList title="Revenue by category" rows={data.categoryRevenue} valueKey="revenue" format={formatCurrency} />
            <HBarList title="Orders by status" rows={statusRows} valueKey="count" format={(n) => `${n}`} icon={(r) => STATUS_ICON[r.status] || '•'} />
            <HBarList title="Payment methods" rows={paymentRows} valueKey="revenue" format={formatCurrency} />
          </div>

          <div className="analytics-grid">
            {/* Top products */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>Best-selling products</h3>
              {data.topProducts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No sales in this period.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Product</th><th>Sold</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={p.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                            <Link to={`/product/${p._id}`} target="_blank" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</Link>
                          </div>
                        </td>
                        <td>{p.quantity}</td>
                        <td style={{ fontWeight: 800 }}>{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Top customers */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>Top customers</h3>
              {data.topCustomers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No customers bought in this period.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Customer</th><th>Orders</th><th>Spent</th></tr>
                  </thead>
                  <tbody>
                    {data.topCustomers.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.name || 'Deleted account'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email || ''}</div>
                        </td>
                        <td>{c.orders}</td>
                        <td style={{ fontWeight: 800 }}>{formatCurrency(c.spent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="analytics-grid">
            {/* Promo codes */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>Promo code performance</h3>
              {data.coupons.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No promo codes used in this period.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Code</th><th>Uses</th><th>Discount</th><th>Order value</th></tr>
                  </thead>
                  <tbody>
                    {data.coupons.map((c) => (
                      <tr key={c.code}>
                        <td><span className="promo-offer-code">{c.code}</span></td>
                        <td>{c.uses}</td>
                        <td>−{formatCurrency(c.discount)}</td>
                        <td style={{ fontWeight: 800 }}>{formatCurrency(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Stock */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Stock needing attention</h3>
                <Link to="/admin/inventory" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>Inventory →</Link>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                {data.catalog.active} active products · {data.catalog.outOfStock} out of stock · stock value {formatCurrency(data.catalog.stockValue)}
              </p>
              {data.lowStock.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>✅ Every product has more than 5 in stock.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Product</th><th>Left</th></tr>
                  </thead>
                  <tbody>
                    {data.lowStock.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                          <Link to={`/admin/products/${p._id}/edit`}>{p.name}</Link>
                        </td>
                        <td>
                          <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock === 0 ? '✖ Out' : `⚠ ${p.stock}`}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
