import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchProviderBookings, updateBookingStatus } from '../api';
import './ProviderBookings.css';
import '../components/ProviderDashboard.css'; // For shared header

// Icons
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const RequestsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const BookingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MapPinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

const ProviderBookings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token) navigate('/login');

        const loadBookings = async () => {
            try {
                const data = await fetchProviderBookings(userId, token);
                setBookings(data);
            } catch (error) {
                console.error("Failed to load bookings", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBookings();
    }, [navigate]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateBookingStatus(id, newStatus, token);
            setBookings(bookings.map(book =>
                book._id === id ? { ...book, status: newStatus } : book
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const filteredBookings = bookings.filter(b => {
        if (activeFilter === 'All') return true;
        return b.status === activeFilter;
    });

    const getStatusClass = (status) => {
        return `status-${status.toLowerCase().replace(' ', '-')}`;
    };

    return (
        <div className="page-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-box-small">
                        <div className="logo-rect-small"></div>
                    </div>
                    <span className="header-brand">MultiDomain Provider</span>
                </div>
                <nav className="header-nav">
                    <Link to="/provider/dashboard" className="header-link">
                        <DashboardIcon /> Dashboard
                    </Link>
                    <Link to="/provider/requests" className="header-link">
                        <RequestsIcon /> Requests
                    </Link>
                    <Link to="/provider/bookings" className="header-link active">
                        <BookingsIcon /> Booking Management
                    </Link>
                    <Link to="/provider/earnings" className="header-link">
                        <DollarIcon /> Earnings
                    </Link>
                    <Link to="/provider/profile" className="header-link">
                        <UserIcon /> Profile
                    </Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">
                    <LogoutIcon /> Logout
                </button>
            </header>

            <main className="content-wrapper">
                <div className="booking-header-card">
                    <h1>Booking Management</h1>
                    <p className="header-subtitle">Manage and update your assigned service bookings</p>
                </div>

                {/* Filter Tabs */}
                <div className="booking-filters">
                    {['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map(filter => (
                        <button
                            key={filter}
                            className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Booking List */}
                {isLoading ? (
                    <div className="dashboard-loading">
                        <div className="loader"></div>
                        <p>Loading Bookings...</p>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <div key={booking._id} className="booking-card">
                                    <span className="booking-id">BK-{booking._id.substr(-4)}</span>
                                    <h3 className="booking-service-title">{booking.service || 'Service'}</h3>

                                    <div className="booking-details">
                                        <div className="detail-item">
                                            <UserIcon /> <span>{'Customer'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <ClockIcon /> <span>{booking.date} at {booking.time}</span>
                                        </div>
                                        <div className="detail-item">
                                            <MapPinIcon /> <span>{booking.location || 'Pending Address'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    {/* Action Buttons Logic */}
                                    <div className="card-actions">
                                        {booking.status === 'Pending' && (
                                            <>
                                                <button className="btn-action primary-action" onClick={() => handleUpdateStatus(booking._id, 'Accepted')}>Accept</button>
                                                <button className="btn-action secondary-action" onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}>Reject</button>
                                            </>
                                        )}
                                        {booking.status === 'Accepted' && (
                                            <button className="btn-action primary-action" onClick={() => handleUpdateStatus(booking._id, 'In Progress')}>Mark In Progress</button>
                                        )}
                                        {booking.status === 'In Progress' && (
                                            <button className="btn-action primary-action" onClick={() => handleUpdateStatus(booking._id, 'Completed')}>Mark Completed</button>
                                        )}
                                        {(booking.status === 'Completed' || booking.status === 'Cancelled') && (
                                            <button className="btn-action secondary-action" onClick={() => navigate(`/booking/${booking._id}`)}>View Details</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <h3>No bookings found</h3>
                                <p>There are no bookings in the {activeFilter} category.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProviderBookings;
