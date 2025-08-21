import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import apiConfig from '../config/api';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [myList, setMyList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myListLoading, setMyListLoading] = useState(false);
  
  // Get user from localStorage to avoid circular dependency
  const [currentUser, setCurrentUser] = useState(null);
  
  // Check for user changes
  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      setCurrentUser(user);
    };
    
    checkUser();
    
    // Listen for custom auth events
    const handleAuthChange = () => {
      checkUser();
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (category = null, search = null) => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await axios.get(`${apiConfig.baseURL}/api/products`, { params });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products', { toastId: 'fetch-products-error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${apiConfig.baseURL}/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Fetch my list
  const fetchMyList = useCallback(async () => {
    setMyListLoading(true);
    try {
      const response = await axios.get(`${apiConfig.baseURL}/api/mylist`);
      setMyList(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Don't show error for 401, just clear token and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch your list. Please log in again.', { toastId: 'fetch-my-list-error' });
      }
    } finally {
      setMyListLoading(false);
    }
  }, []);

  // Add to my list
  const addToMyList = useCallback(async (productId) => {
    try {
      await axios.post(`${apiConfig.baseURL}/api/mylist`, { productId });
      await fetchMyList();
      toast.success('Added to your list', { toastId: 'add-to-list-success' });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please log in again to continue', { toastId: 'login-again-error' });
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error || 'Failed to add to list', { toastId: 'add-to-list-error' });
      }
    }
  }, [fetchMyList]);

  // Remove from my list
  const removeFromMyList = useCallback(async (productId) => {
    try {
      await axios.delete(`${apiConfig.baseURL}/api/mylist/${productId}`);
      await fetchMyList();
      toast.success('Removed from your list', { toastId: 'remove-from-list-success' });
    } catch (error) {
      toast.error('Failed to remove from list', { toastId: 'remove-from-list-error' });
    }
  }, [fetchMyList]);

  // Send list to admins
  const sendList = async () => {
    try {
      await axios.post(`${apiConfig.baseURL}/api/mylist/send`);
      toast.success('List sent to admins successfully', { toastId: 'send-list-success' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send list', { toastId: 'send-list-error' });
    }
  };

  // Add product (admin only)
  const addProduct = async (productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData[key])) {
            // Handle multiple images
            productData[key].forEach((image, index) => {
              formData.append('images', image);
            });
          } else if (key === 'categories' && Array.isArray(productData[key])) {
            // Handle multiple categories
            productData[key].forEach((category, index) => {
              formData.append('categories', category);
            });
          } else {
            formData.append(key, productData[key]);
          }
        }
      });

      await axios.post(`${apiConfig.baseURL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchProducts();
      toast.success('Product added successfully', { toastId: 'add-product-success' });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add product', { toastId: 'add-product-error' });
      return false;
    }
  };

  // Update product (admin only)
  const updateProduct = async (id, productData) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          if (key === 'images' && Array.isArray(productData[key])) {
            // Handle multiple images
            productData[key].forEach((image, index) => {
              formData.append('images', image);
            });
          } else if (key === 'categories' && Array.isArray(productData[key])) {
            // Handle multiple categories
            productData[key].forEach((category, index) => {
              formData.append('categories', category);
            });
          } else {
            formData.append(key, productData[key]);
          }
        }
      });

      await axios.put(`${apiConfig.baseURL}/api/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await fetchProducts();
      toast.success('Product updated successfully', { toastId: 'update-product-success' });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product', { toastId: 'update-product-error' });
      return false;
    }
  };

  // Delete product (admin only)
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${apiConfig.baseURL}/api/products/${id}`);
      await fetchProducts();
      toast.success('Product deleted successfully', { toastId: 'delete-product-success' });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete product', { toastId: 'delete-product-error' });
      return false;
    }
  };

  // Get products by category
  const getProductsByCategory = (category) => {
    return products.filter(product => 
      (product.categories && product.categories.includes(category)) || 
      product.category === category
    );
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch user's list whenever user changes
  useEffect(() => {
    if (currentUser) {
      fetchMyList();
    } else {
      setMyList([]);
    }
  }, [currentUser, fetchMyList]);



  const value = {
    products,
    myList,
    categories,
    loading,
    myListLoading,
    fetchProducts,
    fetchMyList,
    addToMyList,
    removeFromMyList,
    sendList,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}; 