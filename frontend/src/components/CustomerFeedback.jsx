import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitFeedback } from '../api';
import Navbar from './Navbar';
import './CustomerFeedback.css';

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const CustomerFeedback = () => {
    const { id } = useParams(); // Booking ID
    const navigate = useNavigate();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }

        if (!review.trim()) {
            setError('Please write a brief review.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            await submitFeedback({
                serviceRequestId: id,
                rating,
                review,
                photos: [] // Placeholder for photo upload integration
            }, token);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to submit feedback.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
            <Navbar />

            <div className="feedback-container">
                <div className="feedback-card">
                    {success ? (
                        <div className="success-state">
                            <div className="success-icon">
                                <CheckIcon />
                            </div>
                            <h2>Thank You for Your Feedback!</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Your rating helps us improve the quality of service for everyone.</p>
                            <button
                                className="btn-submit"
                                style={{ marginTop: '2rem' }}
                                onClick={() => navigate('/my-bookings')}
                            >
                                Return to Bookings
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="feedback-header">
                                <h1>Service Completed</h1>
                                <p>How was your experience with the service provider?</p>
                            </div>

                            {error && <div className="toast-error" style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="rating-container">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div
                                            key={star}
                                            className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <StarIcon />
                                        </div>
                                    ))}
                                </div>

                                <textarea
                                    className="review-input"
                                    placeholder="Tell us what you liked about the service, and what could be improved..."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                ></textarea>

                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerFeedback;
