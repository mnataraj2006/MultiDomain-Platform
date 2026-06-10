import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Reuse standard user navbar
import './UtilityPages.css';
import './CustomerDashboard.css'; // Reuse form styles

const UserSettings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: 'John Doe',
        phone: '+1 555 0192',
        notifications: true,
        twoFactor: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        alert('Settings Saved Successfully!');
    };

    return (
        <div className="dashboard-container">
            <Navbar active="settings" />
            <div className="dashboard-content">
                <div className="page-header">
                    <div className="welcome-text">
                        <h1>Account Settings</h1>
                        <p>Manage account and security preferences</p>
                    </div>
                </div>

                <div className="settings-layout">
                    {/* Account Settings */}
                    <div className="settings-card">
                        <div className="settings-header">
                            <h2>Profile Information</h2>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" value="john@example.com" disabled style={{ opacity: 0.6 }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="text"
                                className="form-input"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="settings-card">
                        <div className="settings-header">
                            <h2>Security Preferences</h2>
                        </div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Email Notifications</label>
                            <input
                                type="checkbox"
                                name="notifications"
                                checked={formData.notifications}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px' }}
                            />
                        </div>
                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Two-Factor Authentication</label>
                            <input
                                type="checkbox"
                                name="twoFactor"
                                checked={formData.twoFactor}
                                onChange={handleChange}
                                style={{ width: '20px', height: '20px' }}
                            />
                        </div>
                        <div style={{ marginTop: '1.5rem' }}>
                            <button className="btn-secondary" style={{ width: '100%' }}>Change Password</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Save Changes</button>
                        <button className="btn-secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
