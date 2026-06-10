import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCurrentUser, fetchUserBookings } from '../api';
import './CustomerDashboard.css';
import Navbar from './Navbar';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const ListIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogOutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({ name: '' });
    const [stats, setStats] = useState({ active: 0, completed: 0, pending: 0 });
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');
        const userId = localStorage.getItem('userId');

        if (!token || role !== 'Customer') {
            navigate('/login');
            return;
        }

        const loadDashboardData = async () => {
            try {
                // Fetch User Info
                const userData = await fetchCurrentUser(token);
                setUser({ name: userData.name });

                // Fetch Real Bookings
                const bookings = await fetchUserBookings(userId, token);

                // Calculate Stats
                const active = bookings.filter(b => b.status === 'In Progress' || b.status === 'Accepted').length;
                const completed = bookings.filter(b => b.status === 'Completed').length;
                const pending = bookings.filter(b => b.status === 'Pending').length;

                setStats({ active, completed, pending });

                const recent = [...bookings].reverse().slice(0, 5);
                setRecentBookings(recent);

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Navbar active="dashboard" />

            <main className="dashboard-content">
                {/* Welcome User */}
                <section className="welcome-card">
                    <div>
                        <h1>Welcome, {user.name}</h1>
                        <p className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="status-badge">
                        System Status: <span>Operational</span>
                    </div>
                </section>

                {/* Quick Stats */}
                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon icon-blue"><ClockIcon /></div>
                        <div className="stat-info">
                            <h3>{stats.active}</h3>
                            <p>Active Bookings</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-green"><CheckCircleIcon /></div>
                        <div className="stat-info">
                            <h3>{stats.completed}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-orange"><PlusIcon /></div>
                        <div className="stat-info">
                            <h3>{stats.pending}</h3>
                            <p>Pending Requests</p>
                        </div>
                    </div>
                </section>

                {/* Actions & Recent */}
                <div className="content-grid">
                    {/* Quick Actions */}
                    <div className="action-section">
                        <h2>Quick Actions</h2>
                        <div className="action-cards">
                            <Link to="/services" className="care-card" style={{ textDecoration: 'none' }}>
                                <PlusIcon />
                                <span>Book New Service</span>
                            </Link>
                            <Link to="/my-bookings" className="care-card" style={{ textDecoration: 'none' }}>
                                <ListIcon />
                                <span>View History</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="activity-section">
                        <h2>Recent Activity</h2>
                        <div className="table-container">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Provider</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No recent activity.</td></tr>
                                    ) : (
                                        recentBookings.map(booking => (
                                            <tr key={booking._id}>
                                                <td>{booking.service || 'Unknown Service'}</td>
                                                <td>{booking.providerName || 'Unknown Provider'}</td>
                                                <td>
                                                    <span className={`status-tag status-${booking.status.toLowerCase().replace(' ', '-')}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td>{booking.date}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;
