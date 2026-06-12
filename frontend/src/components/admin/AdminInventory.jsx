import { useState, useEffect, useMemo } from 'react';
import { fetchAdminInventory, updateInventory } from '../../api/api';
import './AdminInventory.css';

function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState('');
  const [showOnly, setShowOnly] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit state — which card is being edited + the editable values
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editReorder, setEditReorder] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetchAdminInventory();
      setInventory(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const startEdit = (item) => {
    setEditingId(item.inventory_id);
    setEditQty(String(item.quantity));
    setEditReorder(String(item.reorder_level));
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQty('');
    setEditReorder('');
    setEditError(null);
  };

  const saveEdit = async (id) => {
    setSaving(true);
    setEditError(null);
    try {
      const res = await updateInventory(id, {
        quantity: Number(editQty),
        reorder_level: Number(editReorder),
      });
      // Update local state with returned row
      setInventory(prev => prev.map(i => 
        i.inventory_id === id ? res.data : i
      ));
      setEditingId(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Quick-add buttons for common restock amounts
  const quickAdd = (amount) => {
    const current = Number(editQty) || 0;
    setEditQty(String(current + amount));
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      if (showOnly === 'low' && !item.low_stock) return false;
      if (showOnly === 'ok' && item.low_stock) return false;
      if (search && !item.ingredient_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [inventory, search, showOnly]);

  const lowStockCount = inventory.filter(i => i.low_stock).length;
  const okStockCount = inventory.length - lowStockCount;

  const getStockHealth = (item) => {
    const ratio = item.quantity / (item.reorder_level * 3);
    return Math.min(Math.max(ratio * 100, 5), 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="tab-header">
        <p className="tab-tag">— சரக்கு · INVENTORY —</p>
        <h1 className="tab-title">
          Kitchen <span className="italic">stock</span>
        </h1>
        <p className="tab-subtitle">
          Tap "Update" on any card to restock — quick-add buttons let you add common amounts fast.
        </p>
      </div>

      {/* Summary stats */}
      <div className="inventory-summary">
        <div className="summary-stat">
          <span className="stat-num">{inventory.length}</span>
          <span className="stat-label">Total ingredients</span>
        </div>
        <div className="summary-stat">
          <span className="stat-num green">{okStockCount}</span>
          <span className="stat-label">Good stock</span>
        </div>
        <div className="summary-stat low-stock-stat">
          <span className="stat-num red">{lowStockCount}</span>
          <span className="stat-label">Needs restock</span>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="low-stock-banner">
          ⚠️ <strong>{lowStockCount}</strong> ingredient{lowStockCount > 1 ? 's' : ''} running low — consider restocking soon
        </div>
      )}

      {/* Filter bar */}
      <div className="menu-filter-bar">
        <div className="menu-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          <button className={`filter-pill ${showOnly === 'all' ? 'active' : ''}`} onClick={() => setShowOnly('all')}>
            All ({inventory.length})
          </button>
          <button className={`filter-pill ${showOnly === 'ok' ? 'active' : ''}`} onClick={() => setShowOnly('ok')}>
            Good ({okStockCount})
          </button>
          <button className={`filter-pill ${showOnly === 'low' ? 'active' : ''}`} onClick={() => setShowOnly('low')}>
            Low ({lowStockCount})
          </button>
        </div>
      </div>

      {loading && <p className="admin-loading">🌸 Loading inventory...</p>}
      {error && <p className="admin-empty">⚠️ {error}</p>}

      {!loading && !error && filteredInventory.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">📦</div>
          <p>No ingredients match this filter.</p>
        </div>
      )}

      {!loading && !error && filteredInventory.length > 0 && (
        <div className="inventory-grid">
          {filteredInventory.map(item => {
            const health = getStockHealth(item);
            const isEditing = editingId === item.inventory_id;

            return (
              <div key={item.inventory_id} className={`inventory-card ${item.low_stock ? 'low' : ''} ${isEditing ? 'editing' : ''}`}>
                <div className="inv-header">
                  <h4 className="inv-name">{item.ingredient_name}</h4>
                  {item.low_stock && !isEditing && <span className="low-tag">LOW</span>}
                </div>

                {isEditing ? (
                  /* ============ EDIT MODE ============ */
                  <div className="inv-edit-mode">
                    <label className="edit-field">
                      <span>Current stock ({item.unit})</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        autoFocus
                      />
                    </label>

                    <div className="quick-add-row">
                      <span className="quick-add-label">Quick add:</span>
                      <button type="button" onClick={() => quickAdd(1)}>+1</button>
                      <button type="button" onClick={() => quickAdd(5)}>+5</button>
                      <button type="button" onClick={() => quickAdd(10)}>+10</button>
                      <button type="button" onClick={() => quickAdd(25)}>+25</button>
                    </div>

                    <label className="edit-field">
                      <span>Reorder when below ({item.unit})</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={editReorder}
                        onChange={(e) => setEditReorder(e.target.value)}
                      />
                    </label>

                    {editError && <p className="edit-error">⚠️ {editError}</p>}

                    <div className="edit-actions">
                      <button 
                        className="btn-cancel" 
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-save"
                        onClick={() => saveEdit(item.inventory_id)}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save 🌸'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ============ VIEW MODE ============ */
                  <>
                    <div className="inv-quantity">
                      <span className="qty-num">{Number(item.quantity).toFixed(1)}</span>
                      <span className="qty-unit">{item.unit}</span>
                    </div>

                    <div className="inv-bar">
                      <div
                        className={`inv-bar-fill ${item.low_stock ? 'bar-low' : ''}`}
                        style={{ width: `${health}%` }}
                      ></div>
                    </div>

                    <div className="inv-footer">
                      <span className="inv-reorder">
                        Reorder at: <strong>{Number(item.reorder_level).toFixed(1)} {item.unit}</strong>
                      </span>
                      <span className="inv-date">Last: {formatDate(item.last_restocked)}</span>
                    </div>

                    <button className="update-stock-btn" onClick={() => startEdit(item)}>
                      ✏️ Update stock
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminInventory;