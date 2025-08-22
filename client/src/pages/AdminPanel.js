import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiConfig from '../config/api';
import { FaPlus, FaEdit, FaTrash, FaBox, FaCalendar, FaEnvelope, FaUser } from 'react-icons/fa';

const AdminPanel = () => {
  const { user, isAdmin, loading } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, fetchProducts, loading: productsLoading } = useProduct();
  const [activeTab, setActiveTab] = useState('products');
  const [bookings, setBookings] = useState([]);
  const [sentLists, setSentLists] = useState([]);
  const [registeredCustomers, setRegisteredCustomers] = useState([]);
  const [unregisteredCustomers, setUnregisteredCustomers] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    series: '',
    model: '',
    serialNumber: '',
    description: '',
    dealerPrice: '',
    endUserPrice: '',
    categories: [],
    warranty: '',
    type: '',
    images: []
  });
  const [existingImages, setExistingImages] = useState([]);
  const [keepExistingImages, setKeepExistingImages] = useState(true);
  const [viewBooking, setViewBooking] = useState(null);
  const [viewSentList, setViewSentList] = useState(null);

  useEffect(() => {
    if (!loading && isAdmin()) {
      fetchBookings();
      fetchSentLists();
      fetchRegisteredCustomers();
      fetchUnregisteredCustomers();
    }
  }, [loading, isAdmin]);

  // Fetch products when component mounts
  useEffect(() => {
    if (!loading && isAdmin()) {
      fetchProducts();
    }
  }, [loading, isAdmin]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/api/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchSentLists = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/api/sent-lists`);
      setSentLists(response.data);
    } catch (error) {
      console.error('Failed to fetch sent lists:', error);
    }
  };

  const fetchRegisteredCustomers = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/api/registered-customers`);
      setRegisteredCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch registered customers:', error);
    }
  };

  const fetchUnregisteredCustomers = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/api/unregistered-customers`);
      setUnregisteredCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch unregistered customers:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // For new products, require at least one image
    if (!editingProduct && (!productForm.images || productForm.images.length === 0)) {
      toast.error('You must upload at least one image for the product.');
      return;
    }
    
    // For updates, allow updating without new images if keeping existing ones
    if (editingProduct && !keepExistingImages && (!productForm.images || productForm.images.length === 0)) {
      toast.error('You must upload at least one image or keep existing images.');
      return;
    }
    
    try {
      if (editingProduct) {
        // Add the keepExistingImages flag to the form data
        const formDataWithOptions = {
          ...productForm,
          keepExistingImages: keepExistingImages.toString()
        };
        await updateProduct(editingProduct.id, formDataWithOptions);
        toast.success('Product updated successfully');
      } else {
        await addProduct(productForm);
        toast.success('Product added successfully');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleEditProduct = async (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.series || product.name, // Use series as name for display
      brand: product.brand,
      series: product.series || '',
      model: product.model,
      serialNumber: product.serialNumber || '',
      description: product.description || '',
      dealerPrice: product.dealerPrice,
      endUserPrice: product.endUserPrice,
      categories: product.categories || [product.category || ''],
      warranty: product.warranty || '',
      type: product.type || '',
      images: []
    });
    
    // Fetch existing images for this product
    try {
              const response = await axios.get(`${apiConfig.baseURL}/api/products/${product.id}`);
      if (response.data.additionalImages) {
        setExistingImages(response.data.additionalImages);
      } else {
        setExistingImages([]);
      }
    } catch (error) {
      console.error('Failed to fetch existing images:', error);
      setExistingImages([]);
    }
    
    setKeepExistingImages(true);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`${apiConfig.baseURL}/api/bookings/${bookingId}`);
        toast.success('Booking deleted successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };

  const handleDeleteSentList = async (sentListId) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Are you sure you want to delete this sent list?')) {
      try {
        await axios.delete(`${apiConfig.baseURL}/api/sent-lists/${sentListId}`);
        toast.success('Sent list deleted successfully');
        fetchSentLists();
      } catch (error) {
        toast.error('Failed to delete sent list');
      }
    }
  };

  const handleDeleteRegisteredCustomer = async (customerId) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Are you sure you want to delete this registered customer? This will permanently delete their account.')) {
      try {
        await axios.delete(`${apiConfig.baseURL}/api/registered-customers/${customerId}`);
        toast.success('Registered customer deleted successfully');
        fetchRegisteredCustomers();
      } catch (error) {
        toast.error('Failed to delete registered customer');
      }
    }
  };

  const handleDeleteUnregisteredCustomer = async (customerId) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm('Are you sure you want to delete this unregistered customer entry?')) {
      try {
        await axios.delete(`${apiConfig.baseURL}/api/unregistered-customers/${customerId}`);
        toast.success('Unregistered customer deleted successfully');
        fetchUnregisteredCustomers();
      } catch (error) {
        toast.error('Failed to delete unregistered customer');
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      brand: '',
      series: '',
      model: '',
      serialNumber: '',
      description: '',
      dealerPrice: '',
      endUserPrice: '',
      categories: [],
      warranty: '',
      type: '',
      images: []
    });
    setExistingImages([]);
    setKeepExistingImages(true);
  };

  // Helper to get booking field with fallback for snake_case
  const getBookingField = (booking, field) => {
    return (
      booking[field] ||
      booking[field.charAt(0).toLowerCase() + field.slice(1)] ||
      booking[field.replace(/([A-Z])/g, '_$1').toLowerCase()] ||
      ''
    );
  };

  // Helper to truncate text
  const truncate = (str, n) => (str && str.length > n ? str.slice(0, n) + '...' : str);

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  console.log('Bookings:', bookings);

  return (
    <div className="admin-root">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <p className="admin-desc">Welcome back, {user.username}</p>
      </div>
      <div className="admin-tabs-row">
        <button
          onClick={() => setActiveTab('products')}
          className={`admin-tab-btn${activeTab === 'products' ? ' admin-tab-btn-active' : ''}`}
        >
          <FaBox className="admin-tab-btn-icon" />
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`admin-tab-btn${activeTab === 'bookings' ? ' admin-tab-btn-active' : ''}`}
        >
          <FaCalendar className="admin-tab-btn-icon" />
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('sent-lists')}
          className={`admin-tab-btn${activeTab === 'sent-lists' ? ' admin-tab-btn-active' : ''}`}
        >
          <FaEnvelope className="admin-tab-btn-icon" />
          Sent Lists ({sentLists.length})
        </button>
        <button
          onClick={() => setActiveTab('registered-customers')}
          className={`admin-tab-btn${activeTab === 'registered-customers' ? ' admin-tab-btn-active' : ''}`}
        >
          <FaUser className="admin-tab-btn-icon" />
          Registered Customers ({registeredCustomers.length})
        </button>
        <button
          onClick={() => setActiveTab('unregistered-customers')}
          className={`admin-tab-btn${activeTab === 'unregistered-customers' ? ' admin-tab-btn-active' : ''}`}
        >
          <FaUser className="admin-tab-btn-icon" />
          Unregistered Customers ({unregisteredCustomers.length})
        </button>
      </div>
      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="admin-content">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Products</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="btn btn-primary"
              >
                <FaPlus className="mr-2" />
                Add Product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Series</th>
                  <th className="px-6 py-3 text-left">Brand</th>
                  <th className="px-6 py-3 text-left">Model</th>
                  <th className="px-6 py-3 text-left">Categories</th>
                  <th className="px-6 py-3 text-left">Prices</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productsLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="loading mr-2"></div>
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{product.series || product.name}</div>
                      </td>
                      <td className="px-6 py-4">{product.brand}</td>
                      <td className="px-6 py-4">{product.model}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories && product.categories.length > 0 ? (
                            product.categories.map((cat, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {cat === 'hot' ? 'Hot' : cat === 'new' ? 'New' : cat === 'openbox' ? 'Open Box' : cat === 'parts' ? 'Parts' : cat}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {product.category || 'N/A'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>Dealer: ${product.dealerPrice}</div>
                          <div>End User: ${product.endUserPrice}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="admin-content">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Contact</th>
                  <th className="px-6 py-3 text-left">Company</th>
                  <th className="px-6 py-3 text-left">User Type</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Details</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 font-medium">{booking.sendername}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div><strong>Email:</strong> {booking.email}</div>
                        <div><strong>Phone:</strong> {booking.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{booking.companyname || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        (booking.userType || booking.usertype) === 'dealer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {(booking.userType || booking.usertype) === 'dealer' ? 'Dealer' : 'End User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        (booking.registrationStatus || booking.registrationstatus) === 'Registered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.registrationStatus || booking.registrationstatus || 'Unregistered'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{truncate(booking.bookingdetails, 50)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {booking.createdat && !isNaN(new Date(booking.createdat))
                        ? new Date(booking.createdat).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewBooking(booking)}
                          className="text-green-600 hover:text-green-800"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Sent Lists Tab */}
      {activeTab === 'sent-lists' && (
        <div className="admin-content">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Sent Lists</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Products</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sentLists.map((list) => {
                  const productIds = list.productIds || list.productids;
                  return (
                    <tr key={list.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{list.username}</div>
                        <div className="text-sm text-gray-500">{list.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {productIds ? productIds.split(',').length : 0} products
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {list.sentAt ? new Date(list.sentAt).toLocaleDateString() : (list.sentat ? new Date(list.sentat).toLocaleDateString() : 'N/A')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewSentList(list)}
                            className="text-green-600 hover:text-green-800 underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteSentList(list.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registered Customers Tab */}
      {activeTab === 'registered-customers' && (
        <div className="admin-content">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Registered Customers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">User Type</th>
                  <th className="px-6 py-3 text-left">Registration Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registeredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium">{customer.username}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        customer.usertype === 'dealer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {customer.usertype === 'dealer' ? 'Dealer' : 'End User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {customer.createdat ? new Date(customer.createdat).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteRegisteredCustomer(customer.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete customer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unregistered Customers Tab */}
      {activeTab === 'unregistered-customers' && (
        <div className="admin-content">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semi-bold text-gray-800">Unregistered Customers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Company</th>
                  <th className="px-6 py-3 text-left">User Type</th>
                  <th className="px-6 py-3 text-left">Message Type</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unregisteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4">{customer.companyname || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        customer.usertype === 'dealer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {customer.usertype === 'dealer' ? 'Dealer' : 'End User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        {customer.messagetype === 'booking' ? 'Booking' : 'Inquiry'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {customer.createdat ? new Date(customer.createdat).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUnregisteredCustomer(customer.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete customer entry"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Product Modal */}
      {showProductModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Series</label>
                  <input
                    type="text"
                    value={productForm.series}
                    onChange={(e) => setProductForm({...productForm, series: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    value={productForm.model}
                    onChange={(e) => setProductForm({...productForm, model: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Categories</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={productForm.categories.includes('hot')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({...productForm, categories: [...productForm.categories, 'hot']});
                          } else {
                            setProductForm({...productForm, categories: productForm.categories.filter(c => c !== 'hot')});
                          }
                        }}
                        className="mr-2"
                      />
                      <span>Hot Products</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={productForm.categories.includes('new')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({...productForm, categories: [...productForm.categories, 'new']});
                          } else {
                            setProductForm({...productForm, categories: productForm.categories.filter(c => c !== 'new')});
                          }
                        }}
                        className="mr-2"
                      />
                      <span>New Arrivals</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={productForm.categories.includes('openbox')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({...productForm, categories: [...productForm.categories, 'openbox']});
                          } else {
                            setProductForm({...productForm, categories: productForm.categories.filter(c => c !== 'openbox')});
                          }
                        }}
                        className="mr-2"
                      />
                      <span>Open Box</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={productForm.categories.includes('parts')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({...productForm, categories: [...productForm.categories, 'parts']});
                          } else {
                            setProductForm({...productForm, categories: productForm.categories.filter(c => c !== 'parts')});
                          }
                        }}
                        className="mr-2"
                      />
                      <span>Parts</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="form-label">Dealer Price</label>
                  <input
                    type="text"
                    value={productForm.dealerPrice}
                    onChange={(e) => setProductForm({...productForm, dealerPrice: e.target.value})}
                    className="form-input"
                    placeholder="e.g., 299.99"
                  />
                </div>
                <div>
                  <label className="form-label">End User Price</label>
                  <input
                    type="text"
                    value={productForm.endUserPrice}
                    onChange={(e) => setProductForm({...productForm, endUserPrice: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Warranty</label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({...productForm, warranty: e.target.value})}
                    className="form-input"
                    placeholder="e.g., 30 Days, 2 Months"
                  />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({...productForm, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select Type</option>
                    <option value="mono printer">Mono Printer</option>
                    <option value="mono MFP">Mono MFP</option>
                    <option value="mono MFC">Mono MFC</option>
                    <option value="color printer">Color Printer</option>
                    <option value="color MFP">Color MFP</option>
                    <option value="color MFC">Color MFC</option>
                    <option value="large format">Large Format</option>
                    <option value="dot matrix">Dot Matrix</option>
                    <option value="label printer">Label Printer</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    value={productForm.serialNumber}
                    onChange={(e) => setProductForm({...productForm, serialNumber: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Images (Upload multiple images)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setProductForm({ ...productForm, images: Array.from(e.target.files) })}
                    className="form-input"
                  />
                  {productForm.images.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {productForm.images.length} new image(s) selected
                    </div>
                  )}
                  
                  {/* Show existing images when editing */}
                  {editingProduct && existingImages.length > 0 && (
                    <div className="mt-4">
                      <label className="form-label">Existing Images ({existingImages.length})</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {existingImages.map((img, index) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.imagePath}
                              alt={`Existing image ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                              onError={(e) => {
                                e.target.src = '/placeholder-printer.jpg';
                              }}
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                // eslint-disable-next-line no-restricted-globals
                                if (confirm('Are you sure you want to delete this image?')) {
                                  try {
                                    await axios.delete(`${apiConfig.baseURL}/api/products/${editingProduct.id}/images/${img.id}`);
                                    setExistingImages(existingImages.filter(existingImg => existingImg.id !== img.id));
                                    toast.success('Image deleted successfully');
                                  } catch (error) {
                                    toast.error('Failed to delete image');
                                  }
                                }
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete image"
                            >
                              −
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                // eslint-disable-next-line no-restricted-globals
                                if (confirm('Set this image as the main product image?')) {
                                  try {
                                    await axios.put(`${apiConfig.baseURL}/api/products/${editingProduct.id}/main-image`, {
                                      imagePath: img.imagePath
                                    });
                                    toast.success('Main image updated successfully');
                                    // Refresh the product data
                                    const response = await axios.get(`${apiConfig.baseURL}/api/products/${editingProduct.id}`);
                                    if (response.data.additionalImages) {
                                      setExistingImages(response.data.additionalImages);
                                    }
                                  } catch (error) {
                                    toast.error('Failed to update main image');
                                  }
                                }
                              }}
                              className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Set as main image"
                            >
                              ★
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Option to keep existing images */}
                  {editingProduct && (
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={keepExistingImages}
                          onChange={(e) => setKeepExistingImages(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Keep existing images and add new ones
                        </span>
                      </label>
                      {!keepExistingImages && (
                        <p className="text-xs text-red-600 mt-1">
                          Warning: This will replace all existing images (main image and additional images)
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-1">
                        Note: When updating, all uploaded images will be added as additional images. When "Keep existing images" is unchecked, the first uploaded image will become the new main image.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Booking View Modal */}
      {viewBooking && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2 className="text-2xl font-bold mb-6">Booking Details</h2>
            <div className="space-y-2">
              <div><strong>Name:</strong> {viewBooking.sendername}</div>
              <div><strong>Email:</strong> {viewBooking.email}</div>
              <div><strong>Phone:</strong> {viewBooking.phone}</div>
              <div><strong>Company:</strong> {viewBooking.companyname || 'N/A'}</div>
              <div><strong>User Type:</strong> {viewBooking.userType === 'dealer' ? 'Dealer' : 'End User'}</div>
              <div><strong>Status:</strong> {viewBooking.registrationStatus}</div>
              <div><strong>Details:</strong> {viewBooking.bookingdetails}</div>
              <div><strong>Date:</strong> {viewBooking.createdat && !isNaN(new Date(viewBooking.createdat)) ? new Date(viewBooking.createdat).toLocaleString() : 'N/A'}</div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setViewBooking(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sent List View Modal */}
      {viewSentList && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2 className="text-2xl font-bold mb-6">Sent List Details</h2>
            <div className="space-y-2">
              <div><strong>User:</strong> {viewSentList.username}</div>
              <div><strong>Email:</strong> {viewSentList.email}</div>
              <div><strong>Sent At:</strong> {viewSentList.sentAt ? new Date(viewSentList.sentAt).toLocaleString() : (viewSentList.sentat ? new Date(viewSentList.sentat).toLocaleString() : 'N/A')}</div>
              <div><strong>Products:</strong></div>
              {viewSentList.products && viewSentList.products.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1">
                  {viewSentList.products.map(product => (
                    <li key={product.id} className="text-sm">
                      <strong>{product.name}</strong>
                      {product.brand && <span> - {product.brand}</span>}
                      {product.series && <span> {product.series}</span>}
                      {product.model && <span> {product.model}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 ml-6">No products found</div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setViewSentList(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 