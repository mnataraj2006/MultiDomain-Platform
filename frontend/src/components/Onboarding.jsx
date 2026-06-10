import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateRole } from '../api';
import './Login.css';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);

const Onboarding = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [domain, setDomain] = useState('Home Services');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [experience, setExperience] = useState('');
    const [availability, setAvailability] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) {
            setError('Please select a role to continue.');
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const dbRole = role === 'Customer' ? 'Customer' : 'Provider';

            const payload = {
                role: dbRole,
                phone,
                address
            };

            if (dbRole === 'Provider') {
                payload.domain = domain;
                payload.experience = experience;
                payload.availability = availability;
            }

            const data = await updateRole(payload, token);

            localStorage.setItem('userRole', data.role);

            if (data.role === 'Provider') {
                navigate('/provider/dashboard');
            } else {
                navigate('/customer-dashboard');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update role. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="split-layout" style={{ justifyContent: 'center', backgroundColor: 'var(--bg-dark)', overflowY: 'auto', padding: '2rem 0' }}>
            <div className="auth-container" style={{ margin: 'auto' }}>
                <div className="auth-header">
                    <h2>Welcome! Let's get started.</h2>
                    <p>Select how you want to use the platform.</p>
                </div>

                {error && <div className="toast-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div
                        onClick={() => setRole('Customer')}
                        style={{
                            padding: '1.5rem',
                            border: `2px solid ${role === 'Customer' ? 'var(--primary-blue)' : 'var(--border-subtle)'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            backgroundColor: role === 'Customer' ? 'rgba(0,123,255,0.05)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ padding: '0.8rem', backgroundColor: 'rgba(0,123,255,0.1)', borderRadius: '8px' }}>
                            <UserIcon />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>I'm a Customer</h3>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>I want to hire service professionals.</p>
                        </div>
                    </div>

                    <div
                        onClick={() => setRole('Provider')}
                        style={{
                            padding: '1.5rem',
                            border: `2px solid ${role === 'Provider' ? 'var(--accent-green)' : 'var(--border-subtle)'}`,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            backgroundColor: role === 'Provider' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ padding: '0.8rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>
                            <BriefcaseIcon />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>I'm a Service Provider</h3>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>I want to offer my services and earn.</p>
                        </div>
                    </div>

                    {role === 'Customer' && (
                        <div className="extra-fields" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div className="input-group">
                                <label className="overhead-label">Phone Number *</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Enter your phone number" className="form-input" />
                            </div>
                            <div className="input-group">
                                <label className="overhead-label">Home Address *</label>
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Enter your full address" className="form-input" />
                            </div>
                        </div>
                    )}

                    {role === 'Provider' && (
                        <div className="extra-fields" style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div className="input-group">
                                <label className="overhead-label">Phone Number *</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Enter your phone number" className="form-input" />
                            </div>

                            <div className="input-group">
                                <label className="overhead-label">What is your primary service domain? *</label>
                                <select
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="custom-select"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                                >
                                    <option value="Home Services">Home Services (Cleaning, Repair)</option>
                                    <option value="IT Support">IT Support (Network, Hardware)</option>
                                    <option value="Healthcare">Healthcare (Nursing, Care)</option>
                                    <option value="Education">Education (Tutoring)</option>
                                    <option value="Logistics">Logistics (Delivery, Moving)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="overhead-label">Years of Experience</label>
                                <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 5 years" className="form-input" />
                            </div>

                            <div className="checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input type="checkbox" id="availability" checked={availability} onChange={(e) => setAvailability(e.target.checked)} />
                                <label htmlFor="availability" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>I am currently available to take bookings</label>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="primary-btn" disabled={!role || isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? <span className="loader"></span> : 'Continue'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Onboarding;
