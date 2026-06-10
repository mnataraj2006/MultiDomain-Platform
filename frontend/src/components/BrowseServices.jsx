import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchServices } from '../api';
import './BrowseServices.css';

// Reuse Logo for consistency
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);

// Service Icons
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none" style={{ marginRight: '4px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const HomeServiceIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ITServiceIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>;
const HealthIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>;
const EduIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>;

const BrowseServices = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Check Auth
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);

        const loadServices = async () => {
            try {
                const data = await fetchServices();
                setServices(data.filter(s => s.isActive));
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                setLoading(false);
            }
        };

        loadServices();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const handleBook = (id) => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            // Ideally navigate to specific booking page
            alert(`Proceeding to book Service ID: ${id}`);
        }
    };

    const filteredServices = services.filter(service => {
        const matchesCategory = filter === 'All' || service.category === filter;
        const serviceName = service.name || '';
        const serviceCategory = service.category || '';
        const matchesSearch = serviceName.toLowerCase().includes(search.toLowerCase()) ||
            serviceCategory.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const domains = ["All", "Home Services", "IT Services", "Healthcare", "Education", "Logistics"];

    return (
        <div className="browse-container">
            {/* Navbar */}
            <nav className="navbar-browse">
                <Link to="/" className="nav-brand">
                    <LogoIcon />
                    <span>MultiDomain</span>
                </Link>
                <div className="nav-links">
                    <Link to="/services" className="nav-link active">Browse Services</Link>
                    {isAuthenticated && <Link to="/customer-dashboard" className="nav-link">Dashboard</Link>}
                </div>
                <div className="nav-buttons">
                    {isAuthenticated ? (
                        <button onClick={handleLogout} className="secondary-btn" style={{ marginTop: 0, padding: '8px 20px' }}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="primary-btn" style={{ width: 'auto', padding: '8px 20px' }}>Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Header / Search */}
            <div className="browse-header">
                <h1 className="page-title">Browse Services</h1>
                <p className="page-subtitle">Find the perfect professional for your needs across multiple domains.</p>

                <div className="search-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for 'Cleaning', 'Cloud', etc..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="filters-container">
                {domains.map(domain => (
                    <button
                        key={domain}
                        className={`filter-chip ${filter === domain ? 'active' : ''}`}
                        onClick={() => setFilter(domain)}
                    >
                        {domain}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="services-section">
                {loading ? (
                    <div className="loader-container">
                        <div className="loader"></div>
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="services-grid">
                        {filteredServices.map(service => {
                            let DisplayIcon = HomeServiceIcon;
                            if (service.category === 'IT Services') DisplayIcon = ITServiceIcon;
                            if (service.category === 'Healthcare') DisplayIcon = HealthIcon;
                            if (service.category === 'Education') DisplayIcon = EduIcon;

                            return (
                                <div key={service._id} className="service-card">
                                    <div className="card-header">
                                        <div className="service-icon-box"><DisplayIcon /></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <span className="service-price">${service.price || service.basePrice}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 'bold' }}>
                                                <StarIcon /> {service.rating ? `${Number(service.rating).toFixed(1)} (${service.reviewsCount || 0})` : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="service-domain">{service.category}</span>
                                    <h3 className="service-title">{service.name}</h3>
                                    <div className="card-actions">
                                        <button
                                            onClick={() => navigate(`/services/${service._id}`)}
                                            className="primary-btn"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3>No services found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseServices;
