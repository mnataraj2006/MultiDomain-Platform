import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { loginUser, googleLogin } from '../api';
import { GoogleLogin } from '@react-oauth/google';

// SVG Icons
const SecurityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);



const ServerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const ChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('credentials'); // 'credentials' | 'mfa'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'Customer', // Default to Customer
        rememberMe: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');



    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };



    const initiateLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await loginUser(formData.email, formData.password);

            // Store auth details
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data._id);

            setIsLoading(false);

            // Redirect based on role
            if (data.role === 'Provider') {
                navigate('/provider/dashboard');
            } else if (data.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/customer-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError('Invalid email or password.');
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
            setError(err.message || 'Google login failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Login was unsuccessful. Try again later');
    };

    return (
        <div className="split-layout">
            {/* Left Panel: Value Proposition */}
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
                            {/* Abstract Node Visualization */}
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

            {/* Right Panel: Auth Hub */}
            <div className="right-panel">
                <div className="auth-container">
                    <div className="auth-header">
                        <h2>Welcome Back</h2>
                        <p>Enter your details to access the workspace.</p>
                    </div>

                    {error && <div className="toast-error">{error}</div>}

                    <form onSubmit={initiateLogin} className="auth-form">

                        <div className="input-group">
                            <div className="custom-select-wrapper">
                                <label className="overhead-label">Who you are</label>
                                <div className="select-container">
                                    <UserIcon />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="custom-select"
                                    >
                                        <option value="Service Provider">Service Provider</option>
                                        <option value="Customer">Customer</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                    <div className="select-arrow"><ChevronDown /></div>
                                </div>
                            </div>
                        </div>

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
                            <label htmlFor="email">Work Email</label>
                        </div>

                        <div className="floating-input-group">
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label htmlFor="password">Password</label>
                        </div>

                        <div className="form-actions">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Remember this device
                            </label>
                            <a href="#" className="forgot-link">Forgot Password?</a>
                        </div>

                        <button type="submit" className="primary-btn" disabled={isLoading}>
                            {isLoading ? <span className="loader"></span> : 'Sign In'}
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

                        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Don't have an account? <Link to="/signup" className="forgot-link" style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>Sign Up</Link>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>Protected by Enterprise Guard™ &bull; v2.4.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
