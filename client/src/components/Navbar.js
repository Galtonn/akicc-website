import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaHeart } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { myList } = useProduct();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-row">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            AKICC
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-desktop">
            <Link to="/" className="navbar-link">
              Home
            </Link>
            <Link to="/products" className="navbar-link">
              Products
            </Link>
            <Link to="/contact" className="navbar-link">
              Contact/Booking
            </Link>
            <Link to="/about" className="navbar-link">
              About Us
            </Link>
            {/* My List Link */}
            {user && (
              <Link to="/mylist" className="navbar-link navbar-mylist">
                <FaHeart className="navbar-mylist-icon" />
                My List
              </Link>
            )}
            {/* Admin Panel Link */}
            {isAdmin() && (
              <Link to="/admin" className="navbar-link">
                Admin Panel
              </Link>
            )}
            {/* User Authentication */}
            {user ? (
              <div className="navbar-user">
                <span className="navbar-username">
                  <FaUser className="navbar-user-icon" />
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="navbar-btn navbar-logout-btn"
                >
                  <FaSignOutAlt className="navbar-logout-icon" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="navbar-auth">
                <Link
                  to="/login"
                  className="navbar-link"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="navbar-btn navbar-register-btn"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="navbar-mobile-btn">
            <button
              onClick={toggleMenu}
              className="navbar-mobile-icon"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="navbar-mobile-menu">
            <div className="navbar-mobile-links">
              <Link
                to="/"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/contact"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact/Booking
              </Link>
              <Link
                to="/about"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              {user && (
                <Link
                  to="/mylist"
                  className="navbar-link navbar-mylist"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaHeart className="navbar-mylist-icon" />
                  My List
                </Link>
              )}
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="navbar-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              {user ? (
                <div className="navbar-user-mobile">
                  <span className="navbar-username">
                    <FaUser className="navbar-user-icon" />
                    {user.username}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="navbar-btn navbar-logout-btn"
                  >
                    <FaSignOutAlt className="navbar-logout-icon" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="navbar-auth-mobile">
                  <Link
                    to="/login"
                    className="navbar-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="navbar-btn navbar-register-btn"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 