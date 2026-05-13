import { useState, useEffect, useMemo } from 'react';
import { fetchMenu, fetchCategories } from '../api/api';
import MenuCard from '../components/MenuCard';
import './MenuPage.css';

// Tamil translations for category names (display only)
const categoryTamil = {
  'Tiffin': 'டிஃபன்',
  'Starters': 'தொடக்கம்',
  'Mains': 'பிரதான உணவு',
  'Breads': 'ரொட்டிகள்',
  'Gravies & Sides': 'குழம்பு & பக்க உணவு',
  'Rice & Biryani': 'அரிசி & பிரியாணி',
  'Desserts': 'இனிப்புகள்',
  'Beverages': 'பானங்கள்',
};

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegFilter, setVegFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [menuRes, catRes] = await Promise.all([
          fetchMenu(),
          fetchCategories()
        ]);
        setMenuItems(menuRes.data);
        setCategories(catRes.data);
        setError(null);
      } catch (err) {
        setError('Could not load the menu. Make sure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;
      if (vegFilter === 'veg' && !item.is_veg) return false;
      if (vegFilter === 'non-veg' && item.is_veg) return false;
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [menuItems, selectedCategory, vegFilter, searchTerm]);

  // Group filtered items by category
  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      const cat = item.category_name || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Get categories in display order
  const orderedCategoryNames = useMemo(() => {
    return categories
      .map(c => c.name)
      .filter(name => groupedByCategory[name] && groupedByCategory[name].length > 0);
  }, [categories, groupedByCategory]);

  return (
    <div className="menu-page">
      {/* Hero strip */}
      <section className="menu-hero">
        <div className="container">
          <p className="hero-tag">— எங்கள் சிறப்பு உணவுகள் —</p>
          <h1>The <span className="italic">Menu</span></h1>
          <p className="menu-hero-subtitle">
            From slow-simmered Chettinad classics to delicate temple desserts —
            every dish tells a story of Tamil heritage.
          </p>
        </div>
      </section>

      {/* Filters bar */}
      <section className="menu-filters">
        <div className="container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for a dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-pills">
            <button
              className={`pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.category_id}
                className={`pill ${selectedCategory === cat.category_id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.category_id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="veg-toggle">
            <button
              className={`veg-btn ${vegFilter === 'all' ? 'active' : ''}`}
              onClick={() => setVegFilter('all')}
            >
              All
            </button>
            <button
              className={`veg-btn ${vegFilter === 'veg' ? 'active' : ''}`}
              onClick={() => setVegFilter('veg')}
            >
              <span className="diet-dot veg-dot"></span> Veg
            </button>
            <button
              className={`veg-btn ${vegFilter === 'non-veg' ? 'active' : ''}`}
              onClick={() => setVegFilter('non-veg')}
            >
              <span className="diet-dot non-veg-dot"></span> Non-veg
            </button>
          </div>
        </div>
      </section>

      {/* Categorized menu */}
      <section className="menu-grid-section">
        <div className="container">
          {loading && (
            <div className="state-message"><p>🌸 Loading the menu...</p></div>
          )}

          {error && (
            <div className="state-message error"><p>⚠️ {error}</p></div>
          )}

          {!loading && !error && (
            <>
              <p className="result-count">
                Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'dish' : 'dishes'}
              </p>

              {filteredItems.length === 0 ? (
                <div className="state-message">
                  <p>No dishes match your filters. Try clearing them.</p>
                </div>
              ) : (
                orderedCategoryNames.map(catName => {
                  const items = groupedByCategory[catName];
                  const vegItems = items.filter(i => i.is_veg);
                  const nonVegItems = items.filter(i => !i.is_veg);

                  return (
                    <div key={catName} className="category-section">
                      <div className="category-header">
                        <div className="category-divider"></div>
                        <div className="category-titles">
                          <p className="category-tamil">{categoryTamil[catName] || ''}</p>
                          <h2 className="category-name">{catName}</h2>
                          <p className="category-count">{items.length} dishes</p>
                        </div>
                        <div className="category-divider"></div>
                      </div>

                      {vegItems.length > 0 && (
                        <div className="subcategory">
                          <div className="subcategory-label veg-label">
                            <span className="diet-dot veg-dot"></span>
                            <span>Vegetarian · சைவம்</span>
                            <span className="subcategory-count">({vegItems.length})</span>
                          </div>
                          <div className="menu-list">
                            {vegItems.map(item => (
                              <MenuCard key={item.item_id} item={item} />
                            ))}
                          </div>
                        </div>
                      )}

                      {nonVegItems.length > 0 && (
                        <div className="subcategory">
                          <div className="subcategory-label non-veg-label">
                            <span className="diet-dot non-veg-dot"></span>
                            <span>Non-Vegetarian · அசைவம்</span>
                            <span className="subcategory-count">({nonVegItems.length})</span>
                          </div>
                          <div className="menu-list">
                            {nonVegItems.map(item => (
                              <MenuCard key={item.item_id} item={item} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default MenuPage;