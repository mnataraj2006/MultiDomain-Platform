import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CustomerProfile.css';
import './CustomerDashboard.css';
import Navbar from './Navbar';
import { fetchCurrentUser, updateUserProfile } from '../api';

// Icons
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);

const CustomerProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        preferredDomain: 'All',
        emailNotifs: true,
        appNotifs: true
    });

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        fetchCurrentUser(token)
            .then(userData => {
                setUserId(userData._id);
                setFormData(prev => ({
                    ...prev,
                    fullName: userData.name || prev.fullName,
                    email: userData.email || prev.email,
                    phone: userData.phone || prev.phone,
                    address: userData.address || prev.address,
                    preferredDomain: userData.domain || prev.preferredDomain,
                }));
            })
            .catch(err => console.error("Failed to fetch profile", err))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('authToken');
            if (token && userId) {
                const updatedData = {
                    name: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    domain: formData.preferredDomain,
                };
                await updateUserProfile(userId, updatedData, token);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (loading) return (
        <div className="profile-container">
            <div className="loader-container" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader"></div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <Navbar active="profile" />

            <main className="dashboard-content">
                <form onSubmit={handleSave}>
                    {/* Header Card */}
                    <div className="profile-header-card">
                        <div className="profile-avatar">
                            {formData.fullName.charAt(0)}
                        </div>
                        <div className="profile-info">
                            <h1>{formData.fullName}</h1>
                            <p>{formData.email}</p>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="profile-form-card">
                        <h3 className="section-title">Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    readOnly // Read-only
                                />
                            </div>
                            <div className="form-field">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="form-field">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter your address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="profile-form-card">
                        <h3 className="section-title">Preferences</h3>
                        <div className="form-field" style={{ maxWidth: '50%', marginBottom: '1.5rem' }}>
                            <label>Preferred Domain</label>
                            <select
                                name="preferredDomain"
                                value={formData.preferredDomain}
                                onChange={handleChange}
                            >
                                <option value="All">All Domains</option>
                                <option value="Home Services">Home Services</option>
                                <option value="IT Services">IT Services</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>

                        <div className="toggle-field">
                            <div className="toggle-label">
                                <span>Email Notifications</span>
                                <small>Receive booking updates via email</small>
                            </div>
                            <input
                                type="checkbox"
                                name="emailNotifs"
                                checked={formData.emailNotifs}
                                onChange={handleChange}
                                style={{ transform: 'scale(1.5)', accentColor: 'var(--primary-blue)' }}
                            />
                        </div>
                        <div className="toggle-field">
                            <div className="toggle-label">
                                <span>App Notifications</span>
                                <small>Receive push notifications on mobile</small>
                            </div>
                            <input
                                type="checkbox"
                                name="appNotifs"
                                checked={formData.appNotifs}
                                onChange={handleChange}
                                style={{ transform: 'scale(1.5)', accentColor: 'var(--primary-blue)' }}
                            />
                        </div>
                    </div>

                    {/* Security (Visual Only) */}
                    <div className="profile-form-card">
                        <h3 className="section-title">Security</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" className="btn-secondary" style={{ width: 'auto' }}>Change Password</button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="profile-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CustomerProfile;
