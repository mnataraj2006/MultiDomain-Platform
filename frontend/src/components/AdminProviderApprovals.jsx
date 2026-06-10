import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminProviderApprovals.css';
import './AdminUsers.css'; // Reuse basic layout styles
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';
import { fetchAllUsers, approveProvider, rejectProvider } from '../api';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const FileTextIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

const AdminProviderApprovals = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadProviders = async () => {
            try {
                const users = await fetchAllUsers(token);
                const providersOnly = users.filter(u => u.role === 'Provider');
                const formatted = providersOnly.map(p => ({
                    id: p._id,
                    name: p.name,
                    email: p.email,
                    domain: p.domain || 'Not Specified',
                    status: p.isApproved ? 'Approved' : 'Pending',
                    joined: new Date(p.createdAt).toLocaleDateString(),
                    docs: 'Docs pending view'
                }));
                setProviders(formatted);
            } catch (error) {
                console.error("Failed to load providers", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProviders();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleAction = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            if (newStatus === 'Approved') {
                await approveProvider(id, token);
            } else if (newStatus === 'Rejected') {
                await rejectProvider(id, token);
            }
            // Usually rejected actually removes them or keeps them as Pending, depending on backend.
            // For now optimistic update:
            setProviders(providers.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProviders = providers.filter(p => {
        const matchesFilter = activeFilter === 'All' ? true : p.status.includes(activeFilter);
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Approvals...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="approvals" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Provider Approvals</h1>
                        <p className="page-subtitle">Verify and approve new service provider registrations</p>
                    </div>
                </div>

                <div className="controls-bar">
                    <div className="filter-group">
                        {['Pending', 'Approved', 'Rejected'].map(filter => (
                            <button
                                key={filter}
                                className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="search-box">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search providers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="approval-grid">
                    {filteredProviders.length > 0 ? (
                        filteredProviders.map(provider => (
                            <div key={provider.id} className={`approval-card status-${provider.status.toLowerCase()}`}>
                                <div className="provider-header">
                                    <div className="provider-identity">
                                        <span className="provider-name">{provider.name}</span>
                                        <span className="provider-email">{provider.email}</span>
                                        <span className="domain-badge">{provider.domain}</span>
                                    </div>
                                    <span className={`status-badge status-${provider.status.toLowerCase()}`}>
                                        <div className="status-dot"></div>
                                        {provider.status}
                                    </span>
                                </div>

                                <div className="doc-section">
                                    <FileTextIcon />
                                    <span>{provider.docs}</span>
                                </div>

                                <div className="submission-meta">
                                    <span>Applied on:</span>
                                    <span>{provider.joined}</span>
                                </div>

                                <div className="card-actions">
                                    {provider.status === 'Pending' && (
                                        <>
                                            <button className="action-btn-card btn-approve-card" onClick={() => handleAction(provider.id, 'Approved')}>
                                                Approve
                                            </button>
                                            <button className="action-btn-card btn-reject-card" onClick={() => handleAction(provider.id, 'Rejected')}>
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button className="action-btn-card btn-details-card">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                            <h3>No providers found</h3>
                            <p>No providers match the current filter.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminProviderApprovals;
