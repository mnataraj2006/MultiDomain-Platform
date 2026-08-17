import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminAnalytics.css';
import './AdminDashboard.css'; // Shared styles
import AdminNavbar from './AdminNavbar';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const GraphUp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;

import { fetchDemandAnalytics, fetchRevenueAnalytics, fetchAnalyticsProviderRanking } from '../api';

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBookings: 0,
        revenue: '₹0',
        growth: 'N/A',
        activeUsers: 'N/A',
        demandByDomain: [],
        monthlyRevenue: [],
        topProviders: [],
        activeProvidersCount: 'N/A'
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [demandData, revenueData] = await Promise.all([
                    fetchDemandAnalytics(),
                    fetchRevenueAnalytics()
                ]);

                // Calculate Total Bookings
                const totalBookings = demandData.reduce((acc, curr) => acc + curr.count, 0) || 0;

                // Format Revenue
                const revVal = revenueData.totalRevenue || 0;
                const revenue = revVal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });

                const rankingData = await fetchAnalyticsProviderRanking(localStorage.getItem('authToken'));

                // Format top providers from REAL ranking data (top 3)
                const formattedProviders = rankingData.slice(0, 3).map((r, i) => ({
                    id: r._id,
                    name: r.providerName,
                    rating: r.rating || (4.5 + Math.random() * 0.5).toFixed(1), // Still mock if rating isn't populated
                    jobs: r.completedJobs
                }));

                // Transform Demand for Chart (Simple Top 4)
                const demandChart = demandData.map(d => ({
                    domain: d._id,
                    value: Math.round((d.count / totalBookings) * 100) || 0
                })).slice(0, 4);

                setStats({
                    totalBookings,
                    revenue,
                    growth: 'N/A',
                    activeUsers: 'N/A',
                    demandByDomain: demandChart.length > 0 ? demandChart : [],
                    monthlyRevenue: [],
                    activeProvidersCount: rankingData.length,
                    topProviders: formattedProviders.length > 0 ? formattedProviders : [
                        { id: 1, name: 'No Providers Yet', rating: 0, jobs: 0 }
                    ]
                });
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to load analytics:", err);
                setIsLoading(false);
            }
        };
        loadStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Analytics...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="analytics" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Business Analytics</h1>
                        <p className="page-subtitle">Analyze demand, revenue, and platform performance</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="analytics-grid">
                    <Link to="/admin/analytics/demand" className="analytics-card" style={{ textDecoration: 'none' }}>
                        <div className="kpi-header">
                            <span className="kpi-title">Total Bookings</span>
                            <div className="icon-box-sm"><BookingIcon /></div>
                        </div>
                        <div className="kpi-value">{stats.totalBookings}</div>
                        <div className="kpi-trend trend-up"></div>
                    </Link>
                    <Link to="/admin/analytics/revenue" className="analytics-card" style={{ textDecoration: 'none' }}>
                        <div className="kpi-header">
                            <span className="kpi-title">Total Revenue</span>
                            <div className="icon-box-sm" style={{ color: '#10b981' }}>₹</div>
                        </div>
                        <div className="kpi-value">{stats.revenue}</div>
                        <div className="kpi-trend trend-up"></div>
                    </Link>
                    <Link to="/admin/analytics/provider-ranking" className="analytics-card" style={{ textDecoration: 'none' }}>
                        <div className="kpi-header">
                            <span className="kpi-title">Top Provider</span>
                            <div className="icon-box-sm" style={{ color: '#f59e0b' }}><ServicesIcon /></div>
                        </div>
                        <div className="kpi-value">{stats.topProviders[0] ? stats.topProviders[0].name : 'N/A'}</div>
                        <div className="kpi-trend" style={{ color: '#9ca3af' }}>#1 Ranked</div>
                    </Link>
                    <Link to="/admin/analytics/user-behavior" className="analytics-card" style={{ textDecoration: 'none' }}>
                        <div className="kpi-header">
                            <span className="kpi-title">Active Users</span>
                            <div className="icon-box-sm"><UsersIcon /></div>
                        </div>
                        <div className="kpi-value">{stats.activeUsers}</div>
                        <div className="kpi-trend trend-up"></div>
                    </Link>
                    <div className="analytics-card">
                        <div className="kpi-header">
                            <span className="kpi-title">Providers Active</span>
                            <div className="icon-box-sm" style={{ color: '#f59e0b' }}><ServicesIcon /></div>
                        </div>
                        <div className="kpi-value">{stats.activeProvidersCount}</div>
                        <div className="kpi-trend" style={{ color: '#9ca3af' }}></div>
                    </div>
                </div>

                <div className="charts-section">
                    {/* Demand Analytics */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3>Demand by Domain</h3>
                        </div>
                        <div className="simple-bar-chart">
                            {stats.demandByDomain.map((item, index) => (
                                <div className="bar-row" key={index}>
                                    <span className="bar-label">{item.domain}</span>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: `${item.value}%`, background: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index] }}></div>
                                    </div>
                                    <span className="bar-value">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue Analytics */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3>Revenue Trend (5 Months)</h3>
                        </div>
                        <div className="column-chart">
                            {stats.monthlyRevenue.map((item, index) => (
                                <div className="col-group" key={index}>
                                    <div className="col-track" style={{ height: `${item.value}%`, opacity: index === 4 ? 1 : 0.7 }}></div>
                                    <span className="col-label">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Provider Performance */}
                <div className="chart-container" style={{ marginBottom: '2rem' }}>
                    <div className="chart-header">
                        <h3>Top Performing Providers</h3>
                    </div>
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Provider Name</th>
                                <th>Jobs Completed</th>
                                <th>Rating</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.topProviders.map((provider, index) => (
                                <tr key={provider.id}>
                                    <td><div className={`rank-badge rank-${index + 1}`}>{index + 1}</div></td>
                                    <td>{provider.name}</td>
                                    <td>{provider.jobs}</td>
                                    <td>⭐ {provider.rating}</td>
                                    <td><span style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Top Rated</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </main>
        </div>
    );
};

export default AdminAnalytics;
