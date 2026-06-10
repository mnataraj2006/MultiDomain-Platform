import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminBookings.css';
import './AdminUsers.css'; // Shared basic styles
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';
import { fetchAllBookings, cancelBooking } from '../api';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

const AdminBookings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadBookings = async () => {
            try {
                const data = await fetchAllBookings(token);
                const formatted = data.map(b => ({
                    id: b._id,
                    displayId: `BK-${b._id.substr(-4)}`,
                    service: b.service,
                    domain: b.domain,
                    customer: 'Customer', // Would require populating customer name in backend if not already done
                    provider: b.providerName,
                    date: b.date,
                    time: b.time,
                    status: b.status
                }));
                setBookings(formatted);
            } catch (error) {
                console.error("Failed to fetch all bookings", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBookings();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleCancel = async (id) => {
        if (window.confirm(`Are you sure you want to force cancel booking ${id}?`)) {
            try {
                const token = localStorage.getItem('authToken');
                await cancelBooking(id, token);
                setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
            } catch (error) {
                console.error("Failed to cancel booking", error);
            }
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFilter = activeFilter === 'All'
            ? true
            : activeFilter === 'Active'
                ? ['Pending', 'Accepted', 'In Progress'].includes(b.status)
                : b.status === activeFilter;

        const matchesSearch =
            b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.provider.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Platform Bookings...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="bookings" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Bookings Monitoring</h1>
                        <p className="page-subtitle">Track and monitor all service bookings across the platform</p>
                    </div>
                </div>

                <div className="controls-bar">
                    <div className="filter-group">
                        {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map(filter => (
                            <button
                                key={filter}
                                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="search-box">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by ID, Customer or Provider..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bookings-table-container">
                    <table className="admin-booking-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Service</th>
                                <th>Customer / Provider</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td className="booking-id-cell">{booking.displayId}</td>
                                        <td className="service-cell">
                                            <h4>{booking.service}</h4>
                                            <span>{booking.domain}</span>
                                        </td>
                                        <td className="entity-cell">
                                            <h4>{booking.customer}</h4>
                                            <span>via {booking.provider}</span>
                                        </td>
                                        <td className="date-cell">
                                            <span>{booking.date}</span>
                                            <span className="date-time">{booking.time}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge-admin admin-status-${booking.status.toLowerCase().replace(' ', '')}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="booking-actions">
                                                <button className="btn-icon" onClick={() => navigate(`/booking/${booking.id}`)} title="View Details">
                                                    <EyeIcon />
                                                </button>
                                                {['Pending', 'Accepted'].includes(booking.status) && (
                                                    <button
                                                        className="btn-text"
                                                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                                                        onClick={() => handleCancel(booking.id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                        No bookings found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminBookings;
