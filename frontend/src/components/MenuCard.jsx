import { useCart } from '../context/CartContext';
import './MenuCard.css';

function MenuCard({ item }) {
  const { addToCart, increaseQuantity, decreaseQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.item_id);

  return (
    <div className="menu-item">
      <div className="menu-item-main">
        <div className="menu-item-name-row">
          <span 
            className={`diet-dot-indicator ${item.is_veg ? 'veg' : 'non-veg'}`} 
            title={item.is_veg ? 'Vegetarian' : 'Non-vegetarian'}
          >
            <span className="dot-inner"></span>
          </span>
          <h3 className="menu-item-name">{item.name}</h3>
        </div>
        <p className="menu-item-desc">{item.description}</p>
        <span className="menu-item-prep">🕐 {item.prep_time_minutes} min</span>
      </div>
      
      <div className="menu-item-side">
        <p className="menu-item-price">₹{Number(item.price).toFixed(0)}</p>
        
        {quantity === 0 ? (
          <button className="add-btn" onClick={() => addToCart(item)}>
            Add +
          </button>
        ) : (
          <div className="quantity-controls">
            <button 
              className="qty-btn qty-minus" 
              onClick={() => decreaseQuantity(item.item_id)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-display">{quantity}</span>
            <button 
              className="qty-btn qty-plus" 
              onClick={() => increaseQuantity(item.item_id)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuCard;