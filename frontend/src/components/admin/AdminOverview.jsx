import { useState, useEffect } from 'react';
import { fetchAdminStats } from '../../api/api';
import './AdminOverview.css';

function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAdminStats();
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="tab-header">
          <p className="tab-tag">— மேலோட்டம் · OVERVIEW —</p>
          <h1 className="tab-title">Today at a glance</h1>
        </div>
        <p className="admin-loading">🌸 Loading dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div>
        <div className="tab-header">
          <p className="tab-tag">— OVERVIEW —</p>
          <h1 className="tab-title">Dashboard</h1>
        </div>
        <p className="admin-empty">⚠️ {error || 'No data available'}</p>
      </div>
    );
  }

  // Format the 7-day chart data
  const chartData = stats.week_revenue.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
    revenue: Number(d.revenue),
    orders: Number(d.orders),
  }));

  // ============ Build SVG chart manually ============
  const chartWidth = 600;
  const chartHeight = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);
  const niceMax = Math.ceil(maxRevenue / 100) * 100; // round up to nearest 100

  // Convert data points to SVG coordinates
  const points = chartData.map((d, i) => {
    const x = padding.left + (chartData.length > 1 ? (i / (chartData.length - 1)) * innerW : innerW / 2);
    const y = padding.top + innerH - (d.revenue / niceMax) * innerH;
    return { x, y, ...d };
  });

  // Build the smooth area path
  const linePath = points.length > 0
    ? points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`
    : '';

  // Y-axis ticks
  const yTicks = [0, niceMax / 4, niceMax / 2, (3 * niceMax) / 4, niceMax];

  // KPI cards
  const kpis = [
    { label: "Today's Revenue", value: `₹${stats.today_revenue.toLocaleString('en-IN')}`, icon: '💰', hint: `${stats.today_orders} ${stats.today_orders === 1 ? 'order' : 'orders'} today`, color: 'purple' },
    { label: 'Active Orders', value: stats.pending_orders, icon: '🍳', hint: 'Pending or preparing', color: 'orange' },
    { label: 'Reservations', value: stats.upcoming_reservations, icon: '🪑', hint: 'Upcoming bookings', color: 'pink' },
    { label: 'Tables Occupied', value: `${stats.tables_occupied}/${stats.tables_total}`, icon: '🍽️', hint: `${Math.round((stats.tables_occupied / stats.tables_total) * 100)}% capacity`, color: 'green' },
    { label: 'Customers', value: stats.total_customers, icon: '👥', hint: 'Registered', color: 'blue' },
    { label: 'Active Dishes', value: stats.total_dishes, icon: '🌸', hint: 'On the menu', color: 'lavender' },
  ];

  return (
    <div>
      <div className="tab-header">
        <p className="tab-tag">— மேலோட்டம் · OVERVIEW —</p>
        <h1 className="tab-title">
          Today at a <span className="italic">glance</span>
        </h1>
        <p className="tab-subtitle">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI cards grid */}
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className={`kpi-card kpi-${k.color}`}>
            <div className="kpi-icon">{k.icon}</div>
            <p className="kpi-label">{k.label}</p>
            <p className="kpi-value">{k.value}</p>
            <p className="kpi-hint">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="chart-row">
        {/* Sales chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-eyebrow">SALES THIS WEEK</p>
              <h3 className="chart-title">Revenue trend</h3>
            </div>
            <span className="chart-tag">Last 7 days</span>
          </div>

          {chartData.length === 0 ? (
            <div className="chart-empty">
              <p>📊 No orders yet — chart will populate as orders come in</p>
            </div>
          ) : (
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="custom-chart" preserveAspectRatio="xMidYMid meet">
              {/* Gradient definition */}
              <defs>
                <linearGradient id="cv-revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Y-axis grid lines */}
              {yTicks.map((tick, i) => {
                const y = padding.top + innerH - (tick / niceMax) * innerH;
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#EDE9FE"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fontSize="10"
                      fill="#6B7280"
                      textAnchor="end"
                    >
                      ₹{tick}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {areaPath && <path d={areaPath} fill="url(#cv-revenue-gradient)" />}

              {/* Line */}
              {linePath && <path d={linePath} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

              {/* Data point dots */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#7C3AED" strokeWidth="2.5" />
                  <title>{`${p.date}: ₹${p.revenue} (${p.orders} orders)`}</title>
                </g>
              ))}

              {/* X-axis labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={chartHeight - 8}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {p.date}
                </text>
              ))}
            </svg>
          )}
        </div>

        {/* Top items */}
        <div className="top-items-card">
          <div className="chart-card-header">
            <div>
              <p className="chart-eyebrow">BEST SELLERS</p>
              <h3 className="chart-title">Top dishes</h3>
            </div>
          </div>

          {stats.top_items.length === 0 ? (
            <div className="chart-empty small">
              <p>🌸 No sales yet</p>
            </div>
          ) : (
            <ol className="top-items-list">
              {stats.top_items.map((item, i) => (
                <li key={i} className="top-item">
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-info">
                    <p className="top-name">{item.name}</p>
                    <p className="top-meta">{item.sold} sold · ₹{item.revenue.toLocaleString('en-IN')}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;