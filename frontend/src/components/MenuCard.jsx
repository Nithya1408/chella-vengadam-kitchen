import './MenuCard.css';

function MenuCard({ item }) {
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
        <button className="add-btn">Add +</button>
      </div>
    </div>
  );
}

export default MenuCard;