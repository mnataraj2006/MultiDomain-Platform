import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing the login styles for consistency

// Icons
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const ServerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
);
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.9 3.23" /><path d="M17.81 17.81A10.45 10.45 0 0 1 12 19c-7 0-10-7-10-7a19.04 19.04 0 0 1 3-3.16" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);

import { registerUser, googleLogin } from '../api';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'Customer',
        domain: 'Home Services', // Default domain
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validate = () => {
        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            await registerUser({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role === 'Service Provider' ? 'Provider' : 'Customer', // Map UI role to DB role
                phone: formData.phone,
                domain: formData.role === 'Service Provider' ? formData.domain : undefined
            });

            setIsLoading(false);
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Registration failed. Try again.');
            setIsLoading(false);
        }
    };
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            const data = await googleLogin(credentialResponse.credential);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data._id);

            setIsLoading(false);

            if (data.isNewUser) {
                navigate('/onboarding');
            } else if (data.role === 'Provider') {
                navigate('/provider/dashboard');
            } else if (data.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/customer-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Google registration failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google signup was unsuccessful. Try again later');
    };

    return (
        <div className="split-layout">
            {/* Left Panel: Branding & Visuals (Same as Login) */}
            <div className="left-panel">
                <div className="mesh-gradient"></div>
                <div className="content-overlay">
                    <div className="brand-header">
                        <div className="logo-box">
                            <div className="logo-rect"></div>
                        </div>
                        <span className="brand-name">MultiDomain<span className="highlight">Platform</span></span>
                    </div>

                    <div className="visual-center">
                        <div className="network-viz">
                            <div className="node center-node"></div>
                            <div className="node orbit-node n1"></div>
                            <div className="node orbit-node n2"></div>
                            <div className="node orbit-node n3"></div>
                            <div className="link l1"></div>
                            <div className="link l2"></div>
                            <div className="link l3"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Signup Form */}
            <div className="right-panel">
                <div className="auth-container">
                    <div className="auth-header" style={{ marginTop: '2rem' }}>
                        <h2>Create Account</h2>
                        <p>Join the enterprise network today.</p>
                    </div>

                    {error && <div className="toast-error">{error}</div>}

                    <form onSubmit={handleSignup} className="auth-form">

                        {/* Role Selection */}
                        <div className="input-group">
                            <div className="custom-select-wrapper">
                                <label className="overhead-label">I am a</label>
                                <div className="select-container">
                                    <UserIcon />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="custom-select"
                                    >
                                        <option value="Customer">Customer</option>
                                        <option value="Service Provider">Service Provider</option>
                                    </select>
                                    <div className="select-arrow"><ChevronDown /></div>
                                </div>
                            </div>
                        </div>

                        {/* Domain Selection (Conditional) */}
                        {formData.role === 'Service Provider' && (
                            <div className="input-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                                <div className="custom-select-wrapper">
                                    <label className="overhead-label">Service Domain</label>
                                    <div className="select-container">
                                        <ServerIcon />
                                        <select
                                            name="domain"
                                            value={formData.domain}
                                            onChange={handleChange}
                                            className="custom-select"
                                        >
                                            <option value="Home Services">Home Services (Cleaning, Repair)</option>
                                            <option value="IT Support">IT Support (Network, Hardware)</option>
                                            <option value="Healthcare">Healthcare (Nursing, Care)</option>
                                            <option value="Education">Education (Tutoring)</option>
                                            <option value="Logistics">Logistics (Delivery, Moving)</option>
                                        </select>
                                        <div className="select-arrow"><ChevronDown /></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="floating-input-group">
                            <input
                                type="text"
                                name="fullName"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label htmlFor="fullName">Full Name</label>
                        </div>

                        {/* Email */}
                        <div className="floating-input-group">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label htmlFor="email">Email Address</label>
                        </div>

                        {/* Phone (Optional) */}
                        <div className="floating-input-group">
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label htmlFor="phone">Phone Number (Optional)</label>
                        </div>

                        {/* Password */}
                        <div className="floating-input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="floating-input-group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? <span className="loader"></span> : 'Sign Up'}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                            <span style={{ padding: '0 10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Or continue with</span>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    </form>

                    <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Already have an account? <Link to="/login" className="forgot-link" style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
