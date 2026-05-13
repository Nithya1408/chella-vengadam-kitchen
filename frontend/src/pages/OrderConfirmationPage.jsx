import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchOrderById } from '../api/api';
import './OrderConfirmationPage.css';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to get info from navigation state first (faster), fall back to API
  const stateData = location.state;

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetchOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <p className="loading">🌸 Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <p>Order not found.</p>
          <Link to="/menu" className="btn btn-primary">Back to Menu</Link>
        </div>
      </div>
    );
  }

  const orderNumber = stateData?.orderNumber || `CV${String(order.order_id).padStart(5, '0')}`;
  const customerName = stateData?.customerName || 'friend';

  // Estimate prep time based on items
  const estimatedPrepTime = order.items 
    ? Math.max(...order.items.map(i => i.prep_time_minutes || 15), 15)
    : 25;

  return (
    <div className="confirmation-page">
      <div className="container confirmation-container">
        {/* Celebration banner */}
        <div className="celebration">
          <div className="celebration-icon">🌸</div>
          <p className="celebration-tag">— ஆர்டர் கிடைத்தது · ORDER PLACED —</p>
          <h1>
            Thank you,<br />
            <span className="italic">{customerName}!</span>
          </h1>
          <p className="celebration-subtitle">
            We've received your order. The kitchen is firing up. 🪔
          </p>
        </div>

        {/* Order details card */}
        <div className="order-card">
          <div className="order-card-header">
            <div>
              <p className="order-label">ORDER NUMBER</p>
              <p className="order-number">{orderNumber}</p>
            </div>
            <div className="order-status-badge">
              {order.status || 'Pending'}
            </div>
          </div>

          <div className="order-meta-grid">
            <div className="meta-item">
              <p className="meta-label">Type</p>
              <p className="meta-value">
                {order.order_type === 'dine-in' && '🍽️ Dine-in'}
                {order.order_type === 'takeaway' && '🛍️ Takeaway'}
                {order.order_type === 'delivery' && '🛵 Delivery'}
              </p>
            </div>
            <div className="meta-item">
              <p className="meta-label">Payment</p>
              <p className="meta-value">
                {order.payment_method === 'cash' && '💵 Cash'}
                {order.payment_method === 'upi' && '📱 UPI'}
                {order.payment_method === 'card' && '💳 Card'}
              </p>
            </div>
            <div className="meta-item">
              <p className="meta-label">Estimated Time</p>
              <p className="meta-value">⏱️ {estimatedPrepTime} min</p>
            </div>
          </div>

          <div className="order-items">
            <h3>Your Order</h3>
            {order.items && order.items.map(item => (
              <div key={item.order_item_id} className="order-item-row">
                <span className="order-item-name">
                  <span className={`diet-mini ${item.is_veg ? 'veg' : 'non-veg'}`}></span>
                  {item.name}
                  <span className="order-item-qty">× {item.quantity}</span>
                </span>
                <span className="order-item-price">
                  ₹{(Number(item.price_at_order) * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-total-row">
            <span>Total Paid</span>
            <span className="total-amount">₹{Number(order.total_amount).toFixed(0)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions">
          <Link to="/menu" className="btn btn-secondary">Order Again</Link>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;