import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTables, checkAvailability, createReservation } from '../api/api';
import './ReservationPage.css';

// Today's date in YYYY-MM-DD format
function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Time slots (lunch + dinner)
const TIME_SLOTS = [
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '21:30', label: '9:30 PM' },
];

function ReservationPage() {
  const navigate = useNavigate();

  // Form state
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(null);

  // Data state
  const [tables, setTables] = useState([]);
  const [bookedTableIds, setBookedTableIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load tables on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchTables();
        setTables(res.data);
      } catch (err) {
        setError('Could not load tables. Make sure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Check availability when date or time changes
  useEffect(() => {
    async function check() {
      if (!date || !time) return;
      setCheckingAvail(true);
      try {
        const res = await checkAvailability(date, time);
        setBookedTableIds(res.booked_table_ids || []);
        // If currently-selected table is now booked, deselect it
        if (selectedTableId && res.booked_table_ids?.includes(selectedTableId)) {
          setSelectedTableId(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAvail(false);
      }
    }
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  // Group tables by capacity for nicer layout
  const groupedTables = useMemo(() => {
    const groups = {};
    tables.forEach(t => {
      if (!groups[t.capacity]) groups[t.capacity] = [];
      groups[t.capacity].push(t);
    });
    return groups;
  }, [tables]);

  // Determine if table is suitable for the party size
  const isTableTooSmall = (table) => table.capacity < partySize;
  const isTableBooked = (table) => bookedTableIds.includes(table.table_id);
  const isTableUnavailable = (table) =>
    isTableBooked(table) || isTableTooSmall(table);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTableId) {
      setError('Please select a table.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await createReservation({
        table_id: selectedTableId,
        guest_name: name,
        guest_phone: phone,
        party_size: partySize,
        reservation_date: date,
        reservation_time: time,
        notes: notes || null,
      });

      if (response.success) {
        navigate(`/reservation-confirmed/${response.data.reservation_id}`, {
          state: {
            reservationNumber: response.data.reservation_number,
            guestName: name,
            tableNumber: response.data.table_number,
            date,
            time,
            partySize,
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reservation failed. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reservation-page">
      {/* Hero */}
      <section className="reservation-hero">
        <div className="container">
          <p className="hero-tag">— இடம் முன்பதிவு · BOOK A TABLE —</p>
          <h1>Reserve your <span className="italic">spot.</span></h1>
          <p className="hero-subtitle">
            Pick a date, time, and table. We'll save it just for you.
          </p>
        </div>
      </section>

      {/* Booking form */}
      <section className="reservation-section">
        <div className="container">
          <form onSubmit={handleSubmit} className="reservation-grid">
            {/* LEFT: Inputs */}
            <div className="reservation-left">
              {/* Date + Time */}
              <div className="form-card">
                <h3>When are you coming?</h3>
                <div className="form-row two-col">
                  <label>
                    <span>Date</span>
                    <input
                      type="date"
                      value={date}
                      min={getTodayISO()}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Time</span>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    >
                      {TIME_SLOTS.map(slot => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Party size */}
              <div className="form-card">
                <h3>How many guests?</h3>
                <div className="party-size-row">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`party-btn ${partySize === size ? 'active' : ''}`}
                      onClick={() => setPartySize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="form-hint">For groups of 9+, please call us</p>
              </div>

              {/* Table picker */}
              <div className="form-card">
                <div className="table-picker-header">
                  <h3>Pick a table</h3>
                  {checkingAvail && <span className="checking-tag">Checking availability...</span>}
                </div>

                <div className="legend">
                  <span className="legend-item"><span className="legend-dot available"></span>Available</span>
                  <span className="legend-item"><span className="legend-dot selected"></span>Selected</span>
                  <span className="legend-item"><span className="legend-dot booked"></span>Booked</span>
                  <span className="legend-item"><span className="legend-dot too-small"></span>Too small</span>
                </div>

                {loading ? (
                  <p className="loading-text">🌸 Loading tables...</p>
                ) : (
                  Object.keys(groupedTables).sort((a, b) => Number(a) - Number(b)).map(cap => (
                    <div key={cap} className="capacity-row">
                      <p className="capacity-label">
                        {cap}-seater · seats {cap}
                      </p>
                      <div className="tables-grid">
                        {groupedTables[cap].map(table => {
                          const unavailable = isTableUnavailable(table);
                          const isBooked = isTableBooked(table);
                          const tooSmall = isTableTooSmall(table);
                          const isSelected = selectedTableId === table.table_id;

                          return (
                            <button
                              key={table.table_id}
                              type="button"
                              disabled={unavailable}
                              onClick={() => !unavailable && setSelectedTableId(table.table_id)}
                              className={`table-card 
                                ${isSelected ? 'selected' : ''} 
                                ${isBooked ? 'booked' : ''} 
                                ${tooSmall && !isBooked ? 'too-small' : ''}
                              `}
                              title={
                                isBooked
                                  ? 'Booked'
                                  : tooSmall
                                  ? `Fits only ${table.capacity} guests`
                                  : `${table.table_number} · seats ${table.capacity}`
                              }
                            >
                              <span className="table-number">{table.table_number}</span>
                              <span className="table-capacity">
                                {Array(table.capacity).fill('🪑').slice(0, 4).join('')}
                                {table.capacity > 4 && `+${table.capacity - 4}`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Contact details */}
              <div className="form-card">
                <h3>Your details</h3>
                <div className="form-row two-col">
                  <label>
                    <span>Full name *</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Nithya"
                      required
                    />
                  </label>
                  <label>
                    <span>Phone *</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      pattern="[0-9]{10}"
                      required
                    />
                  </label>
                </div>
                <label className="full-width">
                  <span>Special requests (optional)</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Birthday, anniversary, dietary restrictions, seating preference..."
                    rows="3"
                  ></textarea>
                </label>
              </div>

              {error && (
                <div className="reservation-error">⚠️ {error}</div>
              )}
            </div>

            {/* RIGHT: Summary */}
            <aside className="reservation-summary">
              <h3 className="summary-title">Booking Summary</h3>

              <div className="summary-block">
                <div className="summary-row">
                  <span className="summary-icon">📅</span>
                  <div>
                    <p className="summary-key">Date</p>
                    <p className="summary-value">
                      {new Date(date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="summary-row">
                  <span className="summary-icon">🕐</span>
                  <div>
                    <p className="summary-key">Time</p>
                    <p className="summary-value">
                      {TIME_SLOTS.find(s => s.value === time)?.label || time}
                    </p>
                  </div>
                </div>

                <div className="summary-row">
                  <span className="summary-icon">👥</span>
                  <div>
                    <p className="summary-key">Party size</p>
                    <p className="summary-value">{partySize} {partySize === 1 ? 'guest' : 'guests'}</p>
                  </div>
                </div>

                <div className="summary-row">
                  <span className="summary-icon">🪑</span>
                  <div>
                    <p className="summary-key">Table</p>
                    <p className="summary-value">
                      {selectedTableId
                        ? tables.find(t => t.table_id === selectedTableId)?.table_number
                        : 'Not selected yet'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary reserve-btn"
                disabled={!selectedTableId || submitting}
              >
                {submitting ? 'Booking...' : 'Confirm Reservation 🌸'}
              </button>

              <p className="summary-note">
                You can cancel up to 1 hour before your slot.
              </p>
            </aside>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ReservationPage;