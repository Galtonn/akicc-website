import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import { FaHeart, FaTrash, FaPaperPlane, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { ProductCard } from './Products';

const MyList = () => {
  const { user } = useAuth();
  const { myList, fetchMyList, removeFromMyList, sendList } = useProduct();

  useEffect(() => {
    if (user) {
      fetchMyList();
    }
  }, [user]);

  const handleRemoveFromList = async (productId) => {
    await removeFromMyList(productId);
  };

  const handleSendList = async () => {
    if (myList.length === 0) {
      alert('Your list is empty. Add some products first!');
      return;
    }
    
    if (window.confirm('Send this list to AKICC admins? This will notify them of your interest in these products.')) {
      await sendList();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHeart className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view and manage your product list.</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mylist-root">
      <div className="mylist-header">
        <h1 className="mylist-title">My List</h1>
        <p className="mylist-desc">Your saved products and favorites</p>
      </div>
      <div className="mylist-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/products" className="mylist-back-link mr-4">
              <FaArrowLeft className="inline mr-2" />
              Back to Products
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My List</h1>
              <p className="text-gray-600">Your saved products and favorites</p>
            </div>
          </div>
        </div>

        {/* List Content */}
        {myList.length === 0 ? (
          <>
            <div className="mylist-empty">
              <FaHeart className="mylist-empty-icon" size={64} />
              <h2 className="mylist-empty-title">Your List is Empty</h2>
              <p className="mylist-empty-desc">
                Start building your list by browsing our products and adding items you're interested in.
              </p>
              <Link to="/products" className="btn btn-primary mylist-empty-btn">
                <FaShoppingCart className="mylist-empty-btn-icon" />
                Browse Products
              </Link>
            </div>
            <div className="mylist-spacer"></div>
          </>
        ) : (
          <>
            {/* List Summary */}
            <div className="mylist-summary flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="mylist-summary-info text-center md:text-left">
                <h3 className="mylist-summary-title">
                  {myList.length} item{myList.length !== 1 ? 's' : ''} in your list
                </h3>
                <p className="mylist-summary-desc">
                  {user && user.userType && user.userType.toLowerCase() === 'admin' && (
                    <>
                      Total dealer value: ${myList.reduce((sum, item) => sum + parseFloat(item.dealerPrice), 0).toFixed(2)}<br/>
                      Total end user value: ${myList.reduce((sum, item) => sum + parseFloat(item.endUserPrice), 0).toFixed(2)}
                    </>
                  )}
                  {user && user.userType && user.userType.toLowerCase() === 'dealer' && (
                    <>Total price: ${myList.reduce((sum, item) => sum + parseFloat(item.dealerPrice), 0).toFixed(2)}</>
                  )}
                  {user && user.userType && user.userType.toLowerCase() === 'enduser' && (
                    <>Total price: ${myList.reduce((sum, item) => sum + parseFloat(item.endUserPrice), 0).toFixed(2)}</>
                  )}
                  {!user && (
                    <>Login to see total value</>
                  )}
                </p>
              </div>
              <div className="mylist-actions flex flex-col w-full gap-2 md:flex-row md:w-auto md:gap-4">
                <Link to="/products" className="btn btn-outline mylist-add-btn w-full md:w-auto">
                  <FaShoppingCart className="mylist-add-btn-icon" />
                  Add More Items
                </Link>
                <button
                  onClick={handleSendList}
                  className="btn btn-primary mylist-send-btn w-full md:w-auto"
                >
                  <FaPaperPlane className="mylist-send-btn-icon" />
                  Send to Admins
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="mylist-grid">
              {myList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Send List CTA */}
            <div className="mylist-cta">
              <h3 className="mylist-cta-title">Ready to proceed?</h3>
              <p className="mylist-cta-desc">
                Send your list to our team and we'll get back to you with pricing and availability information.
              </p>
              <button
                onClick={handleSendList}
                className="btn btn-primary mylist-cta-btn"
              >
                <FaPaperPlane className="mylist-cta-btn-icon" />
                Send List to Admins
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyList; 