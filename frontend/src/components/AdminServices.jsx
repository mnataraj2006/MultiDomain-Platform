import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminServices.css';
import './AdminUsers.css'; // Shared basic styles
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';
import { fetchServices, createService, updateService, deleteService, updateServiceStatus } from '../api';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const EditIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const AdminServices = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [services, setServices] = useState([]);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        domain: 'Home Services',
        name: '',
        description: '',
        price: '',
        active: true
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const loadServices = async () => {
            try {
                const data = await fetchServices();
                const formatted = data.map(s => ({
                    id: s._id,
                    domain: s.category,
                    name: s.title,
                    description: s.description,
                    price: s.basePrice,
                    active: s.isActive !== false // Assuming true if undefined
                }));
                setServices(formatted);
            } catch (error) {
                console.error("Failed to load services", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadServices();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            const payload = {
                title: formData.name,
                category: formData.domain,
                description: formData.description,
                basePrice: formData.price,
                isActive: formData.active
            };

            if (isEditing) {
                await updateService(formData.id, payload, token);
                setServices(services.map(s => s.id === formData.id ? { ...formData } : s));
            } else {
                const newServ = await createService(payload, token);
                setServices([{
                    id: newServ._id,
                    domain: newServ.category,
                    name: newServ.title,
                    description: newServ.description,
                    price: newServ.basePrice,
                    active: newServ.isActive !== false
                }, ...services]);
            }
            resetForm();
        } catch (error) {
            console.error("Failed to save service", error);
            alert("Failed to save service");
        }
    };

    const handleEdit = (service) => {
        setFormData({ ...service });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const token = localStorage.getItem('authToken');
                await deleteService(id, token);
                setServices(services.filter(s => s.id !== id));
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('authToken');
            await updateServiceStatus(id, !currentStatus, token);
            setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            domain: 'Home Services',
            name: '',
            description: '',
            price: '',
            active: true
        });
        setIsEditing(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Services...</h2>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <AdminNavbar active="services" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Service & Domain Management</h1>
                        <p className="page-subtitle">Add, edit, and manage services and categories</p>
                    </div>
                </div>

                <div className="service-management-layout">
                    {/* Left Column: Form */}
                    <div className="service-form-card">
                        <div className="form-header">
                            <h3>{isEditing ? 'Edit Service' : 'Add New Service'}</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-group">
                                <label className="admin-label">Domain Category</label>
                                <select
                                    name="domain"
                                    className="admin-select"
                                    value={formData.domain}
                                    onChange={handleChange}
                                >
                                    <option>Home Services</option>
                                    <option>Cleaning</option>
                                    <option>Repair</option>
                                    <option>Logistics</option>
                                    <option>Health</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Service Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="admin-input"
                                    placeholder="e.g. Electrical Wiring"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Description</label>
                                <textarea
                                    name="description"
                                    className="admin-textarea"
                                    placeholder="Brief description of service..."
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-label">Base Price</label>
                                <input
                                    type="text"
                                    name="price"
                                    className="admin-input"
                                    placeholder="e.g. $50"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-toggle-row">
                                <span className="toggle-label">Active Status</span>
                                <div
                                    className={`toggle-switch ${formData.active ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                                >
                                    <div className="toggle-knob"></div>
                                </div>
                            </div>

                            <button type="submit" className="admin-btn-primary">
                                {isEditing ? 'Update Service' : 'Add Service'}
                            </button>
                            {isEditing && (
                                <button type="button" className="admin-btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Right Column: List */}
                    <div className="services-list-container">
                        {services.map(service => (
                            <div key={service.id} className="service-item-row">
                                <div className="service-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span className="service-title-text">{service.name}</span>
                                        <span className="domain-tag">{service.domain}</span>
                                    </div>
                                    <div className="service-meta-text">
                                        <span>{service.price}</span>
                                        <span>•</span>
                                        <span style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{service.description}</span>
                                    </div>
                                </div>

                                <div className="service-status">
                                    <span
                                        className={`status-indicator ${service.active ? 'status-active' : 'status-inactive'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleToggleStatus(service.id, service.active)}
                                        title="Click to toggle status"
                                    >
                                        {service.active ? 'Active' : 'Inactive'}
                                    </span>

                                    <div className="list-actions">
                                        <button className="btn-icon" onClick={() => handleEdit(service)} title="Edit">
                                            <EditIcon />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleDelete(service.id)} title="Delete" style={{ color: '#ef4444', borderColor: 'transparent' }}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminServices;
