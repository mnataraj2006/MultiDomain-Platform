import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAllUsers, fetchAllBookings, fetchPendingProviders } from '../api';
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';

// SVG Assets
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

const DollarSign = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        if (!token || role !== 'Admin') {
            navigate('/login');
            return;
        }

        const loadAdminData = async () => {
            try {
                const [users, bookings, pendingProviders] = await Promise.all([
                    fetchAllUsers(token),
                    fetchAllBookings(token),
                    fetchPendingProviders(token)
                ]);

                const totalRevenue = bookings
                    .filter(b => b.status === 'Completed')
                    .reduce((sum, b) => sum + (b.price || 0), 0);

                setStats({
                    totalUsers: users.filter(u => u.role === 'Customer').length,
                    totalProviders: users.filter(u => u.role === 'Provider').length,
                    totalBookings: bookings.length,
                    totalRevenue: totalRevenue,
                    activeBookings: bookings.filter(b => b.status === 'In Progress' || b.status === 'Accepted').length,
                    completedBookings: bookings.filter(b => b.status === 'Completed').length,
                    pendingApprovals: pendingProviders.length || 0
                });

                setAlerts([
                    { id: 1, type: 'info', title: 'System Status', msg: `All endpoints functioning. Registered Providers: ${users.filter(u => u.role === 'Provider').length}`, time: 'Just now' },
                    ...(pendingProviders.length > 0 ? [{ id: 2, type: 'warning', title: 'Pending Approvals', msg: `${pendingProviders.length} providers waiting for approval`, time: 'Recent' }] : [])
                ]);

            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        loadAdminData();
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
                <h2>Loading Admin Dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="dashboard" />
            <main className="admin-content">
                {/* Overview */}
                <div className="overview-card">
                    <h1>Admin Dashboard</h1>
                    <p className="overview-subtitle">System overview and platform performance monitoring</p>
                </div>

                {/* KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-box">
                        <div className="kpi-icon-container kpi-blue"><UsersIcon /></div>
                        <span className="kpi-number">{stats.totalUsers.toLocaleString()}</span>
                        <span className="kpi-title">Total Users</span>
                    </div>
                    <div className="kpi-box">
                        <div className="kpi-icon-container kpi-purple"><ServicesIcon /></div>
                        <span className="kpi-number">{stats.totalProviders}</span>
                        <span className="kpi-title">Service Providers</span>
                    </div>
                    <div className="kpi-box">
                        <div className="kpi-icon-container kpi-orange"><BookingIcon /></div>
                        <span className="kpi-number">{stats.totalBookings.toLocaleString()}</span>
                        <span className="kpi-title">Total Bookings</span>
                    </div>
                    <div className="kpi-box">
                        <div className="kpi-icon-container kpi-green"><DollarSign /></div>
                        <span className="kpi-number">${stats.totalRevenue.toLocaleString()}</span>
                        <span className="kpi-title">Total Revenue</span>
                    </div>
                </div>

                {/* Split Section: Activity & Alters */}
                <div className="dashboard-split">
                    {/* Activity Overview */}
                    <div className="panel-card">
                        <div className="panel-header">
                            <h3 className="panel-title">System Activity</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #374151', color: 'white', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Daily</button>
                                <button style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>Monthly</button>
                            </div>
                        </div>
                        <div className="activity-row">
                            <span className="act-label">Active Bookings</span>
                            <span className="act-value" style={{ color: '#60a5fa' }}>{stats.activeBookings}</span>
                        </div>
                        <div className="activity-row">
                            <span className="act-label">Completed Services</span>
                            <span className="act-value" style={{ color: '#34d399' }}>{stats.completedBookings}</span>
                        </div>
                        <div className="activity-row">
                            <span className="act-label">Pending Provider Approvals</span>
                            <span className="act-value" style={{ color: '#fbbf24' }}>{stats.pendingApprovals}</span>
                        </div>
                        <div className="activity-row">
                            <span className="act-label">New Users (Today)</span>
                            <span className="act-value">45</span>
                        </div>
                        <div className="activity-row">
                            <span className="act-label">System Uptime</span>
                            <span className="act-value">99.98%</span>
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="panel-card">
                        <div className="panel-header">
                            <h3 className="panel-title">System Alerts</h3>
                            <BellIcon style={{ opacity: 0.5 }} />
                        </div>
                        <div className="alerts-list">
                            {alerts.map(alert => (
                                <div key={alert.id} className={`alert-item ${alert.type}`}>
                                    <div className="alert-header">
                                        <span>{alert.title}</span>
                                        <span>{alert.time}</span>
                                    </div>
                                    <p className="alert-msg">{alert.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
