import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    gst,
    total,
  } = useCart();

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🌸</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet. Let's fix that.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse the Menu →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container cart-container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <p className="cart-tag">— உங்கள் ஆர்டர் · YOUR ORDER —</p>
            <h1>Your <span className="italic">Cart</span></h1>
            <p className="cart-subtitle">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} ready to be cooked
            </p>
          </div>
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear cart
          </button>
        </div>

        <div className="cart-grid">
          {/* Items list */}
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.item_id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name-row">
                    <span 
                      className={`diet-dot-indicator ${item.is_veg ? 'veg' : 'non-veg'}`}
                      title={item.is_veg ? 'Vegetarian' : 'Non-vegetarian'}
                    >
                      <span className="dot-inner"></span>
                    </span>
                    <h3 className="cart-item-name">{item.name}</h3>
                  </div>
                  <p className="cart-item-price-each">₹{Number(item.price).toFixed(0)} each</p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn qty-minus"
                      onClick={() => decreaseQuantity(item.item_id)}
                    >−</button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn qty-plus"
                      onClick={() => increaseQuantity(item.item_id)}
                    >+</button>
                  </div>

                  <p className="cart-item-subtotal">
                    ₹{(Number(item.price) * item.quantity).toFixed(0)}
                  </p>

                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item.item_id)}
                    aria-label={`Remove ${item.name}`}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary card */}
          <aside className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>

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
              className="btn btn-primary checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout →
            </button>

            <Link to="/menu" className="continue-link">
              ← Continue browsing menu
            </Link>

            <div className="summary-note">
              <span>🌿</span>
              <p>Your order will be prepared fresh. Estimated time depends on items selected.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CartPage;