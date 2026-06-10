import React, { useState, useEffect } from 'react';
import './AdminDetailedAnalytics.css';
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';
import { fetchAnalyticsUserBehavior } from '../api';

const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const RepeatIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>;
const UserMinusIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="23" y1="11" x2="17" y2="11"></line></svg>;

const UserAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('Monthly');

    const [data, setData] = useState({
        activeUsers: 0,
        repeatRate: 'N/A',
        churnRate: 'N/A',
        activeTrend: [0, 0, 0, 0, 0, 0],
        retentionSplit: [
            { label: 'New', value: 0, color: '#3b82f6' },
            { label: 'Returning', value: 0, color: '#10b981' }
        ],
        loyaltyStat: '0 Bookings/Month'
    });

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const stats = await fetchAnalyticsUserBehavior(token);

                let avgBookings = 0;
                if (stats && stats.length > 0) {
                    const totalBookings = stats.reduce((acc, s) => acc + s.bookingsCount, 0);
                    avgBookings = (totalBookings / stats.length).toFixed(1);
                }

                setData({
                    activeUsers: stats && stats.length > 0 ? stats.length : 0,
                    repeatRate: 'N/A',
                    churnRate: 'N/A',
                    activeTrend: [0, 0, 0, 0, 0, 0],
                    retentionSplit: [
                        { label: 'New', value: 0, color: '#3b82f6' },
                        { label: 'Returning', value: 0, color: '#10b981' }
                    ],
                    loyaltyStat: `${avgBookings} Bookings/Top User`
                });
            } catch (error) {
                console.error("Failed to load user analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAnalytics();
    }, []);

    if (isLoading) return <div className="dashboard-loading"><div className="loader"></div></div>;

    return (
        <div className="admin-container">
            <AdminNavbar active="analytics" />
            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>User Behavior Analytics</h1>
                        <p className="page-subtitle">Analyze user engagement, retention, and activity patterns</p>
                    </div>
                    <div className="filter-group">
                        {['Weekly', 'Monthly', 'Yearly'].map(f => (
                            <button key={f} className={`filter-btn ${timeFilter === f ? 'active' : ''}`} onClick={() => setTimeFilter(f)}>{f}</button>
                        ))}
                    </div>
                </div>

                <div className="analytics-container">
                    {/* KPI Cards */}
                    <div className="kpi-row">
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Active Users</span>
                                <div className="icon-box-sm kpi-growth-icon"><UsersIcon /></div>
                            </div>
                            <div className="kpi-value">{data.activeUsers}</div>
                            <div className="kpi-trend trend-up">▲ 12% growth</div>
                        </div>
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Repeat Rate</span>
                                <div className="icon-box-sm kpi-revenue-icon"><RepeatIcon /></div>
                            </div>
                            <div className="kpi-value">{data.repeatRate}</div>
                            <div className="kpi-trend trend-up">High loyalty</div>
                        </div>
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Churn Rate</span>
                                <div className="icon-box-sm" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}><UserMinusIcon /></div>
                            </div>
                            <div className="kpi-value">{data.churnRate}</div>
                            <div className="kpi-trend" style={{ color: '#10b981' }}>▼ Decreasing</div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="chart-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">Growth Trend</h3>
                            <div className="trend-chart">
                                {data.activeTrend.map((val, i) => {
                                    const h = (val / 1000) * 100; // normalize for chart height
                                    return (
                                        <div key={i} className="trend-col" style={{ height: `${h}%` }} data-label={`M${i + 1}`}></div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">New vs Returning Split</h3>
                            <div className="simple-bar-chart" style={{ justifyContent: 'center', height: '100%' }}>
                                {data.retentionSplit.map((d, i) => (
                                    <div className="bar-row" key={i} style={{ marginBottom: '1.5rem' }}>
                                        <span className="bar-label" style={{ textAlign: 'left' }}>{d.label}</span>
                                        <div className="bar-track">
                                            <div className="bar-fill" style={{ width: `${d.value}%`, background: d.color }}></div>
                                        </div>
                                        <span className="bar-value">{d.value}%</span>
                                    </div>
                                ))}
                                <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Avg. User Engagement</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{data.loyaltyStat}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserAnalytics;
