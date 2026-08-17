import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchProviderBookings, updateBookingStatus } from '../api';
import './ProviderRequests.css';
import '../components/ProviderDashboard.css'; // Reuse header styles

// Shared Icons
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const RequestsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const ClockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MapPinIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

const StatStarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const BookingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

const ProviderRequests = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Pending');
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        if (!token) { navigate('/login'); return; }

        const loadRequests = async () => {
            try {
                const data = await fetchProviderBookings(userId, token);
                setRequests(data);
            } catch (error) {
                console.error("Failed to load requests", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRequests();
    }, [navigate]);

    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateBookingStatus(id, 'Accepted', token);
            setRequests(requests.map(req => req._id === id ? { ...req, status: 'Accepted' } : req));
        } catch (error) {
            console.error(error);
        }
    };

    const handleReject = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateBookingStatus(id, 'Cancelled', token);
            setRequests(requests.map(req => req._id === id ? { ...req, status: 'Cancelled' } : req));
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateBookingStatus(id, newStatus, token);
            setRequests(requests.map(req => req._id === id ? { ...req, status: newStatus } : req));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        if (activeFilter === 'All') return true;
        return req.status === activeFilter;
    });

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Requests...</h2>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Reused Header */}
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
                    <Link to="/provider/requests" className="header-link active">
                        <RequestsIcon /> Requests
                    </Link>
                    <Link to="/provider/bookings" className="header-link">
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
                <div className="page-header">
                    <h1>Service Requests</h1>
                    <p className="page-subtitle">Manage incoming service requests and track ongoing jobs</p>
                </div>

                <div className="filter-bar">
                    {['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map(filter => (
                        <button
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                    <button
                        className={`filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('All')}
                    >
                        All History
                    </button>
                </div>

                <div className="requests-grid">
                    {filteredRequests.length > 0 ? (
                        filteredRequests.map(req => (
                            <div key={req._id} className="request-full-card">
                                <div className="card-header">
                                    <h3 className="service-title">{req.service || 'Service'}</h3>
                                    <span className="price-tag">₹{req.price}</span>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <UserIcon /> <span>{'Customer'}</span>
                                    </div>
                                    <div className="info-row">
                                        <ClockIcon /> <span>{req.date} at {req.time}</span>
                                    </div>
                                    <div className="info-row">
                                        <MapPinIcon /> <span>{'Pending Address'}</span>
                                    </div>
                                    <div>
                                        <span className={`status-badge-lg status-${req.status.toLowerCase().replace(' ', '-')}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {req.status === 'Pending' && (
                                        <>
                                            <button className="action-btn btn-primary" onClick={() => handleAccept(req._id)}>Accept</button>
                                            <button className="action-btn btn-secondary" onClick={() => handleReject(req._id)}>Reject</button>
                                        </>
                                    )}
                                    {req.status === 'Accepted' && (
                                        <button className="action-btn btn-primary" onClick={() => handleStatusChange(req._id, 'In Progress')}>Start Job</button>
                                    )}
                                    {req.status === 'In Progress' && (
                                        <button className="action-btn btn-primary" onClick={() => handleStatusChange(req._id, 'Completed')}>Mark Completed</button>
                                    )}

                                    <button className="action-btn btn-outline" onClick={() => navigate(`/booking/${req._id}`)}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <h3>No {activeFilter.toLowerCase()} requests found</h3>
                            <p>When you receive new requests, they will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProviderRequests;
