import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCurrentUser, updateUserProfile } from '../api';
import './ProviderProfile.css';
import '../components/ProviderDashboard.css'; // Shared Header

// Icons
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const RequestsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const BookingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const CameraIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;

const ProviderProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        domain: '',
        experience: '',
        location: '',
        skills: '',
    });

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            fetchCurrentUser(token)
                .then(userData => {
                    setUserId(userData._id);
                    setFormData(prev => ({
                        ...prev,
                        name: userData.name || prev.name,
                        email: userData.email || prev.email,
                        phone: userData.phone || prev.phone,
                        domain: userData.domain || prev.domain,
                        location: userData.address || prev.location,
                        bio: userData.bio || prev.bio,
                        experience: userData.experience || prev.experience,
                        skills: userData.bio || prev.skills, // Mapping bio to skills roughly
                    }));
                    if (userData.availability !== undefined) {
                        setIsOnline(userData.availability);
                    }
                })
                .catch(err => console.error("Failed to fetch user:", err))
                .finally(() => setIsLoading(false));
            return;
        }
        setIsLoading(false);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            if (token && userId) {
                const updatedData = {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.location,
                    // bio/skills could be mapped here if backend supports. Assuming 'bio' maps to 'skills' roughly
                    bio: formData.skills,
                    experience: formData.experience,
                    availability: isOnline
                };
                await updateUserProfile(userId, updatedData, token);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Profile...</h2>
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
                    <Link to="/provider/analytics" className="header-link">
                        <AnalyticsIcon /> Analytics
                    </Link>
                    <Link to="/provider/profile" className="header-link active">
                        <UserIcon /> Profile
                    </Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">
                    <LogoutIcon /> Logout
                </button>
            </header>

            <main className="content-wrapper">
                <div className="page-header">
                    <h1>Provider Profile</h1>
                    <p className="header-subtitle">Manage your personal information and service details</p>
                </div>

                <div className="profile-grid">
                    {/* Sidebar Overview */}
                    <div className="profile-sidebar">
                        <div className="profile-card">
                            <div className="avatar-wrapper">
                                <CameraIcon />
                            </div>
                            <h2 className="profile-name">{formData.name}</h2>
                            <p className="profile-domain">{formData.domain}</p>

                            <div className="availability-switch">
                                <div
                                    className={`toggle-switch ${isOnline ? 'active' : ''}`}
                                    onClick={() => setIsOnline(!isOnline)}
                                    style={{ transform: 'scale(0.8)' }}
                                >
                                    <div className="toggle-knob"></div>
                                </div>
                                <span className={`switch-label ${isOnline ? 'switch-active' : ''}`}>
                                    {isOnline ? 'Available' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Form */}
                    <div className="profile-main">
                        <form onSubmit={handleSave}>
                            {/* Contact Info */}
                            <div className="form-section">
                                <h3>Contact Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            disabled
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label className="form-label">Service Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            className="form-input"
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="form-section" style={{ marginTop: '2rem' }}>
                                <h3>Service Details</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Service Domain</label>
                                        <input
                                            type="text"
                                            name="domain"
                                            className="form-input"
                                            value={formData.domain}
                                            disabled // Usually domain is fixed or admin changed
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Years of Experience</label>
                                        <input
                                            type="number"
                                            name="experience"
                                            className="form-input"
                                            value={formData.experience}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label className="form-label">Skills & Expertise</label>
                                        <input
                                            type="text"
                                            name="skills"
                                            className="form-input"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            placeholder="e.g. Wiring, Installation..."
                                        />
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => navigate('/provider/dashboard')}>Cancel</button>
                                    <button type="submit" className="btn-save">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderProfile;
