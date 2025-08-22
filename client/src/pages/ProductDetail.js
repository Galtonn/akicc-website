import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import axios from 'axios';
import apiConfig from '../config/api';
import { FaHeart, FaArrowLeft, FaPrint, FaTools, FaShieldAlt } from 'react-icons/fa';
import ImageGallery from '../components/ImageGallery';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToMyList, removeFromMyList, myList } = useProduct();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageArray, setImageArray] = useState([]);

  // Function to format category display
  const formatCategory = (category) => {
    if (category === 'openbox') return 'Open Box';
    if (category === 'new') return 'New Arrival';
    if (category === 'hot') return 'Hot Product';
    if (category === 'parts') return 'Parts';
    return category;
  };
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiConfig.baseURL}/api/products/${id}`);
        setProduct(response.data);
        
        // Build stable image array
        const images = [];
        if (response.data.image) {
          images.push(response.data.image);
        }
        if (response.data.additionalImages && response.data.additionalImages.length > 0) {
          response.data.additionalImages.forEach(img => {
            const imagePath = img.imagePath;
            if (imagePath) {
              images.push(imagePath);
            }
          });
        }
        setImageArray(images);
      } catch (error) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToList = async () => {
    if (!user) {
      alert('Please login to add items to your list');
      return;
    }
    await addToMyList(product.id);
  };

  const handleRemoveFromList = async () => {
    await removeFromMyList(product.id);
  };

  const isInMyList = myList.some(item => item.id === parseInt(id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn btn-primary">
            <FaArrowLeft className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-root">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <nav className="product-detail-breadcrumb">
          <Link to="/products" className="product-detail-breadcrumb-link">
            <FaArrowLeft className="product-detail-breadcrumb-icon" />
            Back to Products
          </Link>
        </nav>

        <div className="product-detail-main-grid">
          {/* Product Image */}
          <div className="product-detail-image-card">
            <ImageGallery 
              images={imageArray}
              productName={product.name}
            />
          </div>

          {/* Product Information */}
          <div className="product-detail-info-card">
            <div className="product-detail-info-main">
              <h1 className="product-detail-title">{product.brand} {product.series} {product.model}</h1>
              <p className="product-detail-brand-model">{product.type ? product.type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : ''}</p>
              
              <p className="product-detail-description">{product.description}</p>
            </div>

            {/* Pricing */}
            <div className="product-detail-pricing-section">
              <div className="product-detail-pricing-list">
                {user && user.userType === 'admin' && (
                  <>
                    <div className="product-detail-price-row product-detail-price-row-dealer">
                      <span className="product-detail-price-label">Dealer Price:</span>
                      <span className="product-detail-price-value product-detail-price-dealer">${product.dealerPrice}</span>
                    </div>
                    <div className="product-detail-price-row product-detail-price-row-enduser">
                      <span className="product-detail-price-label">End User Price:</span>
                      <span className="product-detail-price-value product-detail-price-enduser">${product.endUserPrice}</span>
                    </div>
                  </>
                )}
                {user && user.userType === 'dealer' && (
                  <div className="product-detail-price-row product-detail-price-row-dealer">
                    <span className="product-detail-price-label">Price:</span>
                    <span className="product-detail-price-value product-detail-price-dealer">${product.dealerPrice}</span>
                  </div>
                )}
                {user && user.userType === 'enduser' && (
                  <div className="product-detail-price-row product-detail-price-row-enduser">
                    <span className="product-detail-price-label">Price:</span>
                    <span className="product-detail-price-value product-detail-price-enduser">${product.endUserPrice}</span>
                  </div>
                )}
                {!user && (
                  <div className="product-detail-price-row product-detail-price-row-enduser">
                    <span className="product-detail-price-label">Price:</span>
                    <span className="product-detail-price-value product-detail-price-enduser">${product.endUserPrice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail-actions-section">
              <div className="product-detail-actions">
                {user ? (
                  isInMyList ? (
                    <button
                      onClick={handleRemoveFromList}
                      className="btn btn-outline product-detail-remove-btn"
                    >
                      <FaHeart className="product-detail-remove-icon" />
                      Remove from List
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToList}
                      className="btn product-detail-add-btn"
                    >
                      <FaHeart className="product-detail-add-icon" />
                      Add to My List
                    </button>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-outline product-detail-login-btn"
                  >
                    <FaHeart className="product-detail-login-icon" />
                    Login to Add to List
                  </Link>
                )}
                
                <Link
                  to="/contact"
                  className="btn btn-primary product-detail-quote-btn"
                >
                  <FaPrint className="product-detail-quote-icon" />
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="product-detail-section product-detail-specs-section">
          <h2 className="product-detail-section-title">Product Details</h2>
          <div className="product-detail-specs-grid">
            <div>
              <h3 className="product-detail-specs-title">
                <FaPrint className="product-detail-specs-icon" />
                Specifications
              </h3>
              <div className="product-detail-specs-list">
                <div className="product-detail-specs-row">
                  <span className="product-detail-specs-label">Brand:</span>
                  <span className="product-detail-specs-value">{product.brand}</span>
                </div>
                <div className="product-detail-specs-row">
                  <span className="product-detail-specs-label">Series:</span>
                  <span className="product-detail-specs-value">{product.series}</span>
                </div>
                <div className="product-detail-specs-row">
                  <span className="product-detail-specs-label">Model:</span>
                  <span className="product-detail-specs-value">{product.model}</span>
                </div>
                {product.type && (
                  <div className="product-detail-specs-row">
                    <span className="product-detail-specs-label">Type:</span>
                    <span className="product-detail-specs-value">{product.type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                  </div>
                )}
                {product.serialNumber && (
                  <div className="product-detail-specs-row">
                    <span className="product-detail-specs-label">Serial Number:</span>
                    <span className="product-detail-specs-value product-detail-specs-serial">{product.serialNumber}</span>
                  </div>
                )}
                <div className="product-detail-specs-row">
                  <span className="product-detail-specs-label">Categories:</span>
                  <span className="product-detail-specs-value product-detail-specs-category">
                    {product.categories ? product.categories.map(cat => formatCategory(cat)).join(', ') : formatCategory(product.category)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="product-detail-services-title">
                <FaShieldAlt className="product-detail-services-icon" />
                Warranty Information
              </h3>
              <div className="product-detail-services-list">
                <div className="product-detail-services-row">
                  <FaShieldAlt className="product-detail-services-icon" />
                  <span>{product.warranty || 'Warranty Support'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products or CTA */}
        <div className="product-detail-section product-detail-help-section">
          <h3 className="product-detail-help-title">Need Help?</h3>
          <p className="product-detail-help-desc">
            Have questions on maintenance services and parts replacement? Contact our expert team for assistance.
          </p>
          <div className="product-detail-help-btns">
            <Link to="/contact" className="btn btn-primary product-detail-help-contact-btn">
              Contact Us
            </Link>
            <Link to="/products" className="btn product-detail-help-browse-btn">
              Browse More Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 