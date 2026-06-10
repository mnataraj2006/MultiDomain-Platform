import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminComplaints.css';
import './AdminDashboard.css'; // Shared layout
import AdminNavbar from './AdminNavbar';
import { fetchComplaints, updateComplaintStatus } from '../api';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const AlertIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

const AdminComplaints = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadComplaints = async () => {
            try {
                const data = await fetchComplaints(token);
                // The backend Complaint has fields: _id, userId, bookingId, subject, description, priority, status, createdAt
                // Map closely to existing fields
                const formatted = data.map(c => ({
                    id: c._id,
                    user: c.userId?.name || 'Unknown User',
                    type: c.userId?.role || 'Customer',
                    bookingId: c.bookingId || 'N/A',
                    category: c.subject || 'General',
                    date: new Date(c.createdAt).toLocaleDateString(),
                    status: c.status,
                    description: c.description
                }));
                setComplaints(formatted);
            } catch (error) {
                console.error("Failed to load complaints", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadComplaints();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateComplaintStatus(id, newStatus, token);
            setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
            if (newStatus === 'Resolved') setExpandedId(null);
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesFilter = activeFilter === 'All' ? true : c.status === activeFilter;
        const matchesSearch = c.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Feedback...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="complaints" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Feedback & Complaints</h1>
                        <p className="page-subtitle">Monitor and resolve user issues and service feedback</p>
                    </div>
                </div>

                <div className="controls-bar">
                    <div className="filter-group">
                        {['All', 'New', 'In Progress', 'Resolved'].map(filter => (
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
                            placeholder="Search user, ID or booking..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="complaints-list">
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map(complaint => (
                            <div
                                key={complaint.id}
                                className={`complaint-card status-${complaint.status.toLowerCase().replace(' ', '')} ${expandedId === complaint.id ? 'expanded' : ''}`}
                                onClick={() => toggleExpand(complaint.id)}
                            >
                                <div className="complaint-header">
                                    <div className="complaint-meta">
                                        <span className="complaint-id">CP-{complaint.id.substr(-4)} • {complaint.date}</span>
                                        <div className="complaint-title">
                                            {complaint.user}
                                            <span className="complaint-category">{complaint.category}</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '')}`}>
                                        <div className="status-dot"></div>
                                        {complaint.status}
                                    </span>
                                </div>

                                <div className="complaint-info-row">
                                    <span className="info-item"><UserIcon /> {complaint.type}</span>
                                    <span className="info-item"><BookingIcon /> {complaint.bookingId}</span>
                                </div>

                                {expandedId === complaint.id && (
                                    <div className="complaint-details-section" onClick={(e) => e.stopPropagation()}>
                                        <div className="description-box">
                                            <h4>Issue Description</h4>
                                            <p>{complaint.description}</p>
                                        </div>

                                        <div className="action-bar">
                                            {complaint.status !== 'Resolved' && (
                                                <>
                                                    <button className="btn-action btn-escalate">Escalate Issue</button>
                                                    {complaint.status === 'New' && (
                                                        <button
                                                            className="btn-action btn-progress"
                                                            onClick={() => handleUpdateStatus(complaint.id, 'In Progress')}
                                                        >
                                                            Mark In Progress
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-action btn-resolve"
                                                        onClick={() => handleUpdateStatus(complaint.id, 'Resolved')}
                                                    >
                                                        Resolve Complaint
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No complaints found matching filter.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminComplaints;
