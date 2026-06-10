import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ProviderEarnings.css';
import '../components/ProviderDashboard.css'; // Shared Header
import { fetchCurrentUser, fetchProviderPayments } from '../api';

// Icons
const DashboardIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const RequestsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const BookingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const ProviderEarnings = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('Month'); // Day, Week, Month
    const [stats, setStats] = useState({});
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const loadEarnings = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const user = await fetchCurrentUser(token);
                const payments = await fetchProviderPayments(user._id, token);

                let total = 0;
                let today = 0;
                let month = 0;
                let pending = 0;

                const todayDate = new Date();
                const currentMonth = todayDate.getMonth();
                const currentYear = todayDate.getFullYear();

                const formattedTxns = payments.map(p => {
                    const amount = Number(p.amount) || 0;
                    const paymentDate = new Date(p.createdAt);

                    if (p.status === 'Completed' || p.status === 'Paid') {
                        total += amount;
                        if (paymentDate.getDate() === todayDate.getDate() &&
                            paymentDate.getMonth() === currentMonth &&
                            paymentDate.getFullYear() === currentYear) {
                            today += amount;
                        }
                        if (paymentDate.getMonth() === currentMonth &&
                            paymentDate.getFullYear() === currentYear) {
                            month += amount;
                        }
                    } else if (p.status === 'Pending') {
                        pending += amount;
                    }

                    return {
                        id: p.transactionId || p._id,
                        bookingId: p.bookingId,
                        service: 'Service Payment', // Real service name not fully populated here without aggregating booking
                        date: paymentDate.toLocaleDateString(),
                        amount: amount,
                        status: p.status
                    };
                });

                setStats({ today, month, total, pending });
                setTransactions(formattedTxns);
            } catch (error) {
                console.error("Failed to load earnings", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadEarnings();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <p>Calculated Earnings...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-box-small">
                        <div className="logo-rect-small"></div>
                    </div>
                    <span className="header-brand">MultiDomain Provider</span>
                </div>
                <nav className="header-nav">
                    <Link to="/provider/dashboard" className="header-link">
                        <DashboardIcon /> Dashboard
                    </Link>
                    <Link to="/provider/requests" className="header-link">
                        <RequestsIcon /> Requests
                    </Link>
                    <Link to="/provider/bookings" className="header-link">
                        <BookingsIcon /> Booking Management
                    </Link>
                    <Link to="/provider/earnings" className="header-link active">
                        <DollarIcon /> Earnings
                    </Link>
                    <Link to="/provider/profile" className="header-link">
                        <UserIcon /> Profile
                    </Link>
                </nav>
                <button onClick={handleLogout} className="logout-btn">
                    <LogoutIcon /> Logout
                </button>
            </header>

            <main className="content-wrapper">
                <div className="page-header">
                    <h1>Earnings & Payments</h1>
                    <p className="header-subtitle">Track your income, payout history, and pending funds</p>
                </div>

                {/* Summary Cards */}
                <div className="earnings-grid">
                    <div className="earning-card">
                        <div className="earning-icon-wrapper bg-blue"><DollarIcon /></div>
                        <span className="earning-label">Today's Earnings</span>
                        <span className="earning-amount">${stats.today}</span>
                    </div>
                    <div className="earning-card">
                        <div className="earning-icon-wrapper bg-green"><DollarIcon /></div>
                        <span className="earning-label">This Month</span>
                        <span className="earning-amount">${stats.month}</span>
                    </div>
                    <div className="earning-card">
                        <div className="earning-icon-wrapper bg-purple"><DollarIcon /></div>
                        <span className="earning-label">Total Earnings</span>
                        <span className="earning-amount">${stats.total}</span>
                    </div>
                    <div className="earning-card">
                        <div className="earning-icon-wrapper bg-orange"><DollarIcon /></div>
                        <span className="earning-label">Pending Payout</span>
                        <span className="earning-amount">${stats.pending}</span>
                    </div>
                </div>

                {/* Payout Info */}
                <div className="payout-card">
                    <div className="payout-info">
                        <h3>Next Payout: Jan 15, 2026</h3>
                        <p className="payout-detail">To Bank Account: **** **** **** 4829</p>
                    </div>
                    <button className="btn-update">Update Payment Details</button>
                </div>

                {/* Payment History */}
                <div className="history-section">
                    <div className="section-header">
                        <h2 className="section-title">Payment History</h2>
                        <div className="time-filters">
                            {['Week', 'Month', 'Year'].map(filter => (
                                <button
                                    key={filter}
                                    className={`time-btn ${timeFilter === filter ? 'active' : ''}`}
                                    onClick={() => setTimeFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="transaction-list">
                        {transactions.map(txn => (
                            <div key={txn.id} className="transaction-card">
                                <div className="trans-left">
                                    <span className="service-name">{txn.service}</span>
                                    <span className="booking-ref">Ref: {txn.bookingId}</span>
                                    <div className="trans-meta">
                                        <span>{txn.date}</span>
                                        <span>•</span>
                                        <span>ID: {txn.id}</span>
                                    </div>
                                </div>
                                <div className="trans-right">
                                    <span className="trans-amount">${txn.amount.toFixed(2)}</span>
                                    <span className={`status-${txn.status.toLowerCase()}`}>{txn.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderEarnings;
