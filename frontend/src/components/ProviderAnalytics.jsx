import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ProviderAnalytics.css';
import '../components/ProviderDashboard.css'; // Shared Header
import { fetchCurrentUser, fetchProviderPerformance, fetchProviderFeedbacks } from '../api';

// Icons
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const RequestsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const BookingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const StarIcon = ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "currentColor"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

const ProviderAnalytics = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState({});
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const user = await fetchCurrentUser(token);
                const performance = await fetchProviderPerformance(token);
                const reviewsData = await fetchProviderFeedbacks(user._id, token);

                setMetrics({
                    rating: Number(performance.rating || 0).toFixed(1),
                    totalRatings: reviewsData.length || 0,
                    completionRate: Number(performance.completionRate || 0).toFixed(1),
                    avgResponse: performance.avgResponse || 'N/A',
                    avgCompletion: performance.avgCompletion || 'N/A',
                    totalServices: performance.completedJobs || 0,
                    qualityScore: Number(performance.performanceScore || 0).toFixed(1) // out of 5
                });

                setReviews(reviewsData.map(r => ({
                    id: r._id,
                    user: r.customerId?.name || 'Anonymous',
                    rating: r.rating,
                    comment: r.review, // Field is 'review' in Feedback model
                    date: new Date(r.createdAt).toLocaleDateString()
                })));
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalytics();
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
                <h2>Analyzing Performance...</h2>
            </div>
        );
    }

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
                    <Link to="/provider/bookings" className="header-link">
                        <BookingsIcon /> Booking Management
                    </Link>
                    <Link to="/provider/earnings" className="header-link">
                        <DollarIcon /> Earnings
                    </Link>
                    <Link to="/provider/analytics" className="header-link active">
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

            <main className="content-wrapper">
                <div className="page-header">
                    <h1>Performance Analytics</h1>
                    <p className="header-subtitle">Monitor your service performance and quality metrics</p>
                </div>

                {/* Key Performance Metrics */}
                <div className="analytics-kpi-grid">
                    <div className="kpi-card">
                        <span className="kpi-trend trend-up"></span>
                        <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                            <StarIcon filled={true} />
                        </div>
                        <span className="kpi-value">{metrics.rating}</span>
                        <span className="kpi-label">Average Rating ({metrics.totalRatings})</span>
                    </div>

                    <div className="kpi-card">
                        <span className="kpi-trend trend-up"></span>
                        <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <span className="kpi-value">{metrics.completionRate}%</span>
                        <span className="kpi-label">Completion Rate</span>
                    </div>

                    <div className="kpi-card">
                        <span className="kpi-trend trend-up"></span>
                        <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <span className="kpi-value">{metrics.avgResponse}</span>
                        <span className="kpi-label">Avg Response Time</span>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        </div>
                        <span className="kpi-value">{metrics.totalServices}</span>
                        <span className="kpi-label">Total Services</span>
                    </div>
                </div>

                <div className="analytics-content-grid">
                    {/* Performance Breakdown */}
                    <div className="chart-card">
                        <div className="section-header">
                            <h3 className="section-title">Performance Breakdown</h3>
                            <button style={{ background: 'transparent', border: '1px solid #374151', padding: '4px 12px', borderRadius: '6px', color: '#9ca3af', cursor: 'pointer' }}>Monthly</button>
                        </div>

                        <div className="progress-list">
                            <div className="progress-item">
                                <label><span>5 Star Ratings</span> <span>0%</span></label>
                                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '0%', background: '#f59e0b' }}></div></div>
                            </div>
                            <div className="progress-item">
                                <label><span>On-Time Arrival</span> <span>0%</span></label>
                                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '0%', background: '#10b981' }}></div></div>
                            </div>
                            <div className="progress-item">
                                <label><span>Avg Completion Time</span> <span>{metrics.avgCompletion}</span></label>
                                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '100%', background: '#3b82f6' }}></div></div>
                            </div>
                            <div className="progress-item">
                                <label><span>Quality Score</span> <span>{metrics.qualityScore}/5.0</span></label>
                                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(metrics.qualityScore / 5) * 100}%`, background: '#8b5cf6' }}></div></div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Feedback */}
                    <div className="chart-card">
                        <div className="section-header">
                            <h3 className="section-title">Recent Feedback</h3>
                        </div>
                        <div className="feedback-list">
                            {reviews.map(review => (
                                <div key={review.id} className="feedback-card">
                                    <div className="feedback-header">
                                        <span className="reviewer-name">{review.user}</span>
                                        <span className="review-date">{review.date}</span>
                                    </div>
                                    <div className="star-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon key={i} filled={i < review.rating} />
                                        ))}
                                    </div>
                                    <p className="review-text">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderAnalytics;
