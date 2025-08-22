import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProduct } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaHeart, FaEye } from 'react-icons/fa';

export const ProductCard = ({ product }) => {
  const { addToMyList, removeFromMyList, myList, myListLoading } = useProduct();
  const { user } = useAuth();
  // Support both camelCase and lowercase price fields
  const endUserPrice = product.endUserPrice || product.enduserprice;
  const dealerPrice = product.dealerPrice || product.dealerprice;
  // Function to get label info for a category
  const getLabelInfo = (category) => {
    switch (category) {
      case 'new':
        return { text: 'New Arrival', class: 'product-label-new' };
      case 'openbox':
        return { text: 'Open Box', class: 'product-label-openbox' };
      case 'hot':
        return { text: 'Hot Product', class: 'product-label-hot' };
      case 'parts':
        return { text: 'Parts', class: 'product-label-parts' };
      default:
        return null;
    }
  };

  // Get all labels for multiple categories
  const getLabels = () => {
    const labels = [];
    
    if (product.categories && product.categories.length > 0) {
      product.categories.forEach(category => {
        const labelInfo = getLabelInfo(category);
        if (labelInfo) {
          labels.push(labelInfo);
        }
      });
    } else if (product.category) {
      const labelInfo = getLabelInfo(product.category);
      if (labelInfo) {
        labels.push(labelInfo);
      }
    }
    
    return labels;
  };

  const labels = getLabels();
  
  // Check if product is in user's list
  const isInMyList = myList.some(item => item.id === product.id);
  
  return (
    <div className="product-card">
      {/* Multiple Special Labels */}
      {labels.length > 0 && (
        <div className="product-label-container">
          {labels.map((label, index) => (
            <div key={index} className={`product-label ${label.class}`}>
              {label.text}
            </div>
          ))}
        </div>
      )}
      {/* Image */}
      <div className="product-image-container">
        <img
          src={product.image ? product.image : '/placeholder-printer.jpg'}
          alt={product.name}
          className="product-image"
          style={{ imageRendering: 'high-quality' }}
          loading="lazy"
          onError={e => {
            if (!e.target.src.endsWith('/placeholder-printer.jpg')) {
              e.target.src = '/placeholder-printer.jpg';
            }
          }}
        />

        {/* Category badge for other categories */}
        {!((product.categories && product.categories.some(cat => ['new', 'openbox', 'hot', 'parts'].includes(cat))) || 
           (product.category && ['new', 'openbox', 'hot', 'parts'].includes(product.category))) && (
          <div className="product-category-badge">{product.category}</div>
        )}
      </div>
      {/* Info Section */}
      <div className="product-info">
        <h3 className="product-title">{product.brand} {product.series} {product.model}</h3>
        {product.type && (
          <p className="product-brand-model" style={{ marginBottom: '12px' }}>{product.type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
        )}
        {/* Price Section */}
        <div className="product-price">
          {user && user.userType === 'admin' && (
            <>
              <span className="product-price-label">Dealer: <span className="product-price-dealer">${dealerPrice}</span></span>
              <span className="product-price-label">End User: <span className="product-price-enduser">${endUserPrice}</span></span>
            </>
          )}
          {user && user.userType === 'dealer' && (
            <span className="product-price-label">Price: <span className="product-price-dealer">${dealerPrice}</span></span>
          )}
          {user && user.userType === 'enduser' && (
            <span className="product-price-label">Price: <span className="product-price-enduser">${endUserPrice}</span></span>
          )}
          {!user && (
            <span className="product-price-label">Price: <span className="product-price-enduser">${endUserPrice}</span></span>
          )}
        </div>
        <div className="product-actions-spacer" />
        {/* Actions */}
        <div className="product-actions">
          <Link
            to={`/products/${product.id}`}
            className="btn btn-primary product-view-btn"
          >
            <FaEye className="inline" size={14} /> View
          </Link>
          {user && (
            myListLoading ? (
              <button
                className="btn btn-outline product-add-btn"
                disabled
                title="Loading..."
              >
                <FaHeart className="inline product-add-icon" size={14} /> Loading...
              </button>
            ) : isInMyList ? (
              <button
                onClick={() => removeFromMyList(product.id)}
                className="btn btn-danger product-remove-btn"
                title="Remove from My List"
              >
                <FaHeart className="inline product-remove-icon" size={14} /> Remove
              </button>
            ) : (
              <button
                onClick={() => addToMyList(product.id)}
                className="btn btn-outline product-add-btn"
                title="Add to My List"
              >
                <FaHeart className="inline product-add-icon" size={14} /> Add to List
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { products, categories, loading, myListLoading, fetchProducts, fetchMyList, myList } = useProduct();
  const { user } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [productTypes, setProductTypes] = useState([]);

  // Function to format category display names
  const formatCategoryDisplay = (category) => {
    switch (category) {
      case 'hot':
        return 'Hot Products';
      case 'new':
        return 'New Arrivals';
      case 'openbox':
        return 'Open Box';
      case 'parts':
        return 'Parts';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Function to format product type display names
  const formatTypeDisplay = (type) => {
    if (!type) return '';
    return type.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // All possible product types
  const allProductTypes = [
    'mono printer',
    'mono MFP',
    'mono MFC',
    'color printer',
    'color MFP',
    'color MFC',
    'large format',
    'dot matrix',
    'label printer'
  ];

  // Fetch product types from products and combine with all possible types
  const fetchProductTypes = useCallback(() => {
    const existingTypes = [...new Set(products.map(product => product.type).filter(Boolean))];
    // Combine existing types with all possible types and remove duplicates
    const combinedTypes = [...new Set([...allProductTypes, ...existingTypes])];
    setProductTypes(combinedTypes);
  }, [products, allProductTypes]);

    const isInitialLoad = useRef(true);

  // Handle URL parameters and fetch products
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam) {
      setSelectedCategory(categoryParam);
      fetchProducts(categoryParam, searchTerm || null);
    } else {
      setSelectedCategory('');
      fetchProducts(null, searchTerm || null);
    }

    // Scroll to top when navigating from home page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, fetchProducts]);

  // Handle manual category and search changes (not from URL)
  useEffect(() => {
    if (!isInitialLoad.current) {
      fetchProducts(selectedCategory || null, searchTerm || null);
    }
    isInitialLoad.current = false;
  }, [selectedCategory, searchTerm, fetchProducts]);

  // Fetch product types when products change
  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);



  // Debug: Log myList and user info
  useEffect(() => {
    console.log('User:', user);
    console.log('MyList:', myList);
    console.log('MyList length:', myList.length);
  }, [user, myList]);







  // Filter products by type (client-side filtering)
  const filteredProducts = products.filter(product => {
    if (selectedType && product.type !== selectedType) {
      return false;
    }
    return true;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is now handled by useEffect when searchTerm changes
  };



  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return (a.dealerPrice || 0) - (b.dealerPrice || 0);
      case 'price-high':
        return (b.dealerPrice || 0) - (a.dealerPrice || 0);
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  return (
    <div className="products-root">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Discover our comprehensive range of printers and parts</p>
      </div>

      <div className="products-layout">
        {/* Left Sidebar - Filters */}
        <div className="products-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Filters</h3>
            
            {/* Product Type Filter */}
            <div className="filter-group">
              <label className="filter-label">Product Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-select"
              >
                <option value="">All Types</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatTypeDisplay(type)}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatCategoryDisplay(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedType || selectedCategory || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSelectedType('');
                  setSelectedCategory('');
                  setSortBy('newest');
                }}
                className="btn btn-outline filter-clear-btn"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="products-content">
          {/* Search Section */}
          <div className="products-filters">
            {/* Search */}
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </form>
          </div>

      {/* Results Info */}
      <div className="products-results-info">
        <p>
          Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
          {selectedCategory && ` in ${formatCategoryDisplay(selectedCategory)}`}
          {selectedType && ` of type ${formatTypeDisplay(selectedType)}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
        {!user && (
          <p className="products-empty-info">
            <FaHeart className="inline mr-1 text-red-500" />
            Login to add items to your list
          </p>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="products-empty">
          <div className="loading mx-auto"></div>
          <p>Loading products...</p>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="products-empty">
          <FaSearch className="mx-auto text-gray-400 mb-4" size={48} />
          <h3>No products found</h3>
          <p>
            {selectedType 
              ? `No products found of type "${formatTypeDisplay(selectedType)}"`
              : selectedCategory 
                ? `No products found in category "${formatCategoryDisplay(selectedCategory)}"`
                : searchTerm 
                  ? `No products found matching "${searchTerm}"`
                  : "Try adjusting your search terms or filters"
            }
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Products; 