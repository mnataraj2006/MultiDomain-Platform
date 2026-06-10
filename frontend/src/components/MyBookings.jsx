import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyBookings.css'; // Styling
import './CustomerDashboard.css'; // Shared styles
import { fetchUserBookings, cancelBooking } from '../api';
import Navbar from './Navbar';

// Icons using simplified SVG
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);
const SearchIcon = () => <svg className="search-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

const MyBookings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId') || 'u1'; // Default backup for now

        if (!token) {
            navigate('/login');
            return;
        }

        const loadBookings = async () => {
            try {
                const data = await fetchUserBookings(userId, token);
                // Map DB fields to UI fields if necessary
                const formatted = data.map(b => ({
                    id: b._id, // Mongo ID
                    displayId: `BK-${b._id.substr(-4)}`,
                    service: b.service,
                    provider: b.providerName,
                    date: b.date,
                    time: b.time,
                    status: b.status
                }));
                setBookings(formatted);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        loadBookings();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleCancel = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                const token = localStorage.getItem('authToken');
                await cancelBooking(bookingId, token);
                // Optimistic UI Update
                setBookings(prev => prev.map(booking =>
                    booking.id === bookingId ? { ...booking, status: 'Cancelled' } : booking
                ));
            } catch (e) {
                alert('Failed to cancel booking');
            }
        }
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'All' || booking.status === filter;
        const matchesSearch = booking.service.toLowerCase().includes(search.toLowerCase()) ||
            booking.id.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return (
        <div className="bookings-container">
            <div className="loader-container" style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader"></div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <Navbar active="my-bookings" />

            <main className="dashboard-content">
                {/* Header */}
                <div className="bookings-header-card">
                    <div className="header-text">
                        <h1>My Bookings</h1>
                        <p>View and manage your service bookings</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filter-bar">
                    <div className="filter-tabs">
                        {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                className={`filter-tab ${filter === status ? 'active' : ''}`}
                                onClick={() => setFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="search-box-sm">
                        <SearchIcon />
                        <input
                            type="text"
                            className="search-input-sm"
                            placeholder="Search by Service or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="bookings-list">
                    {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-item-card">
                            <div className="b-info">
                                <h3>{booking.service}</h3>
                                <span className="b-id">ID: {booking.displayId}</span>
                            </div>

                            <div className="b-meta">
                                <span>{booking.date} at {booking.time}</span>
                                <span>Provider: <strong>{booking.provider}</strong></span>
                            </div>

                            <div className={`status-badge status-${booking.status.toLowerCase().replace(' ', '-')}`}>
                                {booking.status}
                            </div>

                            <div className="b-actions">
                                <button onClick={() => navigate(`/booking/${booking.id}`)} className="btn-view">
                                    View Details
                                </button>
                                {booking.status === 'Pending' && (
                                    <button onClick={() => handleCancel(booking.id)} className="btn-cancel">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="bookings-empty">
                            <h3>No bookings found</h3>
                            <p>You haven't booked any services yet.</p>
                            <Link to="/services" className="primary-btn" style={{ display: 'inline-flex', width: 'auto', gap: '0.5rem' }}>
                                <PlusIcon /> Book a Service
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyBookings;
