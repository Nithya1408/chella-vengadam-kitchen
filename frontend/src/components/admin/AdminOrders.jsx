import { useState, useEffect } from 'react';
import { fetchAdminOrders, updateOrderStatus } from '../../api/api';
import './AdminOrders.css';

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending',    color: 'gray' },
  { value: 'preparing',  label: 'Preparing',  color: 'orange' },
  { value: 'ready',      label: 'Ready',      color: 'blue' },
  { value: 'served',     label: 'Served',     color: 'purple' },
  { value: 'completed',  label: 'Completed',  color: 'green' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'red' },
];

const FILTER_PILLS = [
  { value: 'all',        label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'preparing',  label: 'Preparing' },
  { value: 'ready',      label: 'Ready' },
  { value: 'served',     label: 'Served' },
  { value: 'completed',  label: 'Completed' },
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // orderId being updated

  async function load(filterValue = filter) {
    try {
      setLoading(true);
      const res = await fetchAdminOrders(filterValue);
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh the list to get fresh data
      await load(filter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => 
    STATUS_OPTIONS.find(s => s.value === status)?.color || 'gray';

  return (
    <div>
      <div className="tab-header">
        <p className="tab-tag">— ஆர்டர்கள் · ORDERS —</p>
        <h1 className="tab-title">
          All <span className="italic">orders</span>
        </h1>
        <p className="tab-subtitle">Live order pipeline — update status as orders move through the kitchen</p>
      </div>

      {/* Filter pills */}
      <div className="filter-pills">
        {FILTER_PILLS.map(pill => (
          <button
            key={pill.value}
            className={`filter-pill ${filter === pill.value ? 'active' : ''}`}
            onClick={() => setFilter(pill.value)}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Orders table / empty state / loading */}
      {loading && <p className="admin-loading">🌸 Loading orders...</p>}

      {error && <p className="admin-empty">⚠️ {error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">📋</div>
          <p>No orders found for this filter.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Type</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Placed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.order_id}>
                  <td>
                    <span className="order-number-cell">{o.order_number}</span>
                  </td>
                  <td>
                    <span className="type-badge">
                      {o.order_type === 'dine-in' && '🍽️ Dine-in'}
                      {o.order_type === 'takeaway' && '🛍️ Takeaway'}
                      {o.order_type === 'delivery' && '🛵 Delivery'}
                    </span>
                  </td>
                  <td>
                    {o.table_number || <span className="muted-cell">—</span>}
                  </td>
                  <td className="muted-cell">{o.item_count} items</td>
                  <td className="amount-cell">₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                  <td>
                    <span className="payment-method">
                      {o.payment_method === 'cash' && '💵'}
                      {o.payment_method === 'upi' && '📱'}
                      {o.payment_method === 'card' && '💳'}
                      <span className={`payment-tag ${o.payment_status}`}>{o.payment_status}</span>
                    </span>
                  </td>
                  <td className="muted-cell">{formatTime(o.created_at)}</td>
                  <td>
                    <div className="status-cell">
                      <span className={`status-dot ${getStatusColor(o.status)}`}></span>
                      <select
                        className={`status-select status-${getStatusColor(o.status)}`}
                        value={o.status}
                        disabled={updating === o.order_id}
                        onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;