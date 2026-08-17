import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchServiceDetails, createBooking, fetchCurrentUser } from '../api';
import './BookService.css';
import './Login.css'; // Access shared button styles if needed

// Icons
const LogoIcon = () => (
    <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 16, height: 16, background: '#007BFF', boxShadow: '0 0 8px #007BFF' }}></div>
    </div>
);

const BookService = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '',
        location: '',
        notes: ''
    });

    const [service, setService] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locatingError, setLocatingError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchServiceAndUser = async () => {
            try {
                const serviceData = await fetchServiceDetails(serviceId);
                setService(serviceData);

                // Pre-populate location with customer's saved address
                const userData = await fetchCurrentUser(token);
                if (userData && userData.address) {
                    setBookingData(prev => ({
                        ...prev,
                        location: userData.address
                    }));
                }
            } catch (error) {
                console.error("Failed to load booking details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServiceAndUser();
    }, [navigate, serviceId]);

    const handleGetLiveLocation = () => {
        if (!navigator.geolocation) {
            setLocatingError('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        setLocatingError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                        headers: {
                            'Accept-Language': 'en'
                        }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.display_name) {
                            setBookingData(prev => ({ ...prev, location: data.display_name }));
                        } else {
                            setBookingData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
                        }
                    } else {
                        setBookingData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
                    }
                } catch (geocodeErr) {
                    console.error("Geocoding error:", geocodeErr);
                    setBookingData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
                } finally {
                    setIsLocating(false);
                }
            },
            (geoErr) => {
                console.error("Geolocation error:", geoErr);
                let msg = 'Failed to retrieve your location.';
                if (geoErr.code === geoErr.PERMISSION_DENIED) {
                    msg = 'Location permission was denied.';
                } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
                    msg = 'Location information is unavailable.';
                } else if (geoErr.code === geoErr.TIMEOUT) {
                    msg = 'Location request timed out.';
                }
                setLocatingError(msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        try {
            const newBooking = {
                customerId: userId,
                providerId: service.providerId,
                providerName: service.providerName,
                service: service.name,
                domain: service.category,
                date: bookingData.date,
                time: bookingData.time,
                location: bookingData.location,
                notes: bookingData.notes,
                price: service.price
            };

            const res = await createBooking(newBooking, token);
            setSubmitting(false);
            navigate(`/booking/${res._id}`); // Pass the new booking ID!
        } catch (error) {
            console.error(error);
            setSubmitting(false);
            alert('Failed to create booking');
        }
    };

    if (loading) return (
        <div className="book-container">
            <div className="loader-container" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader"></div>
            </div>
        </div>
    );

    return (
        <div className="book-container">
            <nav className="navbar-book">
                <Link to="/" className="nav-brand"><LogoIcon /><span>MultiDomain</span></Link>
                <div className="nav-buttons">
                    <button onClick={() => {
                        localStorage.removeItem('authToken');
                        navigate('/login');
                    }} className="logout-btn">Logout</button>
                </div>
            </nav>

            <div className="book-content">
                <div className="booking-card">
                    <div className="booking-header">
                        <h1>Confirm Booking</h1>
                        <p>Complete the details below to schedule your service.</p>
                    </div>

                    <div className="service-summary-mini">
                        <div className="summary-info">
                            <h3>{service.name}</h3>
                            <p>{service.providerName} &bull; {service.category}</p>
                        </div>
                        <span className="summary-price">₹{service.price}</span>
                    </div>

                    <form onSubmit={handleSubmit} className="booking-form">
                        <div className="form-group">
                            <label>Preferred Date</label>
                            <input
                                type="date"
                                name="date"
                                className="form-input"
                                required
                                value={bookingData.date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Time Slot</label>
                            <input
                                type="time"
                                name="time"
                                className="form-input"
                                required
                                value={bookingData.time}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ margin: 0 }}>Service Location</label>
                                <button
                                    type="button"
                                    onClick={handleGetLiveLocation}
                                    disabled={isLocating}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary-blue)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        lineHeight: '1'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)'}
                                >
                                    {isLocating ? (
                                        <>
                                            <span className="loader" style={{ width: '10px', height: '10px', borderWidth: '2px', marginRight: '4px', verticalAlign: 'middle' }}></span>
                                            Locating...
                                        </>
                                    ) : (
                                        <>
                                            <span>📍</span> Get Live Location
                                        </>
                                    )}
                                </button>
                            </div>
                            <input
                                type="text"
                                name="location"
                                className="form-input"
                                placeholder="123 Main St, Suite 4B..."
                                required
                                value={bookingData.location}
                                onChange={handleChange}
                                disabled={isLocating}
                            />
                            {locatingError && (
                                <span style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                                    {locatingError}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Additional Notes (Optional)</label>
                            <textarea
                                name="notes"
                                className="form-textarea"
                                placeholder="Any specific requirements or instructions..."
                                value={bookingData.notes}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => navigate(-1)} className="secondary-btn" style={{ marginTop: 0 }}>
                                Cancel
                            </button>
                            <button type="submit" className="primary-btn" disabled={submitting}>
                                {submitting ? <span className="loader"></span> : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookService;
