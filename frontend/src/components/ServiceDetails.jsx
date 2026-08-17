import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchServiceDetails, fetchProviderFeedbacks } from '../api';
import './ServiceDetails.css';
import './BrowseServices.css'; // Shared nav styles

// Icons reusing from BrowseServices/Home
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);
const StarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ToolIcon = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;

const ServiceDetails = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Authenticate check
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);

        const loadServiceInfo = async () => {
            try {
                const data = await fetchServiceDetails(serviceId);
                setService(data);

                try {
                    const reviewData = await fetchProviderFeedbacks(data.providerId);
                    setReviews(reviewData.map(r => ({
                        _id: r._id,
                        userName: r.customerId?.name || 'Customer',
                        rating: r.rating,
                        comment: r.review
                    })));
                } catch {
                    // Reviews might fail or be empty, handled gracefully
                }
            } catch (error) {
                console.error("Failed to fetch service details:", error);
                setService(null);
            } finally {
                setLoading(false);
            }
        };

        loadServiceInfo();
    }, [serviceId]);

    const handleBook = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            // Proceed to booking page
            navigate(`/book/${serviceId}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        navigate('/login');
    };

    if (loading) return (
        <div className="details-container">
            <nav className="navbar-details">
                <Link to="/" className="nav-brand"><LogoIcon /><span>MultiDomain</span></Link>
            </nav>
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader"></div>
            </div>
        </div>
    );

    if (!service) return <div className="details-container">Service not found</div>;

    const userRole = localStorage.getItem('userRole');
    const dashboardLink = userRole === 'Provider' ? '/provider/dashboard' : userRole === 'Admin' ? '/admin/dashboard' : '/customer-dashboard';

    return (
        <div className="details-container">
            {/* Navbar */}
            <nav className="navbar-details">
                <Link to={isAuthenticated ? dashboardLink : "/"} className="nav-brand">
                    <LogoIcon />
                    <span>MultiDomain</span>
                </Link>
                <div className="nav-links">
                    <Link to="/services" className="nav-link">Browse Services</Link>
                    {isAuthenticated && <Link to={dashboardLink} className="nav-link">Dashboard</Link>}
                </div>
                <div className="nav-buttons">
                    {isAuthenticated ? (
                        <button onClick={handleLogout} className="secondary-btn" style={{ marginTop: 0, padding: '8px 20px' }}>Logout</button>
                    ) : (
                        <Link to="/login" className="nav-link">Login</Link>
                    )}
                </div>
            </nav>

            <div className="details-content">
                {/* Main Content */}
                <div className="details-main">
                    <div className="overview-card">
                        <div className="details-header">
                            <div className="details-icon-box">
                                <ToolIcon />
                            </div>
                            <div className="details-title">
                                <h1>{service.name}</h1>
                                <span className="domain-badge">{service.category}</span>
                            </div>
                        </div>
                        <p className="details-desc">{service.description}</p>

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ClockIcon /> <span>Estimated 2-4 hours</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <StarIcon /> <span>{service.rating || 0} Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="reviews-section">
                        <h3 className="section-label">Customer Reviews</h3>
                        {reviews.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No reviews yet.</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="review-item">
                                    <div className="review-header">
                                        <span className="reviewer-name">{review.userName || 'Customer'}</span>
                                        <div className="review-stars">
                                            {[...Array(review.rating)].map((_, i) => <StarIcon key={i} />)}
                                        </div>
                                    </div>
                                    <p className="review-text">"{review.comment}"</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="details-sidebar">
                    <div className="pricing-card">
                        <span className="price-tag">₹{service.price}<span className="price-unit">/session</span></span>
                        <div className="availability">
                            <CheckIcon /> Available Now
                        </div>
                        <button onClick={handleBook} className="primary-btn book-btn">
                            Book Service
                        </button>
                    </div>

                    <div className="provider-card">
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Service Provider</h3>
                        <div className="provider-info">
                            <div className="provider-avatar">{service.providerName?.charAt(0) || 'P'}</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{service.providerName}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Expert</div>
                            </div>
                        </div>
                        <div className="provider-stats">
                            <span>{service.reviewsCount || 0} reviews</span>
                            <span>{service.rating || 0} / 5.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
