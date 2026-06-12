import { useState, useEffect, useCallback } from 'react';
import { fetchKitchenOrders, updateKitchenOrderStatus } from '../api/api';
import './KitchenPage.css';

const COLUMNS = [
  { key: 'pending',   title: 'New Orders',  emoji: '📥', accent: 'gray',   nextStatus: 'preparing', actionLabel: 'Start cooking →' },
  { key: 'preparing', title: 'In Kitchen',  emoji: '🍳', accent: 'orange', nextStatus: 'ready',     actionLabel: 'Mark ready →' },
  { key: 'ready',     title: 'Ready',       emoji: '🛎️', accent: 'green',  nextStatus: 'served',    actionLabel: 'Mark served →' },
];

const REFRESH_INTERVAL_MS = 10_000; // 10 seconds

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [nowTick, setNowTick] = useState(Date.now()); // updates every minute for elapsed time

  const loadOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchKitchenOrders();
      setOrders(res.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load kitchen queue');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh
  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Tick "now" every minute so elapsed time updates
  useEffect(() => {
    const tickInterval = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(tickInterval);
  }, []);

  const handleAdvance = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateKitchenOrderStatus(orderId, newStatus);
      // Optimistic: remove from current column or refetch
      await loadOrders(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setUpdatingId(orderId);
    try {
      await updateKitchenOrderStatus(orderId, 'cancelled');
      await loadOrders(true);
    } catch (err) {
      alert('Failed to cancel');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group orders by status
  const ordersByStatus = orders.reduce((acc, o) => {
    if (!acc[o.status]) acc[o.status] = [];
    acc[o.status].push(o);
    return acc;
  }, {});

  // Minutes elapsed since order was placed
  const minutesElapsed = (createdAt) => {
    const diff = nowTick - new Date(createdAt).getTime();
    return Math.floor(diff / 60_000);
  };

  // Urgency tier — used to flash warning when orders sit too long
  const getUrgency = (minutes, status) => {
    if (status === 'ready') return 'normal'; // ready orders don't need urgency flashing
    if (minutes >= 20) return 'urgent';
    if (minutes >= 10) return 'warning';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="kitchen-page">
        <div className="kitchen-container">
          <p className="kitchen-loading">🌸 Loading kitchen queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kitchen-page">
      <div className="kitchen-container">
        {/* Header */}
        <header className="kitchen-header">
          <div>
            <p className="kitchen-tag">— சமையலறை · KITCHEN VIEW —</p>
            <h1 className="kitchen-title">
              Live order <span className="italic">queue</span>
            </h1>
          </div>
          <div className="kitchen-meta">
            <div className="live-pulse">
              <span className="pulse-dot"></span>
              Live · auto-refresh
            </div>
            <p className="last-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </header>

        {error && (
          <div className="kitchen-error">⚠️ {error}</div>
        )}

        {/* Columns */}
        <div className="kitchen-board">
          {COLUMNS.map(col => {
            const colOrders = ordersByStatus[col.key] || [];
            return (
              <section key={col.key} className={`kitchen-column col-${col.accent}`}>
                <header className="column-header">
                  <div className="col-title">
                    <span className="col-emoji">{col.emoji}</span>
                    <span className="col-name">{col.title}</span>
                  </div>
                  <span className="col-count">{colOrders.length}</span>
                </header>

                {colOrders.length === 0 ? (
                  <div className="column-empty">
                    <p>—  empty  —</p>
                  </div>
                ) : (
                  <div className="column-cards">
                    {colOrders.map(order => {
                      const mins = minutesElapsed(order.created_at);
                      const urgency = getUrgency(mins, order.status);
                      return (
                        <article 
                          key={order.order_id} 
                          className={`kitchen-card urgency-${urgency} ${updatingId === order.order_id ? 'updating' : ''}`}
                        >
                          <header className="card-top">
                            <div>
                              <p className="card-number">{order.order_number}</p>
                              <p className="card-meta">
                                {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                                {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                                {order.order_type === 'delivery' && '🛵 Delivery'}
                                {order.table_number && ` · Table ${order.table_number}`}
                              </p>
                            </div>
                            <div className={`elapsed-tag elapsed-${urgency}`}>
                              {mins === 0 ? 'just now' : `${mins}m ago`}
                            </div>
                          </header>

                          <ul className="card-items">
                            {order.items.map((item, i) => (
                              <li key={i} className="card-item">
                                <span className={`diet-mini ${item.is_veg ? 'veg' : 'non-veg'}`}></span>
                                <span className="item-qty">×{item.quantity}</span>
                                <span className="item-name">{item.name}</span>
                              </li>
                            ))}
                          </ul>

                          <footer className="card-actions">
                            <button
                              className="action-btn primary"
                              onClick={() => handleAdvance(order.order_id, col.nextStatus)}
                              disabled={updatingId === order.order_id}
                            >
                              {col.actionLabel}
                            </button>
                            {col.key === 'pending' && (
                              <button
                                className="action-btn cancel"
                                onClick={() => handleCancel(order.order_id)}
                                disabled={updatingId === order.order_id}
                                title="Cancel order"
                              >
                                ✕
                              </button>
                            )}
                          </footer>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Helper text */}
        <p className="kitchen-help">
          🌸 New orders appear automatically · cards turn amber after 10 minutes and red after 20 minutes
        </p>
      </div>
    </div>
  );
}

export default KitchenPage;