import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProduct } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowRight, FaStar, FaFire, FaBoxOpen, FaRocket } from 'react-icons/fa';
import { ProductCard } from './Products';

const Home = () => {
  const { products, getProductsByCategory, fetchProducts } = useProduct();
  const { user } = useAuth();

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts(null, null);
  }, [fetchProducts]);

  // Get products for different sections
  const hotProducts = (getProductsByCategory('hot') || products).slice(0, 4);
  const newArrivals = (getProductsByCategory('new') || products).slice(0, 4);
  const openBox = (getProductsByCategory('openbox') || products).slice(0, 4);

  const SectionHeader = ({ title, icon: Icon, description, viewMoreLink, viewMoreText }) => (
    <div className="home-section-header">
      <div className="home-section-header-left">
        <div className="home-section-header-icon">
          <Icon />
        </div>
        <div>
          <h2 className="home-section-header-title">{title}</h2>
          <p className="home-section-header-desc">{description}</p>
        </div>
      </div>
      {viewMoreLink && (
        <Link
          to={viewMoreLink}
          className="home-btn home-btn-view-more"
        >
          {viewMoreText}
        </Link>
      )}
    </div>
  );

  return (
    <div className="home-root">
      {/* Hero Banner */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-content">
            <h1 className="home-hero-title">
              Professional Printer Solutions
            </h1>
            <p className="home-hero-subtitle">
              AKICC is your trusted partner for premium printer sales, parts, and maintenance services. 
              We provide comprehensive solutions for businesses and individuals with expert support and 
              competitive pricing.
            </p>
            <div className="home-hero-btns">
              <Link to="/products" className="home-btn home-btn-primary">
                Browse Products
              </Link>
              <Link to="/contact" className="home-btn home-btn-outline" onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>
                Get Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-section home-features">
        <div className="home-section-container">
          <div className="home-features-grid">
            <div className="home-feature">
              <div className="home-feature-icon home-feature-hot">
                <FaFire size={32} />
              </div>
              <h3 className="home-feature-title">Hot Products</h3>
              <p className="home-feature-desc">Discover our most popular and trending printer solutions</p>
            </div>
            <div className="home-feature">
              <div className="home-feature-icon home-feature-new">
                <FaRocket size={32} />
              </div>
              <h3 className="home-feature-title">New Arrivals</h3>
              <p className="home-feature-desc">Latest models and cutting-edge technology</p>
            </div>
            <div className="home-feature">
              <div className="home-feature-icon home-feature-openbox">
                <FaBoxOpen size={32} />
              </div>
              <h3 className="home-feature-title">Open Box</h3>
              <p className="home-feature-desc">Quality products at discounted prices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Products Section */}
      <section className="home-section home-hot-products">
        <div className="home-section-container">
          <SectionHeader
            title="Hot Products"
            icon={FaFire}
            description="Our most popular and trending items"
            viewMoreLink="/products?category=hot"
            viewMoreText="View More Hot Products"
          />
          <div className="home-products-grid">
            {hotProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="home-section home-new-arrivals">
        <div className="home-section-container">
          <SectionHeader
            title="New Arrivals"
            icon={FaRocket}
            description="Latest models and cutting-edge technology"
            viewMoreLink="/products?category=new"
            viewMoreText="View More New Arrivals"
          />
          <div className="home-products-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Open Box Section */}
      <section className="home-section home-openbox">
        <div className="home-section-container">
          <SectionHeader
            title="Open Box Deals"
            icon={FaBoxOpen}
            description="Quality products at discounted prices"
            viewMoreLink="/products?category=openbox"
            viewMoreText="View More Open Box Deals"
          />
          <div className="home-products-grid">
            {openBox.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-section home-cta">
        <div className="home-section-container home-cta-container">
          <h2 className="home-cta-title">Ready to Get Started?</h2>
          <p className="home-cta-desc">
            Contact us today for expert advice and competitive quotes on all your printer needs.
          </p>
          <div className="home-cta-btns">
            <Link to="/contact" className="home-btn home-btn-primary" onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>
              Contact Us
            </Link>
            <Link to="/about" className="home-btn home-btn-outline" onClick={() => window.scrollTo({top: 0, behavior: 'auto'})}>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;