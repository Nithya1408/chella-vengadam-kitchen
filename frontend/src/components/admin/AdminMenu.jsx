import { useState, useEffect, useMemo } from 'react';
import { fetchAdminMenu, toggleMenuAvailability } from '../../api/api';
import './AdminMenu.css';

function AdminMenu() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showOnly, setShowOnly] = useState('all'); // 'all' | 'available' | 'unavailable'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetchAdminMenu();
      setItems(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleToggle = async (itemId, currentlyAvailable) => {
    setToggling(itemId);
    // Optimistic update for snappy UI
    setItems(prev => prev.map(i =>
      i.item_id === itemId ? { ...i, is_available: !currentlyAvailable } : i
    ));
    try {
      await toggleMenuAvailability(itemId, !currentlyAvailable);
    } catch (err) {
      // Rollback on error
      setItems(prev => prev.map(i =>
        i.item_id === itemId ? { ...i, is_available: currentlyAvailable } : i
      ));
      alert('Failed to update availability');
    } finally {
      setToggling(null);
    }
  };

  // Filter and group
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (showOnly === 'available' && !item.is_available) return false;
      if (showOnly === 'unavailable' && item.is_available) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, showOnly]);

  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const key = item.category_name || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredItems]);

  const totalAvailable = items.filter(i => i.is_available).length;
  const totalUnavailable = items.filter(i => !i.is_available).length;

  return (
    <div>
      <div className="tab-header">
        <p className="tab-tag">— மெனு · MENU MANAGEMENT —</p>
        <h1 className="tab-title">
          Manage <span className="italic">dishes</span>
        </h1>
        <p className="tab-subtitle">
          Toggle availability when ingredients run out — changes are live instantly
        </p>
      </div>

      {/* Summary stats */}
      <div className="menu-summary">
        <div className="summary-stat">
          <span className="stat-num">{items.length}</span>
          <span className="stat-label">Total dishes</span>
        </div>
        <div className="summary-stat">
          <span className="stat-num green">{totalAvailable}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="summary-stat">
          <span className="stat-num red">{totalUnavailable}</span>
          <span className="stat-label">Hidden</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="menu-filter-bar">
        <div className="menu-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          <button
            className={`filter-pill ${showOnly === 'all' ? 'active' : ''}`}
            onClick={() => setShowOnly('all')}
          >
            All ({items.length})
          </button>
          <button
            className={`filter-pill ${showOnly === 'available' ? 'active' : ''}`}
            onClick={() => setShowOnly('available')}
          >
            Available ({totalAvailable})
          </button>
          <button
            className={`filter-pill ${showOnly === 'unavailable' ? 'active' : ''}`}
            onClick={() => setShowOnly('unavailable')}
          >
            Hidden ({totalUnavailable})
          </button>
        </div>
      </div>

      {loading && <p className="admin-loading">🌸 Loading menu...</p>}
      {error && <p className="admin-empty">⚠️ {error}</p>}

      {!loading && !error && filteredItems.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">🍽️</div>
          <p>No dishes match this filter.</p>
        </div>
      )}

      {!loading && !error && Object.keys(groupedByCategory).map(catName => (
        <div key={catName} className="menu-category-section">
          <h3 className="menu-cat-header">
            {catName}
            <span className="cat-count">{groupedByCategory[catName].length}</span>
          </h3>
          <div className="menu-items-list">
            {groupedByCategory[catName].map(item => (
              <div 
                key={item.item_id} 
                className={`menu-item-row ${!item.is_available ? 'unavailable' : ''}`}
              >
                <span 
                  className={`diet-dot-indicator ${item.is_veg ? 'veg' : 'non-veg'}`}
                  title={item.is_veg ? 'Vegetarian' : 'Non-vegetarian'}
                >
                  <span className="dot-inner"></span>
                </span>

                <div className="mi-info">
                  <p className="mi-name">{item.name}</p>
                  <p className="mi-desc">{item.description}</p>
                </div>

                <p className="mi-price">₹{Number(item.price).toFixed(0)}</p>

                <label className="toggle-switch" title={item.is_available ? 'Available' : 'Hidden from menu'}>
                  <input
                    type="checkbox"
                    checked={item.is_available}
                    disabled={toggling === item.item_id}
                    onChange={() => handleToggle(item.item_id, item.is_available)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminMenu;