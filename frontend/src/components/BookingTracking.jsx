import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBookingDetails } from '../api';
import './BookingTracking.css';

// Icons
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const BookingTracking = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadBooking = async () => {
            try {
                const data = await fetchBookingDetails(bookingId, token);
                const history = [
                    { status: "Booking Confirmed", time: new Date(data.createdAt).toLocaleDateString(), active: true, completed: true },
                    { status: "Provider Accepted", time: data.status === 'Pending' ? "Waiting..." : "Completed", active: data.status === 'Accepted', completed: ['Accepted', 'In Progress', 'Completed'].includes(data.status) },
                    { status: "In Progress", time: "--:--", active: data.status === 'In Progress', completed: ['In Progress', 'Completed'].includes(data.status) },
                    { status: "Completed", time: "--:--", active: data.status === 'Completed', completed: data.status === 'Completed' }
                ];

                setBooking({
                    id: data._id,
                    service: data.service,
                    provider: data.providerName,
                    date: data.date,
                    time: data.time,
                    status: data.status,
                    location: "Online/Specified Address",
                    history
                });
            } catch (error) {
                console.error("Failed to load booking details", error);
            }
        };

        loadBooking();
    }, [bookingId, navigate]);

    if (!booking) return <div className="tracking-container"><div className="loader" style={{ margin: 'auto' }}></div></div>;

    return (
        <div className="tracking-container">
            <nav className="navbar-book">
                <Link to="/" className="nav-brand"><LogoIcon /><span>MultiDomain</span></Link>
                <Link to="/customer-dashboard" className="nav-link">Back to Dashboard</Link>
            </nav>

            <div className="tracking-content">
                <div className="tracking-card">
                    <div className="tracking-header">
                        <div className="header-title">
                            <h1>Booking Status</h1>
                            <span className="booking-id">ID: {booking.id}</span>
                        </div>
                        <div className={`status-badge-lg badge-${booking.status.toLowerCase()}`}>
                            {booking.status}
                        </div>
                    </div>

                    <div className="timeline-section">
                        {booking.history.map((step, idx) => (
                            <div key={idx} className={`timeline-item ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}>
                                <div className="timeline-icon">
                                    {step.active || step.completed ? <CheckIcon /> : <ClockIcon />}
                                </div>
                                <div className="timeline-content">
                                    <h4>{step.status}</h4>
                                    <p className="timeline-time">{step.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <label>Service</label>
                            <p>{booking.service}</p>
                        </div>
                        <div className="info-item">
                            <label>Provider</label>
                            <p>{booking.provider}</p>
                        </div>
                        <div className="info-item">
                            <label>Date & Time</label>
                            <p>{booking.date} at {booking.time}</p>
                        </div>
                        <div className="info-item">
                            <label>Location</label>
                            <p>{booking.location}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        {booking.status === 'Pending' && (
                            <button className="secondary-btn" style={{ color: 'var(--error-red)', borderColor: 'var(--error-red)' }}>Cancel Booking</button>
                        )}
                        <button className="primary-btn" disabled>Contact Provider</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingTracking;
