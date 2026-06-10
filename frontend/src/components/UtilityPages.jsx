import React from 'react';
import { Link } from 'react-router-dom';
import './UtilityPages.css';

export const NotFound = () => (
    <div className="utility-page-container">
        <div className="utility-card">
            <h1 className="utility-title">404</h1>
            <p className="utility-subtitle">Oops! The page you are looking for does not exist or has been moved.</p>
            <Link to="/" className="utility-btn">Go Back Home</Link>
        </div>
    </div>
);

export const AccessDenied = () => (
    <div className="utility-page-container">
        <div className="utility-card">
            <h1 className="utility-title error">Access Denied</h1>
            <p className="utility-subtitle">You do not have permission to access this page. Please contact your administrator if you believe this is an error.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/" className="utility-btn" style={{ background: 'transparent', border: '1px solid var(--text-muted)' }}>Go Home</Link>
                <Link to="/login" className="utility-btn">Login</Link>
            </div>
        </div>
    </div>
);
