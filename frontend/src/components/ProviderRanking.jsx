import React, { useState, useEffect } from 'react';
import './ProviderRanking.css';
import './AdminDetailedAnalytics.css'; // Inherit general analytics layout
import './AdminDashboard.css';
import AdminNavbar from './AdminNavbar';
import { fetchAnalyticsProviderRanking } from '../api';

const TrophyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>;

const ProviderRanking = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sort, setSort] = useState('Score');
    const [domainFilter, setDomainFilter] = useState('All');

    const [providers, setProviders] = useState([]);

    useEffect(() => {
        const loadRankings = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const rankingData = await fetchAnalyticsProviderRanking(token);

                const formatted = rankingData.map((r, index) => ({
                    rank: index + 1,
                    name: r.providerName,
                    domain: r.domain || 'Various',
                    rating: r.rating || 0,
                    completion: r.completionRate || 0,
                    jobs: r.completedJobs || 0,
                    score: (r.completedJobs || 0) * 10 + (r.revenueGenerated || 0) * 0.1 // Simplified score
                }));

                setProviders(formatted);
            } catch (error) {
                console.error("Failed to load provider ranking", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRankings();
    }, []);

    const filteredProviders = providers.filter(p => domainFilter === 'All' || p.domain === domainFilter);

    if (isLoading) return <div className="dashboard-loading"><div className="loader"></div></div>;

    return (
        <div className="admin-container">
            <AdminNavbar active="analytics" />
            <main className="admin-content">
                <div className="page-header">
                    <div className="page-title">
                        <h1>Provider Ranking</h1>
                        <p className="page-subtitle">Top service providers based on performance metrics</p>
                    </div>
                    <div className="filter-group">
                        <select className="admin-select" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)}>
                            <option value="All">All Domains</option>
                            <option value="Home Services">Home Services</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="IT Support">IT Support</option>
                        </select>
                        <div className="filter-divider"></div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sort by:</span>
                        <button className={`filter-btn ${sort === 'Score' ? 'active' : ''}`} onClick={() => setSort('Score')}>Score</button>
                        <button className={`filter-btn ${sort === 'Rating' ? 'active' : ''}`} onClick={() => setSort('Rating')}>Rating</button>
                    </div>
                </div>

                <div className="analytics-container">
                    {/* Top 3 Podium Cards */}
                    {domainFilter === 'All' && providers.length >= 3 && (
                        <div className="top-providers-grid">
                            <div className="top-provider-card rank-2" style={{ marginTop: '2rem' }}>
                                <div className="medal-icon">🥈</div>
                                <div className="provider-name-lg">{providers[1]?.name}</div>
                                <div className="provider-domain-sm">{providers[1]?.domain}</div>
                                <div className="score-badge">{providers[1]?.score} Score</div>
                            </div>
                            <div className="top-provider-card rank-1">
                                <div className="medal-icon">🥇</div>
                                <div className="provider-name-lg">{providers[0]?.name}</div>
                                <div className="provider-domain-sm">{providers[0]?.domain}</div>
                                <div className="score-badge" style={{ background: '#fbbf24', color: '#000' }}>{providers[0]?.score} Score</div>
                            </div>
                            <div className="top-provider-card rank-3" style={{ marginTop: '3rem' }}>
                                <div className="medal-icon">🥉</div>
                                <div className="provider-name-lg">{providers[2]?.name}</div>
                                <div className="provider-domain-sm">{providers[2]?.domain}</div>
                                <div className="score-badge">{providers[2]?.score} Score</div>
                            </div>
                        </div>
                    )}

                    <div className="ranking-table-container">
                        <table className="ranking-table">
                            <thead>
                                <tr>
                                    <th className="rank-cell">#</th>
                                    <th>Provider Name</th>
                                    <th>Domain</th>
                                    <th>Rating</th>
                                    <th>Completion Rate</th>
                                    <th>Performance Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProviders.map((p) => (
                                    <tr key={p.rank}>
                                        <td className="rank-cell">{p.rank}</td>
                                        <td style={{ fontWeight: '500' }}>{p.name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{p.domain}</td>
                                        <td>⭐ {p.rating}</td>
                                        <td>
                                            {p.completion}%
                                            <div className="performance-bar">
                                                <div className="performance-fill" style={{ width: `${p.completion}%` }}></div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>{p.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProviderRanking;
