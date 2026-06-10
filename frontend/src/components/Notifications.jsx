import React, { useState } from 'react';
import Navbar from './Navbar';
import './UtilityPages.css';
import './CustomerDashboard.css';

const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;

const Notifications = () => {
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Your booking for "Electrical Wiring" has been confirmed by Spark Electric.', time: '2 hours ago', read: false },
        { id: 2, text: 'Provider Elite Cleaners has marked your job as Completed. Please review.', time: '1 day ago', read: false },
        { id: 3, text: 'Welcome to MultiDomain! Complete your profile to get started.', time: '3 days ago', read: true },
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="dashboard-container">
            <Navbar active="notifications" />
            <div className="dashboard-content">
                <div className="page-header">
                    <div className="welcome-text">
                        <h1>Notifications</h1>
                        <p>Recent alerts and platform updates</p>
                    </div>
                </div>

                <div className="notifications-layout">
                    {notifications.length > 0 && <div className="notif-actions">
                        <button className="btn-link" onClick={markAllRead}>Mark all as read</button>
                    </div>}

                    {notifications.map(n => (
                        <div key={n.id} className={`notification-card ${!n.read ? 'unread' : ''}`}>
                            <div className="notif-icon"><BellIcon /></div>
                            <div className="notif-content">
                                <p className="notif-msg">{n.text}</p>
                                <span className="notif-time">{n.time}</span>
                            </div>
                            {!n.read && <div style={{ width: '8px', height: '8px', background: 'var(--primary-blue)', borderRadius: '50%' }}></div>}
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No new notifications.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
