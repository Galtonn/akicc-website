import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer-main" style={{ background: '#1e293b', color: '#fff', padding: '2.5rem 0 1.5rem 0', marginTop: '0' }}>
    <div className="footer-container" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2.5rem', padding: '0 1.5rem' }}>
      {/* Company Description */}
      <div className="footer-section" style={{ flex: '1 1 260px', minWidth: 220 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#3b82f6' }}>AKICC</h2>
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6 }}>
          AKICC is your trusted partner for premium printer sales, parts, and maintenance services. We provide comprehensive solutions for businesses and individuals with expert support and competitive pricing.
        </p>
      </div>
      {/* Quick Links */}
      <div className="footer-section" style={{ flex: '1 1 180px', minWidth: 180 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Quick Links</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1' }}>
          <li><Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }} onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>Home</Link></li>
          <li><Link to="/products" style={{ color: '#cbd5e1', textDecoration: 'none' }} onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>Products</Link></li>
          <li><Link to="/about" style={{ color: '#cbd5e1', textDecoration: 'none' }} onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>About Us</Link></li>
          <li><Link to="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }} onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>Contact</Link></li>
          <li><Link to="/mylist" style={{ color: '#cbd5e1', textDecoration: 'none' }} onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>My List</Link></li>
        </ul>
      </div>
      {/* Contact Info */}
      <div className="footer-section" style={{ flex: '1 1 220px', minWidth: 200 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Contact Info</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: '1.05rem' }}>
          <li>Email: <a href="mailto:info@akicc.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>info@akicc.com</a></li>
          <li>Phone: <a href="tel:+16472742819" style={{ color: '#3b82f6', textDecoration: 'none' }}>+1 (647) 274-2819</a></li>
          <li>Location: 400 Don Park Road Unit 2, Markham, ON, L3R1C6, Canada</li>
        </ul>
      </div>
    </div>
    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.95rem', marginTop: '2.5rem' }}>
      &copy; {new Date().getFullYear()} AKICC. All rights reserved.
    </div>
  </footer>
);

export default Footer; 