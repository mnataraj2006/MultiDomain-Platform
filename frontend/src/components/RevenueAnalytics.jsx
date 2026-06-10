import React, { useState, useEffect } from 'react';
import './AdminDetailedAnalytics.css';
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';

const DollarIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const TrendingUpIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const PieChartIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;

import { fetchRevenueAnalytics, fetchAnalyticsProviderRanking } from '../api';

const RevenueAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Monthly');
    const [data, setData] = useState({
        totalRevenue: '$0',
        monthly: 'N/A',
        growth: 'N/A',
        avgBooking: '$0',
        revenueTrend: [0],
        topProviders: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const [revData, rankData] = await Promise.all([
                    fetchRevenueAnalytics(),
                    fetchAnalyticsProviderRanking(token)
                ]);

                const fmt = (n) => (n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

                const topProvidersFormatted = rankData.slice(0, 5).map(r => ({
                    name: r.providerName || 'Unknown',
                    amount: fmt(r.revenueGenerated || 0)
                }));

                setData(prev => ({
                    ...prev,
                    totalRevenue: fmt(revData.totalRevenue),
                    avgBooking: fmt(revData.avgBookingValue),
                    monthly: 'N/A',
                    growth: 'N/A',
                    topProviders: topProvidersFormatted.length > 0 ? topProvidersFormatted : [
                        { name: 'No Data', amount: '$0' }
                    ]
                }));
                setIsLoading(false);
            } catch (e) {
                console.error(e);
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) return <div className="dashboard-loading"><div className="loader"></div></div>;

    return (
        <div className="admin-container">
            <AdminNavbar active="analytics" />
            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Revenue Analytics</h1>
                        <p className="page-subtitle">Track earnings, growth trends, and revenue sources</p>
                    </div>
                    <div className="filter-group">
                        {['Daily', 'Monthly', 'Yearly'].map(f => (
                            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                        ))}
                    </div>
                </div>

                <div className="analytics-container">
                    {/* KPI Cards */}
                    <div className="kpi-row">
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Total Revenue</span>
                                <div className="icon-box-sm kpi-revenue-icon"><DollarIcon /></div>
                            </div>
                            <div className="kpi-value">{data.totalRevenue}</div>
                            <div className="kpi-trend trend-up">Lifetime</div>
                        </div>
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Monthly Revenue</span>
                                <div className="icon-box-sm kpi-growth-icon"><PieChartIcon /></div>
                            </div>
                            <div className="kpi-value">{data.monthly}</div>
                            <div className="kpi-trend trend-up">{data.growth}</div>
                        </div>
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Avg. Booking</span>
                                <div className="icon-box-sm kpi-demand-icon"><TrendingUpIcon /></div>
                            </div>
                            <div className="kpi-value">{data.avgBooking}</div>
                            <div className="kpi-trend">Per service</div>
                        </div>
                    </div>

                    {/* Charts & Lists */}
                    <div className="chart-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">Revenue Trend ({filter})</h3>
                            <div className="trend-chart">
                                {data.revenueTrend.map((val, i) => (
                                    <div key={i} className="trend-col" style={{ height: `${val}%`, background: `linear-gradient(to top, rgba(16, 185, 129, 0.2), transparent)`, borderColor: '#10b981' }} data-label={`M${i + 1}`}></div>
                                ))}
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">Top Earning Providers</h3>
                            <div className="revenue-list">
                                {data.topProviders.map((p, i) => (
                                    <div className="revenue-item" key={i}>
                                        <div className="revenue-rank">{i + 1}</div>
                                        <div className="revenue-provider-name">{p.name}</div>
                                        <div className="revenue-amount">{p.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RevenueAnalytics;
