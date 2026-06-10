const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// --- SETTINGS ---
export const fetchSettings = async (token) => {
    const res = await fetch(`${API_URL}/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return await res.json();
};

export const updateSettings = async (settings, token) => {
    const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return await res.json();
};

export const updatePassword = async (currentPassword, newPassword, token) => {
    const res = await fetch(`${API_URL}/settings/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) throw new Error('Failed to update password');
    return await res.json();
};

// --- AUTH ---
export const loginUser = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
};

export const registerUser = async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Registration failed');
    return await res.json();
};

export const googleLogin = async (tokenId) => {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
    });
    if (!res.ok) throw new Error('Google authentication failed');
    return await res.json();
};

export const updateRole = async (payload, token) => {
    const res = await fetch(`${API_URL}/auth/update-role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Role update failed');
    return await res.json();
};

export const fetchCurrentUser = async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return await res.json();
};

// --- SERVICES ---
export const fetchServices = async () => {
    // Now pointing to /api/services
    const res = await fetch(`${API_URL}/services`);
    if (!res.ok) throw new Error('Failed to fetch services');
    return await res.json();
};

export const fetchServiceDetails = async (id) => {
    const res = await fetch(`${API_URL}/services/${id}`);
    if (!res.ok) throw new Error('Failed to fetch service details');
    return await res.json();
};

export const createService = async (serviceData, token) => {
    const res = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
    });
    if (!res.ok) throw new Error('Failed to create service');
    return await res.json();
};

export const updateService = async (id, serviceData, token) => {
    const res = await fetch(`${API_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceData)
    });
    if (!res.ok) throw new Error('Failed to update service');
    return await res.json();
};

export const updateServiceStatus = async (id, isActive, token) => {
    const res = await fetch(`${API_URL}/services/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
    });
    if (!res.ok) throw new Error('Failed to update service status');
    return await res.json();
};

export const deleteService = async (id, token) => {
    const res = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return await res.json();
};

export const fetchComplaints = async (token) => {
    const res = await fetch(`${API_URL}/complaints`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return await res.json();
};

export const updateComplaintStatus = async (id, status, token) => {
    const res = await fetch(`${API_URL}/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update complaint status');
    return await res.json();
};

// --- BOOKINGS ---
export const createBooking = async (bookingData, token) => {
    const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw new Error('Booking failed');
    return await res.json();
};

export const fetchBookingDetails = async (bookingId, token) => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch booking details');
    return await res.json();
};

export const fetchAllBookings = async (token) => {
    const res = await fetch(`${API_URL}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
};

export const fetchUserBookings = async (userId, token) => {
    // Requires token now
    const res = await fetch(`${API_URL}/bookings/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return await res.json();
};

export const fetchProviderBookings = async (providerId, token) => {
    const res = await fetch(`${API_URL}/bookings/provider/${providerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch provider bookings');
    return await res.json();
};

export const updateBookingStatus = async (id, status, token) => {
    const res = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    return await res.json();
};

export const cancelBooking = async (id, token) => {
    const res = await fetch(`${API_URL}/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return await res.json();
};

// --- PAYMENTS ---
export const fetchProviderPayments = async (providerId, token) => {
    const res = await fetch(`${API_URL}/payments/provider/${providerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch provider payments');
    return await res.json();
};

// --- REVIEWS ---
export const createReview = async (reviewData, token) => {
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return await res.json();
};

export const submitFeedback = async (feedbackData, token) => {
    const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedbackData)
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return await res.json();
};

export const fetchProviderFeedbacks = async (providerId, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/feedback/provider/${providerId}`, {
        headers
    });
    if (!res.ok) throw new Error('Failed to fetch provider feedbacks');
    return await res.json();
};

export const fetchServiceReviews = async (serviceId) => {
    const res = await fetch(`${API_URL}/reviews/service/${serviceId}`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return await res.json();
};

export const fetchProviderReviews = async (providerId) => {
    const res = await fetch(`${API_URL}/reviews/provider/${providerId}`);
    if (!res.ok) throw new Error('Failed to fetch provider reviews');
    return await res.json();
};

// --- USER MANAGEMENT ---
export const fetchAllUsers = async (token) => {
    const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
};

export const updateUserProfile = async (id, userData, token) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to update user profile');
    return await res.json();
};

export const updateUserStatus = async (userId, status, token) => {
    // status is boolean isApproved for now based on backend
    const res = await fetch(`${API_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
};

export const deleteUser = async (userId, token) => {
    const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return await res.json();
};

// --- PROVIDER APPROVAL ---
export const fetchPendingProviders = async (token) => {
    const res = await fetch(`${API_URL}/providers/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch pending providers');
    return await res.json();
};

export const approveProvider = async (id, token) => {
    const res = await fetch(`${API_URL}/providers/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to approve provider');
    return await res.json();
};

export const rejectProvider = async (id, token) => {
    const res = await fetch(`${API_URL}/providers/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to reject provider');
    return await res.json();
};

// --- ANALYTICS (Existing) ---
export const fetchDemandAnalytics = async () => {
    try {
        const res = await fetch(`${API_URL}/analytics/demand`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch demand analytics:", error);
        return [];
    }
};

export const fetchRevenueAnalytics = async () => {
    try {
        const res = await fetch(`${API_URL}/analytics/revenue`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch revenue analytics:", error);
        return { totalRevenue: 0, avgBookingValue: 0 };
    }
};

export const seedDatabase = async () => {
    try {
        await fetch(`${API_URL}/analytics/seed`, { method: 'POST' });
        console.log("Database seeded successfully");
    } catch (error) {
        console.error("Failed to seed database:", error);
    }
};

export const fetchProviderPerformance = async (token) => {
    const res = await fetch(`${API_URL}/analytics/provider/performance`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch provider performance');
    return await res.json();
};

export const fetchAnalyticsProviderRanking = async (token) => {
    const res = await fetch(`${API_URL}/analytics/provider-ranking`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch provider ranking');
    return await res.json();
};

export const fetchAnalyticsUserBehavior = async (token) => {
    const res = await fetch(`${API_URL}/analytics/user-behavior`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch user behavior analytics');
    return await res.json();
};

export const fetchReportDemand = async (token) => {
    const res = await fetch(`${API_URL}/reports/demand`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch demand report');
    return await res.json();
};

export const fetchReportRevenue = async (token) => {
    const res = await fetch(`${API_URL}/reports/revenue`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch revenue report');
    return await res.json();
};
export const fetchReportProvider = async (token) => {
    const res = await fetch(`${API_URL}/reports/provider`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch provider report');
    return await res.json();
};

export const fetchReportUser = async (token) => {
    const res = await fetch(`${API_URL}/reports/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Failed to fetch user report');
    return await res.json();
};
