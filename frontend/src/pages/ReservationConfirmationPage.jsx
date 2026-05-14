import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchReservationById } from '../api/api';
import './ReservationConfirmationPage.css';

function ReservationConfirmationPage() {
  const { reservationId } = useParams();
  const location = useLocation();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const stateData = location.state;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchReservationById(reservationId);
        setReservation(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reservationId]);

  if (loading) {
    return (
      <div className="reservation-confirm-page">
        <div className="container">
          <p className="loading">🌸 Loading reservation...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="reservation-confirm-page">
        <div className="container">
          <p>Reservation not found.</p>
          <Link to="/reserve" className="btn btn-primary">Book a Table</Link>
        </div>
      </div>
    );
  }

  const reservationNumber = stateData?.reservationNumber || `RV${String(reservation.reservation_id).padStart(5, '0')}`;
  const guestName = stateData?.guestName || reservation.guest_name || 'friend';
  const tableNumber = stateData?.tableNumber || reservation.table_number;

  // Format date and time nicely
  const formattedDate = new Date(reservation.reservation_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formatTime = (timeString) => {
    const [h, m] = timeString.split(':');
    const hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${period}`;
  };

  return (
    <div className="reservation-confirm-page">
      <div className="container confirm-container">
        {/* Celebration */}
        <div className="celebration">
          <div className="celebration-icon">🌸</div>
          <p className="celebration-tag">— முன்பதிவு உறுதியானது · RESERVATION CONFIRMED —</p>
          <h1>
            See you soon,<br />
            <span className="italic">{guestName}!</span>
          </h1>
          <p className="celebration-subtitle">
            Your table is reserved. We're already excited to welcome you. 🪔
          </p>
        </div>

        {/* Reservation card */}
        <div className="reservation-card">
          <div className="reservation-card-header">
            <div>
              <p className="reservation-label">RESERVATION NUMBER</p>
              <p className="reservation-number">{reservationNumber}</p>
            </div>
            <div className="status-badge confirmed">
              ✓ Confirmed
            </div>
          </div>

          <div className="reservation-grid-display">
            <div className="grid-item">
              <span className="grid-icon">📅</span>
              <div>
                <p className="grid-key">DATE</p>
                <p className="grid-value">{formattedDate}</p>
              </div>
            </div>

            <div className="grid-item">
              <span className="grid-icon">🕐</span>
              <div>
                <p className="grid-key">TIME</p>
                <p className="grid-value">{formatTime(reservation.reservation_time)}</p>
              </div>
            </div>

            <div className="grid-item">
              <span className="grid-icon">🪑</span>
              <div>
                <p className="grid-key">TABLE</p>
                <p className="grid-value">Table {tableNumber}</p>
              </div>
            </div>

            <div className="grid-item">
              <span className="grid-icon">👥</span>
              <div>
                <p className="grid-key">PARTY SIZE</p>
                <p className="grid-value">
                  {reservation.party_size} {reservation.party_size === 1 ? 'guest' : 'guests'}
                </p>
              </div>
            </div>
          </div>

          {reservation.notes && (
            <div className="reservation-notes">
              <p className="notes-label">Special requests:</p>
              <p className="notes-text">{reservation.notes}</p>
            </div>
          )}

          <div className="reservation-tips">
            <p className="tips-title">A few things to know:</p>
            <ul>
              <li>🌿 Please arrive 5 minutes before your slot</li>
              <li>📞 Need to cancel? Call us at least 1 hour before</li>
              <li>🎂 Birthdays or anniversaries? Let our staff know — we love surprises</li>
            </ul>
          </div>
        </div>

        <div className="confirm-actions">
          <Link to="/menu" className="btn btn-secondary">Browse Menu</Link>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ReservationConfirmationPage;