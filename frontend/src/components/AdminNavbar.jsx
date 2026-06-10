import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const FileTextIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const AlertIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const ChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

const AdminNavbar = ({ active }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    // Helper to determine if parent category is active
    const isManageActive = ['approvals', 'services', 'complaints', 'analytics', 'reports'].includes(active);

    return (
        <header className="admin-header">
            <div className="logo-section">
                <div className="logo-icon-box">
                    <div className="logo-dot"></div>
                </div>
                <span className="admin-brand">MultiDomain Admin</span>
            </div>

            <nav className="admin-nav">
                {/* Primary Links */}
                <Link to="/admin/dashboard" className={`nav-item ${active === 'dashboard' ? 'active' : ''}`}>
                    <HomeIcon /> <span>Dashboard</span>
                </Link>
                <Link to="/admin/users" className={`nav-item ${active === 'users' ? 'active' : ''}`}>
                    <UsersIcon /> <span>Users</span>
                </Link>
                <Link to="/admin/bookings" className={`nav-item ${active === 'bookings' ? 'active' : ''}`}>
                    <BookingIcon /> <span>Bookings</span>
                </Link>

                {/* Dropdown for Everything Else */}
                <div
                    className="nav-dropdown-container"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                >
                    <div className={`nav-item dropdown-trigger ${isManageActive ? 'active' : ''}`}>
                        <span>More</span> <div className="chevron-icon"><ChevronDown /></div>
                    </div>

                    {isDropdownOpen && (
                        <div className="nav-dropdown-menu">
                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Management</div>
                            <Link to="/admin/provider-approvals" className={`nav-item ${active === 'approvals' ? 'active' : ''}`}>
                                <CheckCircleIcon /> <span>Approvals</span>
                            </Link>
                            <Link to="/admin/services" className={`nav-item ${active === 'services' ? 'active' : ''}`}>
                                <ServicesIcon /> <span>Services</span>
                            </Link>
                            <Link to="/admin/complaints" className={`nav-item ${active === 'complaints' ? 'active' : ''}`}>
                                <AlertIcon /> <span>Complaints</span>
                            </Link>

                            <div className="dropdown-divider"></div>

                            <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Insights</div>
                            <Link to="/admin/analytics" className={`nav-item ${active === 'analytics' ? 'active' : ''}`}>
                                <AnalyticsIcon /> <span>Analytics</span>
                            </Link>
                            <Link to="/admin/reports" className={`nav-item ${active === 'reports' ? 'active' : ''}`}>
                                <FileTextIcon /> <span>Reports</span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            <button onClick={handleLogout} className="logout-btn-admin">
                <LogoutIcon /> <span>Logout</span>
            </button>
        </header>
    );
};

export default AdminNavbar;
