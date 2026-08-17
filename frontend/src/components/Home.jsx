import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Icons
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);

const TruckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
);

const CloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-3.037-2.463-5.5-5.5-5.5S6.5 15.963 6.5 19"></path><path d="M14.5 9c0-2.485-2.015-4.5-4.5-4.5S5.5 6.515 5.5 9"></path><path d="M21.5 12c0-2.21-1.79-4-4-4"></path><path d="M10 19h12"></path><path d="M22 16h-2.5"></path></svg>
);

const ToolIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const ZapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

import { fetchCurrentUser } from '../api';

const Home = () => {
    const [authStatus, setAuthStatus] = React.useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
    const [userRole, setUserRole] = React.useState('');

    React.useEffect(() => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole');

        if (!token) {
            setAuthStatus('unauthenticated');
            return;
        }

        const checkSession = async () => {
            try {
                const userData = await fetchCurrentUser(token);
                if (userData && userData.role) {
                    setUserRole(userData.role);
                    localStorage.setItem('userRole', userData.role);
                    setAuthStatus('authenticated');
                } else {
                    throw new Error("Malformed session response");
                }
            } catch (err) {
                console.error("Session validation failed, clearing stale auth data:", err);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                setUserRole('');
                setAuthStatus('unauthenticated');
            }
        };

        checkSession();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        setUserRole('');
        setAuthStatus('unauthenticated');
    };

    return (
        <div className="home-container">
            {/* Header */}
            <nav className="navbar">
                <Link to="/" className="nav-brand">
                    <LogoIcon />
                    <span>MultiDomain Platform</span>
                </Link>
                <div className="nav-links">
                    <a href="#services" className="nav-link">Services</a>
                    <a href="#about" className="nav-link">About</a>
                </div>
                <div className="nav-buttons">
                    {authStatus === 'loading' ? (
                        <div style={{ width: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{
                                width: '18px',
                                height: '18px',
                                border: '2px solid rgba(255,255,255,0.1)',
                                borderTopColor: 'var(--accent-blue, #007BFF)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></div>
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    ) : authStatus === 'authenticated' ? (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link 
                                to={userRole === 'Provider' ? '/provider/dashboard' : userRole === 'Admin' ? '/admin/dashboard' : '/customer-dashboard'} 
                                className="nav-btn-signup"
                                style={{ padding: '8px 24px' }}
                            >
                                Go to Dashboard
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="nav-btn-login" 
                                style={{ background: 'none', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-main)' }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn-login">Login</Link>
                            <Link to="/signup" className="nav-btn-signup">Signup</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-section">
                <h1 className="hero-headline">On-Demand Services<br />Across Multiple Domains</h1>
                <p className="hero-tagline">
                    Experience seamless cross-domain orchestration. Connect with verified service providers
                    in logistics, cloud computing, and more with AI-driven predictive scaling.
                </p>
                <div className="hero-cta">
                    <Link to="/services" className="hero-btn-primary">Explore Services</Link>
                    <Link to="/signup" className="hero-btn-secondary">Get Started</Link>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="section-container">
                <h2 className="section-title">Our Service Domains</h2>
                <div className="services-grid">
                    <div className="service-card">
                        <div className="card-icon"><TruckIcon /></div>
                        <h3 className="card-title">Logistics & Supply</h3>
                        <p className="card-desc">Real-time fleet tracking and automated supply chain optimization.</p>
                    </div>
                    <div className="service-card">
                        <div className="card-icon"><CloudIcon /></div>
                        <h3 className="card-title">Cloud Compute</h3>
                        <p className="card-desc">SaaS infrastructure provisioning with dynamic load balancing.</p>
                    </div>
                    <div className="service-card">
                        <div className="card-icon"><ToolIcon /></div>
                        <h3 className="card-title">Maintenance</h3>
                        <p className="card-desc">On-demand technical support and facility maintenance services.</p>
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="section-container">
                <div className="highlights-grid">
                    <div className="highlight-item">
                        <div className="highlight-icon"><CheckIcon /></div>
                        <div className="highlight-text">Verified Providers</div>
                    </div>
                    <div className="highlight-item">
                        <div className="highlight-icon"><ZapIcon /></div>
                        <div className="highlight-text">Fast Booking</div>
                    </div>
                    <div className="highlight-item">
                        <div className="highlight-icon"><ChartIcon /></div>
                        <div className="highlight-text">Performance Analytics</div>
                    </div>
                    <div className="highlight-item">
                        <div className="highlight-icon"><ShieldIcon /></div>
                        <div className="highlight-text">Secure Payments</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <h2 className="cta-header">Ready to get started?</h2>
                <p className="cta-sub">Join thousands of users optimizing their workflows today.</p>
                <div className="cta-buttons">
                    <Link to="/signup" className="hero-btn-primary">Sign Up as Customer</Link>
                    <Link to="/signup" className="hero-btn-secondary">Join as Service Provider</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-links">
                    <a href="#" className="footer-link">About Us</a>
                    <a href="#" className="footer-link">Contact</a>
                    <a href="#" className="footer-link">Terms</a>
                    <a href="#" className="footer-link">Privacy</a>
                </div>
                <p style={{ marginTop: '2rem' }}>&copy; 2026 MultiDomain Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
