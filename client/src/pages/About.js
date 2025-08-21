import React from 'react';
import { FaPrint, FaTools, FaShieldAlt, FaUsers, FaAward, FaHandshake } from 'react-icons/fa';

const About = () => {
  return (
    <>
      <div className="about-hero">
        <div className="about-hero-container" style={{ marginBottom: '2.5rem' }}>
          <h1 className="about-title">About AKICC</h1>
          <p className="about-subtitle">
            Your trusted partner in professional printer solutions, parts, and maintenance services.
            We're dedicated to keeping your business running smoothly with reliable equipment and expert support.
          </p>
        </div>
      </div>
      <div className="about-root">
        <div className="about-overview-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="about-overview-text">
            <h2 className="about-overview-title">Who We Are</h2>
            <p className="about-overview-desc">
              AKICC is a leading provider of professional printer solutions, specializing in sales, 
              parts, and comprehensive maintenance services. With years of experience in the industry, 
              we understand the critical role that reliable printing equipment plays in your business operations.
            </p>
            <p className="about-overview-desc">
              Our mission is to provide businesses and individuals with high-quality printer solutions 
              backed by exceptional customer service and technical expertise. We work with trusted 
              manufacturers to offer the best products at competitive prices.
            </p>
            <p className="about-overview-desc">
              Whether you need a new printer, replacement parts, or professional maintenance services, 
              our team of experts is here to help you find the perfect solution for your needs.
            </p>
          </div>
          <div className="about-overview-image-wrapper">
            <img
              src="/about-hero.jpg"
              alt="AKICC Team"
              className="about-overview-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="about-overview-image-overlay"></div>
          </div>
        </div>
        <div className="about-services-header" style={{ marginBottom: '1.5rem' }}>
          <h2 className="about-services-title">Our Services</h2>
          <p className="about-services-desc">
            Comprehensive printer solutions to meet all your business needs
          </p>
        </div>
        <div className="about-services-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="about-service-card">
            <div className="about-service-icon about-service-icon-blue">
              <FaPrint size={32} />
            </div>
            <h3 className="about-service-title">Printer Sales</h3>
            <p className="about-service-desc">
              We offer a wide selection of high-quality printers from leading manufacturers. 
              From small office printers to large commercial machines, we have the perfect 
              solution for your printing needs.
            </p>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon about-service-icon-green">
              <FaTools size={32} />
            </div>
            <h3 className="about-service-title">Parts & Supplies</h3>
            <p className="about-service-desc">
              Genuine replacement parts and high-quality supplies for all major printer brands. 
              We maintain a comprehensive inventory to ensure quick delivery and minimal downtime.
            </p>
          </div>
          <div className="about-service-card">
            <div className="about-service-icon about-service-icon-purple">
              <FaShieldAlt size={32} />
            </div>
            <h3 className="about-service-title">Maintenance & Repair</h3>
            <p className="about-service-desc">
              Professional maintenance and repair services to keep your printers running at peak 
              performance. Our certified technicians provide on-site and remote support.
            </p>
          </div>
        </div>
        <div className="about-why-header" style={{ marginBottom: '1.5rem' }}>
          <h2 className="about-why-title">Why Choose AKICC?</h2>
          <p className="about-why-desc">
            We're committed to providing exceptional service and reliable solutions
          </p>
        </div>
        <div className="about-why-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="about-why-card">
            <div className="about-why-icon about-why-icon-blue">
              <FaUsers size={24} />
            </div>
            <div>
              <h3 className="about-why-card-title">Expert Team</h3>
              <p className="about-why-card-desc">
                Our team of certified technicians and sales professionals have years of experience 
                in the printer industry.
              </p>
            </div>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon about-why-icon-green">
              <FaAward size={24} />
            </div>
            <div>
              <h3 className="about-why-card-title">Quality Products</h3>
              <p className="about-why-card-desc">
                We partner with leading manufacturers to offer only the highest quality printers 
                and genuine parts.
              </p>
            </div>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon about-why-icon-purple">
              <FaHandshake size={24} />
            </div>
            <div>
              <h3 className="about-why-card-title">Customer Service</h3>
              <p className="about-why-card-desc">
                We prioritize customer satisfaction with responsive support and personalized solutions.
              </p>
            </div>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon about-why-icon-orange">
              <FaTools size={24} />
            </div>
            <div>
              <h3 className="about-why-card-title">Fast Service</h3>
              <p className="about-why-card-desc">
                Quick response times and efficient service to minimize downtime and keep your 
                business running smoothly.
              </p>
            </div>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon about-why-icon-red">
              <FaShieldAlt size={24} />
            </div>
            <div>
              <h3 className="about-why-card-title">Warranty Support</h3>
              <p className="about-why-card-desc">
                Comprehensive warranty coverage and ongoing support to protect your investment.
              </p>
            </div>
          </div>
          <div className="about-why-card">
            <div className="about-why-icon about-why-icon-indigo">
              <FaPrint size={24} />
            </div>
            <div>
              <h3 className="about-why-card-title">Custom Solutions</h3>
              <p className="about-why-card-desc">
                Tailored solutions to meet your specific printing requirements and business needs.
              </p>
            </div>
          </div>
        </div>
        <div className="about-values-header" style={{ marginBottom: '1.5rem' }}>
          <h2 className="about-values-title">Our Values</h2>
          <p className="about-values-desc">
            The principles that guide everything we do
          </p>
        </div>
        <div className="about-values-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="about-value-card about-value-card-blue">
            <h3 className="about-value-title">Quality</h3>
            <p className="about-value-desc">
              We never compromise on quality. Every product we sell and every service we provide 
              meets the highest standards of excellence.
            </p>
          </div>
          <div className="about-value-card about-value-card-green">
            <h3 className="about-value-title">Reliability</h3>
            <p className="about-value-desc">
              Our customers can count on us to deliver reliable solutions and dependable service 
              when they need it most.
            </p>
          </div>
          <div className="about-value-card about-value-card-purple">
            <h3 className="about-value-title">Integrity</h3>
            <p className="about-value-desc">
              We conduct business with honesty and transparency, building lasting relationships 
              based on trust and mutual respect.
            </p>
          </div>
          <div className="about-value-card about-value-card-orange">
            <h3 className="about-value-title">Innovation</h3>
            <p className="about-value-desc">
              We stay at the forefront of technology to provide cutting-edge solutions that 
              help our customers succeed.
            </p>
          </div>
        </div>
      </div>
      {/* CTA Section - visually distinct */}
      <div className="about-cta">
        <div className="about-cta-container" style={{ textAlign: 'center', marginBottom: 0 }}>
          <h2 className="about-cta-title">Ready to Get Started?</h2>
          <p className="about-cta-desc">
            Contact us today to discuss your printer needs and discover how AKICC can help 
            your business thrive with reliable printing solutions.
          </p>
          <div className="about-cta-btns">
            <a href="/contact" className="btn about-cta-btn-primary">
              Contact Us
            </a>
            <a href="/products" className="btn about-cta-btn-outline">
              Browse Products
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default About; 