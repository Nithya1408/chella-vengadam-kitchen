import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import AdminReservations from '../components/admin/AdminReservations';
import AdminMenu from '../components/admin/AdminMenu';
import AdminInventory from '../components/admin/AdminInventory';
import './AdminPage.css';

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: '📊', tamil: 'மேலோட்டம்' },
  { id: 'orders',       label: 'Orders',       icon: '📋', tamil: 'ஆர்டர்கள்' },
  { id: 'reservations', label: 'Reservations', icon: '🪑', tamil: 'முன்பதிவுகள்' },
  { id: 'menu',         label: 'Menu',         icon: '🍽️', tamil: 'மெனு' },
  { id: 'inventory',    label: 'Inventory',    icon: '📦', tamil: 'சரக்கு' },
];

function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':     return <AdminOverview />;
      case 'orders':       return <AdminOrders />;
      case 'reservations': return <AdminReservations />;
      case 'menu':         return <AdminMenu />;
      case 'inventory':    return <AdminInventory />;
      default:             return <AdminOverview />;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="brand-mark">🌸</span>
            <div>
              <p className="brand-tamil">செல்லா வேங்கடம்</p>
              <p className="brand-name">Admin Dashboard</p>
            </div>
          </div>

          <nav className="admin-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <div className="nav-label-wrap">
                  <span className="nav-label">{tab.label}</span>
                  <span className="nav-tamil">{tab.tamil}</span>
                </div>
              </button>
            ))}
          </nav>

          <div className="admin-user-card">
            <div className="user-avatar-large">
              {user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <p className="user-name">{user?.name}</p>
              <p className="user-role">Admin</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="admin-content">
          {renderTab()}
        </main>
      </div>
    </div>
  );
}

export default AdminPage;