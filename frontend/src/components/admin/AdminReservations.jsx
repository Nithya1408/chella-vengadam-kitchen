import { useState, useEffect } from 'react';
import { fetchAdminReservations, updateReservationStatus } from '../../api/api';
import './AdminReservations.css';

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending',    color: 'gray' },
  { value: 'confirmed',  label: 'Confirmed',  color: 'green' },
  { value: 'completed',  label: 'Completed',  color: 'purple' },
  { value: 'cancelled',  label: 'Cancelled',  color: 'red' },
];

const TIME_FILTERS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past',     label: 'Past' },
  { value: 'all',      label: 'All' },
];

function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  async function load(filterValue = timeFilter) {
    try {
      setLoading(true);
      const res = await fetchAdminReservations(filterValue);
      setReservations(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(timeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateReservationStatus(id, newStatus);
      await load(timeFilter);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (timeString) => {
    const [h, m] = timeString.split(':');
    const hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${period}`;
  };

  const getStatusColor = (status) =>
    STATUS_OPTIONS.find(s => s.value === status)?.color || 'gray';

  return (
    <div>
      <div className="tab-header">
        <p className="tab-tag">— முன்பதிவுகள் · RESERVATIONS —</p>
        <h1 className="tab-title">
          Table <span className="italic">bookings</span>
        </h1>
        <p className="tab-subtitle">Confirm guests, manage cancellations, prepare the kitchen</p>
      </div>

      {/* Time filter pills */}
      <div className="filter-pills">
        {TIME_FILTERS.map(f => (
          <button
            key={f.value}
            className={`filter-pill ${timeFilter === f.value ? 'active' : ''}`}
            onClick={() => setTimeFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="admin-loading">🌸 Loading reservations...</p>}
      {error && <p className="admin-empty">⚠️ {error}</p>}

      {!loading && !error && reservations.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">🪑</div>
          <p>No reservations found for this filter.</p>
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="reservations-grid">
          {reservations.map(r => (
            <div key={r.reservation_id} className="reservation-card">
              <div className="rc-header">
                <div>
                  <p className="rc-number">{r.reservation_number}</p>
                  <p className="rc-guest">{r.guest_name}</p>
                </div>
                <div className="rc-status-wrap">
                  <span className={`status-dot ${getStatusColor(r.status)}`}></span>
                  <select
                    className={`status-select status-${getStatusColor(r.status)}`}
                    value={r.status}
                    disabled={updating === r.reservation_id}
                    onChange={(e) => handleStatusChange(r.reservation_id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rc-meta">
                <div className="meta-row">
                  <span className="meta-ico">📅</span>
                  <span>{formatDate(r.reservation_date)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-ico">🕐</span>
                  <span>{formatTime(r.reservation_time)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-ico">🪑</span>
                  <span>Table {r.table_number || '—'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-ico">👥</span>
                  <span>{r.party_size} {r.party_size === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>

              {(r.guest_phone || r.notes) && (
                <div className="rc-footer">
                  {r.guest_phone && (
                    <p className="rc-phone">📞 {r.guest_phone}</p>
                  )}
                  {r.notes && (
                    <p className="rc-notes">"{r.notes}"</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminReservations;