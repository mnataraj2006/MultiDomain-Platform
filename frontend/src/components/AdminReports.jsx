import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminReports.css';
import './AdminDashboard.css'; // Shared styles like header/nav
import AdminNavbar from './AdminNavbar';
import { fetchReportDemand, fetchReportRevenue, fetchReportProvider, fetchReportUser } from '../api';

// Icons
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const ServicesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const BookingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AnalyticsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const FileTextIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const DownloadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const FilterIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

const AdminReports = () => {
    const navigate = useNavigate();
    const [selectedReport, setSelectedReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [reportData, setReportData] = useState(null);

    // Mock Report Types
    const reportTypes = [
        { id: 'demand', title: 'Demand Reports', description: 'Analyze booking volume by domain, service, and location.', icon: <AnalyticsIcon /> },
        { id: 'revenue', title: 'Revenue Reports', description: 'Financial breakdowns, earnings by provider, and platform fees.', icon: <span style={{ fontSize: '1.5rem' }}>$</span> },
        { id: 'provider', title: 'Provider Performance', description: 'Success rates, cancellation stats, and rating trends.', icon: <ServicesIcon /> },
        { id: 'user', title: 'User Activity', description: 'New registrations, active users, and retention metrics.', icon: <UsersIcon /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const handleGenerate = async () => {
        if (!selectedReport) return;
        setIsGenerating(true);
        setShowPreview(false);
        try {
            const token = localStorage.getItem('authToken');
            let data = null;
            if (selectedReport.id === 'demand') {
                data = await fetchReportDemand(token);
            } else if (selectedReport.id === 'revenue') {
                data = await fetchReportRevenue(token);
            } else if (selectedReport.id === 'provider') {
                data = await fetchReportProvider(token);
            } else if (selectedReport.id === 'user') {
                data = await fetchReportUser(token);
            } else {
            }
            setReportData(data);
            setShowPreview(true);
        } catch (error) {
            console.error("Failed to generate report", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = (format) => {
        alert(`Downloading ${selectedReport.title} as ${format}...`);
    };

    return (
        <div className="admin-container">
            <AdminNavbar active="reports" />

            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Reports & Insights</h1>
                        <p className="page-subtitle">Generate and download comprehensive business reports</p>
                    </div>
                </div>

                <div className="reports-layout">
                    {/* 1. Report Categories */}
                    <div className="report-categories-grid">
                        {reportTypes.map((report) => (
                            <div
                                key={report.id}
                                className={`report-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                                onClick={() => { setSelectedReport(report); setShowPreview(false); }}
                            >
                                <div className="report-icon-box">{report.icon}</div>
                                <div className="report-info">
                                    <h3>{report.title}</h3>
                                    <p>{report.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Filters (Show only if report selected) */}
                    {selectedReport && (
                        <div className="report-filters-container">
                            <div className="filters-header">
                                <FilterIcon /> Report Configuration: {selectedReport.title}
                            </div>
                            <div className="filters-row">
                                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                    <label className="admin-label">Date Range</label>
                                    <select className="admin-select">
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                        <option>This Month</option>
                                        <option>Last Quarter</option>
                                    </select>
                                </div>
                                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                    <label className="admin-label">Domain Filter</label>
                                    <select className="admin-select">
                                        <option>All Domains</option>
                                        <option>Home Services</option>
                                        <option>Cleaning</option>
                                        <option>Repair</option>
                                    </select>
                                </div>
                                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                    <label className="admin-label">Format</label>
                                    <select className="admin-select">
                                        <option>Standard Report</option>
                                        <option>Detailed Breakdown</option>
                                    </select>
                                </div>
                                <button className="report-btn-primary" onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 3. Preview Section */}
                    {showPreview && reportData && (
                        <div className="report-preview-section">
                            <div className="preview-header">
                                <span className="preview-title">{reportData.title || selectedReport.title} - Preview ({reportData.recordCount} records)</span>
                                <div className="download-options">
                                    <button className="btn-download pdf" onClick={() => handleDownload('PDF')}>
                                        <DownloadIcon /> Download PDF
                                    </button>
                                    <button className="btn-download csv" onClick={() => handleDownload('CSV')}>
                                        <DownloadIcon /> Export CSV
                                    </button>
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="preview-table">
                                    <thead>
                                        <tr>
                                            {reportData.data && reportData.data.length > 0 ? (
                                                Object.keys(reportData.data[0]).slice(0, 5).map(key => (
                                                    <th key={key}>{key}</th>
                                                ))
                                            ) : (
                                                <th>No Data</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.data && reportData.data.slice(0, 5).map((row, i) => (
                                            <tr key={i}>
                                                {Object.keys(row).slice(0, 5).map((key, j) => (
                                                    <td key={j}>{typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key])}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                                * Preview showing up to first 5 rows and 5 columns only
                            </div>
                        </div>
                    )}

                    {!selectedReport && (
                        <div className="no-selection-placeholder">
                            <div style={{ opacity: 0.3, marginBottom: '1rem' }}><FileTextIcon /></div>
                            <p>Select a report category above to get started.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminReports;
