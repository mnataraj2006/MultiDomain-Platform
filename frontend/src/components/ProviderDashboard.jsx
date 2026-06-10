import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCurrentUser, fetchProviderBookings, updateBookingStatus } from '../api';
import './ProviderDashboard.css';

// SVG Icons (Reusing style from Customer Dashboard)
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const RequestsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

// Stats Icons
const StatRequestIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const StatCheckIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const StatStarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const BookingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [provider, setProvider] = useState({ name: 'Sarah Wilson', domain: 'Electrician', isOnline: true });

    const [stats, setStats] = useState({
        totalRequests: 0,
        completedServices: 0,
        avgRating: 0,
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0
    });

    const [requests, setRequests] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');

        if (!token || role !== 'Provider') {
            navigate('/login');
            return;
        }

        const loadDashboardData = async () => {
            try {
                // Fetch User Info
                const userData = await fetchCurrentUser(token);
                setProvider(prev => ({ ...prev, name: userData.name, domain: userData.domain || 'Service Provider' }));

                // Fetch Real Bookings
                const bookings = await fetchProviderBookings(userId, token);

                const pendingRequests = bookings.filter(b => b.status === 'Pending');
                setRequests(pendingRequests);

                const completed = bookings.filter(b => b.status === 'Completed');
                setRecentActivity(completed.reverse().slice(0, 5));

                const todayDate = new Date();
                const startOfWeek = new Date(todayDate);
                startOfWeek.setDate(todayDate.getDate() - todayDate.getDay());

                let todayEarnings = 0;
                let weekEarnings = 0;
                let monthEarnings = 0;

                completed.forEach(b => {
                    const bDate = new Date(b.date);
                    const price = b.price || 0;
                    if (bDate.getFullYear() === todayDate.getFullYear() && bDate.getMonth() === todayDate.getMonth()) {
                        monthEarnings += price;
                        if (bDate.getDate() === todayDate.getDate()) {
                            todayEarnings += price;
                        }
                    }
                    if (bDate >= startOfWeek && bDate <= todayDate) {
                        weekEarnings += price;
                    }
                });

                setStats({
                    totalRequests: bookings.length,
                    completedServices: completed.length,
                    avgRating: userData.rating || 0,
                    todayEarnings,
                    weekEarnings,
                    monthEarnings
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [navigate]);

    const handleToggleOnline = () => {
        setProvider(prev => ({ ...prev, isOnline: !prev.isOnline }));
        // API call to update status would go here
    };

    const handleAcceptRequest = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateBookingStatus(id, 'Accepted', token);
            setRequests(prev => prev.filter(r => r._id !== id));
            alert(`Request Accepted!`);
        } catch (error) {
            console.error(error);
            alert('Failed to accept request');
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateBookingStatus(id, 'Cancelled', token);
            setRequests(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        // Step 6: Logout
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* 1. Header / Navigation Bar */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-box-small">
                        <div className="logo-rect-small"></div>
                    </div>
                    <span className="header-brand">MultiDomain Provider</span>
                </div>
                <nav className="header-nav">
                    <Link to="/provider/dashboard" className="header-link active">
                        <DashboardIcon /> Dashboard
                    </Link>
                    <Link to="/provider/requests" className="header-link">
                        <RequestsIcon /> Requests
                    </Link>
                    <Link to="/provider/bookings" className="header-link">
                        <BookingsIcon /> Booking Management
                    </Link>
                    <Link to="/provider/earnings" className="header-link">
                        <DollarIcon /> Earnings
                    </Link>
                    <Link to="/provider/analytics" className="header-link">
                        <AnalyticsIcon /> Analytics
                    </Link>
                    <Link to="/provider/profile" className="header-link">
                        <UserIcon /> Profile
                    </Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">
                    <LogoutIcon /> Logout
                </button>
            </header>

            <main className="dashboard-content">
                {/* 2. Welcome & Status Overview */}
                <section className="welcome-card">
                    <div>
                        <h1>Welcome, {provider.name}</h1>
                        <p className="welcome-sub">Service Domain: <strong>{provider.domain}</strong></p>
                    </div>
                    <div className="availability-control">
                        <span className={`status-label ${provider.isOnline ? 'status-online' : 'status-offline'}`}>
                            {provider.isOnline ? 'Online' : 'Offline'}
                        </span>
                        <div
                            className={`toggle-switch ${provider.isOnline ? 'active' : ''}`}
                            onClick={handleToggleOnline}
                        >
                            <div className="toggle-knob"></div>
                        </div>
                    </div>
                </section>

                {/* 3. Performance Summary Cards */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon icon-purple"><StatRequestIcon /></div>
                        <div className="stat-info">
                            <h3>{stats.totalRequests}</h3>
                            <p>Total Requests</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-green"><StatCheckIcon /></div>
                        <div className="stat-info">
                            <h3>{stats.completedServices}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-yellow"><StatStarIcon /></div>
                        <div className="stat-info">
                            <h3>{stats.avgRating}</h3>
                            <p>Average Rating</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-blue"><DollarIcon /></div>
                        <div className="stat-info">
                            <h3>${stats.todayEarnings}</h3>
                            <p>Today's Earnings</p>
                        </div>
                    </div>
                </section>

                <div className="content-grid">
                    {/* 4. Service Requests Section */}
                    <div className="requests-section">
                        <div className="section-title">
                            <h3>New Service Requests</h3>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{requests.filter(r => r.status === 'Pending').length} Pending</span>
                        </div>

                        <div className="requests-list">
                            {requests.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No new requests at the moment.
                                </div>
                            ) : (
                                requests.map(req => (
                                    <div key={req._id} className="request-card">
                                        <div className="req-info">
                                            <h4>{req.service || 'Service'}</h4>
                                            <div className="req-details">
                                                <span className="req-detail-item"><UserIcon /> {req.customerId ? 'Customer' : 'Customer'}</span>
                                                <span className="req-detail-item">📍 {'Pending Address'}</span>
                                            </div>
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Time: {req.date} {req.time}
                                            </div>
                                        </div>
                                        <div className="req-actions">
                                            <button className="btn-accept" onClick={() => handleAcceptRequest(req._id)}>Accept</button>
                                            <button className="btn-reject" onClick={() => handleRejectRequest(req._id)}>Reject</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 5. Earnings Overview Section */}
                    <div className="earnings-section">
                        <div className="section-title">
                            <h3>Earnings Overview</h3>
                        </div>
                        <div className="earnings-card">
                            <div className="earning-row">
                                <span className="earning-label">Today</span>
                                <span className="earning-amount">${stats.todayEarnings}</span>
                            </div>
                            <div className="earning-row">
                                <span className="earning-label">This Week</span>
                                <span className="earning-amount">${stats.weekEarnings}</span>
                            </div>
                            <div className="earning-row">
                                <span className="earning-label">This Month</span>
                                <span className="earning-amount">${stats.monthEarnings}</span>
                            </div>
                            <button className="view-details-btn" onClick={() => navigate('/provider/earnings')}>
                                View Full Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* 6. Recent Activity Section */}
                <div className="activity-section-full">
                    <div className="section-title">
                        <h3>Recent Activity</h3>
                    </div>
                    <div className="table-container">
                        <table className="activity-table">
                            <thead>
                                <tr>
                                    <th>Service Name</th>
                                    <th>Status</th>
                                    <th>Earnings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.length === 0 ? (
                                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No recent activity.</td></tr>
                                ) : (
                                    recentActivity.map(activity => (
                                        <tr key={activity._id}>
                                            <td>{activity.service}</td>
                                            <td>
                                                <span className="status-tag status-completed">{activity.status}</span>
                                            </td>
                                            <td>${activity.price || 0}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderDashboard;
