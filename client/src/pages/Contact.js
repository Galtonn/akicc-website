import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiConfig from '../config/api';
import { FaEnvelope, FaPhone, FaCalendar, FaUser, FaBuilding, FaComments } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Contact = () => {
  const { user } = useAuth();
  const [formType, setFormType] = useState('booking');
  const [loading, setLoading] = useState(false);

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        email: user.email || '',
        senderName: user.username || ''
      }));
      setInquiryForm(prev => ({
        ...prev,
        email: user.email || '',
        name: user.username || ''
      }));
    }
  }, [user]);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    email: user ? user.email : '',
    phone: '',
    companyName: '',
    senderName: user ? user.username : '',
    bookingDetails: '',
    userType: ''
  });

  // General inquiry form state
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    topic: '',
    description: '',
    userType: ''
  });

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Include user type for registered users
      const formData = {
        ...bookingForm,
        userType: user ? (user.userType || user.usertype) : bookingForm.userType
      };
      
      await axios.post(`${apiConfig.baseURL}/api/contact/booking`, formData);
      toast.success('Booking request sent successfully!');
      setBookingForm({
        email: '',
        phone: '',
        companyName: '',
        senderName: '',
        bookingDetails: '',
        userType: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Include user type for registered users
      const formData = {
        ...inquiryForm,
        userType: user ? (user.userType || user.usertype) : inquiryForm.userType
      };
      
      await axios.post(`${apiConfig.baseURL}/api/contact/inquiry`, formData);
      toast.success('Inquiry sent successfully!');
      setInquiryForm({
        name: '',
        email: '',
        topic: '',
        description: '',
        userType: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleInquiryChange = (e) => {
    setInquiryForm({
      ...inquiryForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-root">
      {/* Add margin-top to header for spacing from navbar */}
      <div className="contact-header" style={{ marginTop: '4rem' }}>
        <h1 className="contact-header-title">Contact & Booking</h1>
        <p className="contact-header-desc">
          Get in touch with us for printer sales, parts, maintenance services, or any questions you may have.
        </p>
      </div>
      <div className="contact-info-grid">
        <div className="contact-info-card">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaEnvelope className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Email Us</h3>
          <p className="text-gray-600">info@akicc.com</p>
        </div>
        <div className="contact-info-card">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPhone className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Call Us</h3>
          <p className="text-gray-600">+1 (647) 274-2819</p>
        </div>
        <div className="contact-info-card">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendar className="text-purple-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
          <p className="text-gray-600">Mon-Fri: 9AM-5PM</p>
        </div>
      </div>

      {/* Centered form type selector */}
      <div className="contact-form-type-selector" style={{ justifyContent: 'center' }}>
        <button
          onClick={() => setFormType('booking')}
          className={`contact-form-type-btn${formType === 'booking' ? ' contact-form-type-btn-active' : ''}`}
        >
          <FaCalendar className="inline mr-2" />
          Booking Request
        </button>
        <button
          onClick={() => setFormType('inquiry')}
          className={`contact-form-type-btn${formType === 'inquiry' ? ' contact-form-type-btn-active' : ''}`}
        >
          <FaComments className="inline mr-2" />
          General Inquiry
        </button>
      </div>
      {/* Booking Form */}
      {formType === 'booking' && (
        <div className="contact-form-section">
          <div className="contact-form-header">
            <h2 className="contact-form-title">Booking Request</h2>
            <p className="contact-form-desc">
              Schedule a consultation, service appointment, or request a quote for your printer needs.
            </p>
          </div>
          <form onSubmit={handleBookingSubmit} className="contact-form">
            <div className="contact-form-grid">
              <div className="contact-form-group">
                <label className="contact-form-label">
                  <FaUser className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={bookingForm.senderName}
                  onChange={handleBookingChange}
                  className="contact-form-input"
                  required
                />
              </div>
              {!user && (
                <div className="contact-form-group">
                  <label className="contact-form-label">
                    <FaUser className="inline mr-2" />
                    User Type *
                  </label>
                  <select
                    name="userType"
                    value={bookingForm.userType}
                    onChange={handleBookingChange}
                    className="contact-form-input"
                    required
                  >
                    <option value="">Select User Type</option>
                    <option value="dealer">Dealer</option>
                    <option value="enduser">End User</option>
                  </select>
                </div>
              )}
              <div className="contact-form-group">
                <label className="contact-form-label">
                  <FaEnvelope className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={bookingForm.email}
                  onChange={handleBookingChange}
                  className="contact-form-input"
                  required
                />
              </div>
              <div className="contact-form-group">
                <label className="contact-form-label">
                  <FaPhone className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingForm.phone}
                  onChange={handleBookingChange}
                  className="contact-form-input"
                  required
                />
              </div>
              <div className="contact-form-group">
                <label className="contact-form-label">
                  <FaBuilding className="inline mr-2" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={bookingForm.companyName}
                  onChange={handleBookingChange}
                  className="contact-form-input"
                />
              </div>
            </div>
            <div className="contact-form-group">
              <label className="contact-form-label">
                <FaCalendar className="inline mr-2" />
                Booking Details *
              </label>
              <textarea
                name="bookingDetails"
                value={bookingForm.bookingDetails}
                onChange={handleBookingChange}
                className="contact-form-textarea"
                placeholder="Please describe what you need help with, preferred appointment times, or any specific requirements..."
                rows="5"
                required
              />
            </div>
            <div className="contact-form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary contact-form-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="loading mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Booking Request'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Inquiry Form */}
      {formType === 'inquiry' && (
        <div className="contact-form-section">
          <div className="contact-form-header">
            <h2 className="contact-form-title">General Inquiry</h2>
            <p className="contact-form-desc">
              Have a question or need more information? Send us a message and our team will get back to you promptly.
            </p>
          </div>
          <form onSubmit={handleInquirySubmit} className="contact-form">
            <div className="contact-form-grid">
              <div className="contact-form-group">
                <label className="contact-form-label">
                  <FaUser className="inline mr-2" />
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={inquiryForm.name}
                  onChange={handleInquiryChange}
                  className="contact-form-input"
                  required
                />
              </div>
              {!user && (
                <div className="contact-form-group">
                  <label className="contact-form-label">
                    <FaUser className="inline mr-2" />
                    User Type *
                  </label>
                  <select
                    name="userType"
                    value={inquiryForm.userType}
                    onChange={handleInquiryChange}
                    className="contact-form-input"
                    required
                  >
                    <option value="">Select User Type</option>
                    <option value="dealer">Dealer</option>
                    <option value="enduser">End User</option>
                  </select>
                </div>
              )}
              <div className="contact-form-group">
                <label className="contact-form-label">
                  <FaEnvelope className="inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={inquiryForm.email}
                  onChange={handleInquiryChange}
                  className="contact-form-input"
                  required
                />
              </div>
              <div className="contact-form-group">
                <label className="contact-form-label">
                  Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={inquiryForm.topic}
                  onChange={handleInquiryChange}
                  className="contact-form-input"
                />
              </div>
            </div>
            <div className="contact-form-group">
              <label className="contact-form-label">
                Description *
              </label>
              <textarea
                name="description"
                value={inquiryForm.description}
                onChange={handleInquiryChange}
                className="contact-form-textarea"
                placeholder="How can we help you?"
                rows="5"
                required
              />
            </div>
            <div className="contact-form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary contact-form-submit-btn"
              >
                {loading ? (
                  <>
                    <div className="loading mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Inquiry'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Additional Info - Why Choose AKICC? */}
      <div className="contact-why-section">
        <h3 className="contact-why-title">Why Choose AKICC?</h3>
        <div className="contact-why-grid">
          <div className="contact-why-card">
            <h4 className="contact-why-card-title">Expert Support</h4>
            <p className="contact-why-card-desc">Our team of printer specialists is here to help you find the perfect solution.</p>
          </div>
          <div className="contact-why-card">
            <h4 className="contact-why-card-title">Quality Products</h4>
            <p className="contact-why-card-desc">We offer only the highest quality printers and parts from trusted manufacturers.</p>
          </div>
          <div className="contact-why-card">
            <h4 className="contact-why-card-title">Fast Service</h4>
            <p className="contact-why-card-desc">Quick response times and efficient service to keep your business running smoothly.</p>
          </div>
        </div>
      </div>
      {/* Add bottom spacing */}
      <div style={{ height: '3rem' }} />
    </div>
  );
};

export default Contact; 