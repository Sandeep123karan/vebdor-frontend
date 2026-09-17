// src/components/vendor/NightclubManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './NightclubManagement.css';

const NightclubManagement = () => {
  const [nightclubs, setNightclubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formData, setFormData] = useState({
    clubName: '',
    legalBusinessName: '',
    description: '',
    email: '',
    phone: '',
    alternatePhone: '',
    website: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    latitude: '',
    longitude: '',
    businessType: 'individual',
    gstNumber: '',
    panNumber: '',
    clubType: 'nightclub',
    capacity: '',
    danceFloorAvailable: false,
    liveMusicAvailable: false,
    djAvailable: false,
    vipAvailable: false,
    privatePartyAvailable: false,
    foodAvailable: false,
    parkingAvailable: false,
    openingTime: '',
    closingTime: '',
    openDays: [],
    entryFee: '',
    coupleEntryFee: '',
    stagEntryFee: '',
    images: [],
    coverImage: '',
    licenseNumber: '',
    licenseDocument: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get token from localStorage (or your auth context)
  const getToken = () => localStorage.getItem('vendorToken');

  const fetchMyNightclubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/nightclubs/my', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNightclubs(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch nightclubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyNightclubs();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      openDays: prev.openDays.includes(day)
        ? prev.openDays.filter(d => d !== day)
        : [...prev.openDays, day]
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await axios.post('/api/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${getToken()}`
          }
        });
        uploadedUrls.push(response.data.url);
      } catch (error) {
        toast.error('Failed to upload image');
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getToken()}`
        }
      });
      setFormData(prev => ({
        ...prev,
        coverImage: response.data.url
      }));
    } catch (error) {
      toast.error('Failed to upload cover image');
    }
  };

  const handleLicenseUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getToken()}`
        }
      });
      setFormData(prev => ({
        ...prev,
        licenseDocument: response.data.url
      }));
    } catch (error) {
      toast.error('Failed to upload license document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!formData.clubName || !formData.phone || !formData.address || 
          !formData.city || !formData.state || !formData.pincode) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      let response;
      if (editingClub) {
        response = await axios.put(`/api/nightclubs/${editingClub._id}`, formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success('Nightclub updated successfully!');
      } else {
        response = await axios.post('/api/nightclubs', formData, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success('Nightclub created successfully!');
      }

      setIsFormOpen(false);
      resetForm();
      fetchMyNightclubs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setFormData({
      ...club,
      openDays: club.openDays || []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nightclub?')) return;
    
    try {
      await axios.delete(`/api/nightclubs/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success('Nightclub deleted successfully');
      fetchMyNightclubs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      clubName: '',
      legalBusinessName: '',
      description: '',
      email: '',
      phone: '',
      alternatePhone: '',
      website: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      latitude: '',
      longitude: '',
      businessType: 'individual',
      gstNumber: '',
      panNumber: '',
      clubType: 'nightclub',
      capacity: '',
      danceFloorAvailable: false,
      liveMusicAvailable: false,
      djAvailable: false,
      vipAvailable: false,
      privatePartyAvailable: false,
      foodAvailable: false,
      parkingAvailable: false,
      openingTime: '',
      closingTime: '',
      openDays: [],
      entryFee: '',
      coupleEntryFee: '',
      stagEntryFee: '',
      images: [],
      coverImage: '',
      licenseNumber: '',
      licenseDocument: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    });
    setEditingClub(null);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'PENDING': 'status-badge-pending',
      'APPROVED': 'status-badge-approved',
      'REJECTED': 'status-badge-rejected',
      'DRAFT': 'status-badge-draft'
    };
    return colors[status] || 'status-badge-draft';
  };

  if (loading && nightclubs.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="nightclub-management">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1 className="page-title">My Nightclubs</h1>
          <p className="page-subtitle">Manage your nightclub listings</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="btn-primary"
        >
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Nightclub
        </button>
      </div>

      {/* Nightclubs Grid */}
      {nightclubs.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="empty-title">No nightclubs yet</h3>
          <p className="empty-text">Get started by creating your first nightclub listing.</p>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="btn-primary mt-4"
          >
            Create Nightclub
          </button>
        </div>
      ) : (
        <div className="nightclub-grid">
          {nightclubs.map((club) => (
            <div key={club._id} className="nightclub-card">
              {club.coverImage ? (
                <img 
                  src={club.coverImage} 
                  alt={club.clubName}
                  className="card-image"
                />
              ) : (
                <div className="card-image-placeholder">
                  <span className="placeholder-text">{club.clubName?.[0]}</span>
                </div>
              )}
              
              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{club.clubName}</h3>
                  <span className={`status-badge ${getStatusBadge(club.status)}`}>
                    {club.status}
                  </span>
                </div>
                
                <p className="card-description">{club.description || 'No description'}</p>
                
                <div className="card-details">
                  <p className="detail-item">
                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {club.city}, {club.state}
                  </p>
                  <p className="detail-item">
                    <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {club.phone}
                  </p>
                  {club.capacity > 0 && (
                    <p className="detail-item">
                      <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Capacity: {club.capacity}
                    </p>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleEdit(club)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(club._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingClub ? 'Edit Nightclub' : 'Create New Nightclub'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="modal-close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Club Name *</label>
                    <input
                      type="text"
                      name="clubName"
                      value={formData.clubName}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Legal Business Name</label>
                    <input
                      type="text"
                      name="legalBusinessName"
                      value={formData.legalBusinessName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="form-textarea"
                      placeholder="Describe your nightclub..."
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alternate Phone</label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-section">
                <h3 className="section-title">Address</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="form-section">
                <h3 className="section-title">Business Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Business Type</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="individual">Individual</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="private-limited">Private Limited</option>
                      <option value="public-limited">Public Limited</option>
                      <option value="llp">LLP</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PAN Number</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Club Features */}
              <div className="form-section">
                <h3 className="section-title">Club Features</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Club Type</label>
                    <select
                      name="clubType"
                      value={formData.clubType}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="nightclub">Nightclub</option>
                      <option value="lounge">Lounge</option>
                      <option value="pub">Pub</option>
                      <option value="bar">Bar</option>
                      <option value="discotheque">Discotheque</option>
                      <option value="live-music">Live Music</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="0"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="checkbox-grid">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="danceFloorAvailable"
                      checked={formData.danceFloorAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Dance Floor</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="liveMusicAvailable"
                      checked={formData.liveMusicAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Live Music</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="djAvailable"
                      checked={formData.djAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>DJ</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="vipAvailable"
                      checked={formData.vipAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>VIP</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="privatePartyAvailable"
                      checked={formData.privatePartyAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Private Party</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="foodAvailable"
                      checked={formData.foodAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Food</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="parkingAvailable"
                      checked={formData.parkingAvailable}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    <span>Parking</span>
                  </label>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="form-section">
                <h3 className="section-title">Opening Hours</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Opening Time</label>
                    <input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Closing Time</label>
                    <input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="days-container">
                  <label className="form-label">Open Days</label>
                  <div className="days-grid">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`day-btn ${formData.openDays.includes(day) ? 'day-btn-active' : 'day-btn-inactive'}`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="form-section">
                <h3 className="section-title">Pricing</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Entry Fee</label>
                    <input
                      type="number"
                      name="entryFee"
                      value={formData.entryFee}
                      onChange={handleChange}
                      min="0"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Couple Entry Fee</label>
                    <input
                      type="number"
                      name="coupleEntryFee"
                      value={formData.coupleEntryFee}
                      onChange={handleChange}
                      min="0"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stag Entry Fee</label>
                    <input
                      type="number"
                      name="stagEntryFee"
                      value={formData.stagEntryFee}
                      onChange={handleChange}
                      min="0"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <h3 className="section-title">Images</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="form-file-input"
                    />
                    {formData.coverImage && (
                      <img src={formData.coverImage} alt="Cover" className="upload-preview" />
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Gallery Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="form-file-input"
                    />
                    <div className="gallery-preview">
                      {formData.images.map((img, index) => (
                        <img key={index} src={img} alt={`Gallery ${index}`} className="gallery-thumb" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* License & Documents */}
              <div className="form-section">
                <h3 className="section-title">License & Documents</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleLicenseUpload}
                      className="form-file-input"
                    />
                    {formData.licenseDocument && (
                      <a href={formData.licenseDocument} target="_blank" rel="noopener noreferrer" className="doc-link">
                        View Document
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="form-section">
                <h3 className="section-title">Bank Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Account Holder Name</label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Number</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-submit"
                >
                  {loading ? 'Saving...' : (editingClub ? 'Update Nightclub' : 'Create Nightclub')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NightclubManagement;