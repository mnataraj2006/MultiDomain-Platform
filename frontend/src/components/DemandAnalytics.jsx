import React, { useState, useEffect } from 'react';
import './AdminDetailedAnalytics.css';
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';

const GraphIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const ClockIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const LayersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;

import { fetchDemandAnalytics } from '../api';

const DemandAnalytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Weekly');
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const demandData = await fetchDemandAnalytics();
            // Transform for chart
            const total = demandData.reduce((acc, curr) => acc + curr.count, 0);
            const formatted = demandData.map((d, i) => ({
                label: d._id,
                value: total ? Math.round((d.count / total) * 100) : 0,
                count: d.count,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4]
            }));
            setChartData(formatted);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const data = {
        totalRequests: chartData.reduce((acc, curr) => acc + curr.count, 0) || 0,
        topDomain: chartData.length > 0 ? chartData[0].label : 'N/A',
        peakTime: '10:00 AM - 12:00 PM', // Best left mocked until time analysis is implemented
        growth: '+14.2%', // Kept as mock, needs historical trend data implemented
        demandByDomain: chartData,
        trend: [40, 55, 45, 70, 65, 85, 90] // Kept as mock, needs timeline array implemented
    };

    if (isLoading) return <div className="dashboard-loading"><div className="loader"></div></div>;

    return (
        <div className="admin-container">
            <AdminNavbar active="analytics" />
            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Demand Analytics</h1>
                        <p className="page-subtitle">Analyze service demand across domains and time</p>
                    </div>
                    <div className="filter-group">
                        {['Daily', 'Weekly', 'Monthly'].map(f => (
                            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
                        ))}
                    </div>
                </div>

                <div className="analytics-container">
                    {/* KPI Cards */}
                    <div className="kpi-row">
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Total Requests</span>
                                <div className="icon-box-sm kpi-demand-icon"><LayersIcon /></div>
                            </div>
                            <div className="kpi-value">{data.totalRequests}</div>
                            <div className="kpi-trend trend-up">▲ 145 today</div>
                        </div>
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Top Domain</span>
                                <div className="icon-box-sm kpi-growth-icon"><GraphIcon /></div>
                            </div>
                            <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{data.topDomain}</div>
                            <div className="kpi-trend">45% of total</div>
                        </div>
                        <div className="analytics-card">
                            <div className="kpi-header">
                                <span className="kpi-title">Peak Time</span>
                                <div className="icon-box-sm kpi-revenue-icon"><ClockIcon /></div>
                            </div>
                            <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{data.peakTime}</div>
                            <div className="kpi-trend">High engagement</div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="chart-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">Demand by Domain</h3>
                            <div className="simple-bar-chart">
                                {data.demandByDomain.map((d, i) => (
                                    <div className="bar-row" key={i}>
                                        <span className="bar-label">{d.label}</span>
                                        <div className="bar-track">
                                            <div className="bar-fill" style={{ width: `${d.value}%`, background: d.color }}></div>
                                        </div>
                                        <span className="bar-value">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3 className="chart-title">Demand Trend ({filter})</h3>
                            <div className="trend-chart">
                                {data.trend.map((val, i) => (
                                    <div key={i} className="trend-col" style={{ height: `${val}%` }} data-label={`D${i + 1}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DemandAnalytics;
