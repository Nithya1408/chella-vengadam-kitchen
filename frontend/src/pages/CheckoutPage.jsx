import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/api';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, subtotal, gst, total, clearCart, totalItems } = useCart();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    order_type: 'dine-in',
    table_number: '',
    payment_method: 'cash',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Your cart is empty</h2>
            <p>Add some delicious items first.</p>
            <Link to="/menu" className="btn btn-primary">Browse Menu →</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Build the order payload
      const orderData = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        order_type: form.order_type,
        payment_method: form.payment_method,
        notes: form.notes 
          ? `${form.notes} | Customer: ${form.customer_name} | Phone: ${form.customer_phone}`
          : null,
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      };

      const response = await createOrder(orderData);
      
      if (response.success) {
        // Clear cart and go to confirmation page
        clearCart();
        navigate(`/order-confirmed/${response.data.order_id}`, {
          state: { 
            orderNumber: response.data.order_number,
            total: response.data.total_amount,
            customerName: form.customer_name,
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container checkout-container">
        <div className="checkout-header">
          <p className="cart-tag">— பணம் கட்டுங்கள் · CHECKOUT —</p>
          <h1>Almost <span className="italic">there!</span></h1>
          <p className="checkout-subtitle">A few details and we'll start cooking 🌸</p>
        </div>

        <form onSubmit={handleSubmit} className="checkout-grid">
          {/* LEFT: Form */}
          <div className="checkout-form">
            <div className="form-card">
              <h3>Your Details</h3>
              <div className="form-row">
                <label>
                  <span>Full Name *</span>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Nithya"
                    required
                  />
                </label>
                <label>
                  <span>Phone *</span>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="form-card">
              <h3>Order Type</h3>
              <div className="radio-group">
                <label className={`radio-card ${form.order_type === 'dine-in' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="order_type"
                    value="dine-in"
                    checked={form.order_type === 'dine-in'}
                    onChange={handleChange}
                  />
                  <span className="radio-emoji">🍽️</span>
                  <span className="radio-label">Dine-in</span>
                  <span className="radio-sub">Eat at the restaurant</span>
                </label>
                <label className={`radio-card ${form.order_type === 'takeaway' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="order_type"
                    value="takeaway"
                    checked={form.order_type === 'takeaway'}
                    onChange={handleChange}
                  />
                  <span className="radio-emoji">🛍️</span>
                  <span className="radio-label">Takeaway</span>
                  <span className="radio-sub">Pick up yourself</span>
                </label>
                <label className={`radio-card ${form.order_type === 'delivery' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="order_type"
                    value="delivery"
                    checked={form.order_type === 'delivery'}
                    onChange={handleChange}
                  />
                  <span className="radio-emoji">🛵</span>
                  <span className="radio-label">Delivery</span>
                  <span className="radio-sub">Bring it to me</span>
                </label>
              </div>
            </div>

            <div className="form-card">
              <h3>Payment Method</h3>
              <div className="radio-group horizontal">
                <label className={`radio-pill ${form.payment_method === 'cash' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={form.payment_method === 'cash'}
                    onChange={handleChange}
                  />
                  💵 Cash
                </label>
                <label className={`radio-pill ${form.payment_method === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={form.payment_method === 'upi'}
                    onChange={handleChange}
                  />
                  📱 UPI
                </label>
                <label className={`radio-pill ${form.payment_method === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={form.payment_method === 'card'}
                    onChange={handleChange}
                  />
                  💳 Card
                </label>
              </div>
            </div>

            <div className="form-card">
              <h3>Special Requests</h3>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any allergies, less spice, extra napkins, birthday surprise...?"
                rows="3"
              ></textarea>
            </div>

            {error && (
              <div className="checkout-error">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky order summary */}
          <aside className="checkout-summary">
            <h3 className="summary-title">Your Order ({totalItems} items)</h3>

            <div className="summary-items">
              {cart.map(item => (
                <div key={item.item_id} className="summary-item-row">
                  <span className="summary-item-name">
                    <span className={`diet-mini ${item.is_veg ? 'veg' : 'non-veg'}`}></span>
                    {item.name}
                    <span className="summary-qty">× {item.quantity}</span>
                  </span>
                  <span className="summary-item-price">
                    ₹{(Number(item.price) * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="summary-row muted">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(0)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>

            <button 
              type="submit"
              className="btn btn-primary place-order-btn"
              disabled={submitting}
            >
              {submitting ? '🍳 Placing order...' : 'Place Order 🌸'}
            </button>

            <Link to="/cart" className="back-link">
              ← Back to cart
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;