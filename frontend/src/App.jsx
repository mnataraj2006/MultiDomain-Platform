import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Onboarding from './components/Onboarding';

import CustomerDashboard from './components/CustomerDashboard';
import BrowseServices from './components/BrowseServices';
import ServiceDetails from './components/ServiceDetails';
import BookService from './components/BookService';
import BookingTracking from './components/BookingTracking';

import MyBookings from './components/MyBookings';
import CustomerProfile from './components/CustomerProfile';
import CustomerFeedback from './components/CustomerFeedback';
import ProviderDashboard from './components/ProviderDashboard';
import ProviderRequests from './components/ProviderRequests';
import ProviderBookings from './components/ProviderBookings';
import ProviderEarnings from './components/ProviderEarnings';

import ProviderAnalytics from './components/ProviderAnalytics';
import ProviderProfile from './components/ProviderProfile';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminProviderApprovals from './components/AdminProviderApprovals';
import AdminServices from './components/AdminServices';
import AdminBookings from './components/AdminBookings';
import AdminAnalytics from './components/AdminAnalytics';
import AdminReports from './components/AdminReports';
import AdminComplaints from './components/AdminComplaints';
import DemandAnalytics from './components/DemandAnalytics';
import RevenueAnalytics from './components/RevenueAnalytics';
import ProviderRanking from './components/ProviderRanking';
import UserAnalytics from './components/UserAnalytics';
import UserSettings from './components/UserSettings';
import Notifications from './components/Notifications';
import { NotFound, AccessDenied } from './components/UtilityPages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<BrowseServices />} />
        <Route path="/services/:serviceId" element={<ServiceDetails />} />
        <Route path="/book/:serviceId" element={<BookService />} />
        <Route path="/booking/:bookingId" element={<BookingTracking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/feedback/:id" element={<CustomerFeedback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/requests" element={<ProviderRequests />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/provider/earnings" element={<ProviderEarnings />} />

        <Route path="/provider/analytics" element={<ProviderAnalytics />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/provider-approvals" element={<AdminProviderApprovals />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/analytics/demand" element={<DemandAnalytics />} />
        <Route path="/admin/analytics/revenue" element={<RevenueAnalytics />} />
        <Route path="/admin/analytics/provider-ranking" element={<ProviderRanking />} />
        <Route path="/admin/analytics/user-behavior" element={<UserAnalytics />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/complaints" element={<AdminComplaints />} />

        {/* Utility Pages */}
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App
