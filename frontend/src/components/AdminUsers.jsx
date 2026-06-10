import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminUsers.css';
import './AdminUsers.css';
import './AdminDashboard.css'; // Reusing header styles
import AdminNavbar from './AdminNavbar';
import { fetchAllUsers, updateUserStatus } from '../api';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

const AdminUsers = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All'); // All, Customer, Provider, Pending
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadUsers = async () => {
            try {
                const data = await fetchAllUsers(token);
                // Map db fields
                const formatted = data.map(u => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    status: u.isApproved ? 'Active' : (u.role === 'Provider' ? 'Pending' : 'Active'),
                    joined: new Date(u.createdAt).toLocaleDateString()
                }));
                setUsers(formatted);
            } catch (error) {
                console.error("Failed to load users", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsers();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateUserStatus(id, true, token);
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Active' } : u));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeactivate = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateUserStatus(id, false, token);
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Inactive' } : u));
        } catch (error) {
            console.error(error);
        }
    };

    const handleActivate = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateUserStatus(id, true, token);
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Active' } : u));
        } catch (error) {
            console.error(error);
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesFilter = activeFilter === 'All'
            ? true
            : activeFilter === 'Pending'
                ? user.status === 'Pending'
                : user.role === activeFilter;

        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Users...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="users" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>User Management</h1>
                        <p className="page-subtitle">Manage customers, service providers, and approvals</p>
                    </div>
                    {/* Optional: Add User Button could go here */}
                </div>

                <div className="controls-bar">
                    <div className="filter-group">
                        {['All', 'Customer', 'Provider', 'Pending'].map(filter => (
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
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="user-list-container">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name / Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-name">{user.name}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                                <div className="status-dot"></div>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>{user.joined}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {user.status === 'Pending' && (
                                                    <button className="btn-text btn-approve" onClick={() => handleApprove(user.id)}>
                                                        Approve
                                                    </button>
                                                )}
                                                {user.status === 'Active' && (
                                                    <button className="btn-text btn-deactivate" onClick={() => handleDeactivate(user.id)}>
                                                        Deactivate
                                                    </button>
                                                )}
                                                {user.status === 'Inactive' && (
                                                    <button className="btn-text" onClick={() => handleActivate(user.id)}>
                                                        Activate
                                                    </button>
                                                )}
                                                <button className="btn-icon">
                                                    <EyeIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
