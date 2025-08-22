import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

const ImageGallery = ({ images, productName }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Combine main image with additional images and filter out failed images
  const allImages = (images || []).filter((_, index) => !imageErrors.has(index));
  
  // Reset image errors when images change
  useEffect(() => {
    setImageErrors(new Set());
    setCurrentImageIndex(0);
  }, [images]);
  
  if (allImages.length === 0) {
    return (
      <div className="product-detail-image-wrapper">
        <img
          src="/placeholder-printer.jpg"
          alt={productName}
          className="product-detail-image"
        />
      </div>
    );
  }

  // If there's only one image, display it without gallery controls
  if (allImages.length === 1) {
    return (
      <div className="product-detail-image-wrapper">
        <img
          src={allImages[0]}
          alt={productName}
          className="product-detail-image"
          onClick={() => setShowModal(true)}
          style={{ cursor: 'pointer' }}
          onError={(e) => {
            e.target.src = '/placeholder-printer.jpg';
            setImageErrors(prev => new Set([...prev, 0]));
          }}
        />
        
        {/* Modal for larger view */}
        {showModal && (
          <div className="product-image-modal" onClick={() => setShowModal(false)}>
            <div className="product-image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="product-image-modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
              
              <div className="product-image-modal-gallery">
                              <img
                src={allImages[0]}
                alt={productName}
                className="product-image-modal-image"
                onError={(e) => {
                  e.target.src = '/placeholder-printer.jpg';
                }}
              />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const currentImage = allImages[currentImageIndex];

  return (
    <>
      <div className="product-detail-image-wrapper">
        <div className="product-image-gallery">
          <img
            src={currentImage ? currentImage : '/placeholder-printer.jpg'}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="product-detail-image"
            onClick={openModal}
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.target.src = '/placeholder-printer.jpg';
              setImageErrors(prev => new Set([...prev, currentImageIndex]));
            }}
          />
          
          {/* Navigation arrows */}
          {allImages.length > 1 && (
            <>
              <button
                className="product-gallery-nav product-gallery-prev"
                onClick={previousImage}
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>
              <button
                className="product-gallery-nav product-gallery-next"
                onClick={nextImage}
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Image counter */}
          {allImages.length > 1 && (
            <div className="product-gallery-counter">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Thumbnail navigation */}
          {allImages.length > 1 && (
            <div className="product-gallery-thumbnails">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={`product-gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`Go to image ${index + 1}`}
                >
                                     <img
                     src={image}
                     alt={`Thumbnail ${index + 1}`}
                     onError={(e) => {
                       e.target.src = '/placeholder-printer.jpg';
                       setImageErrors(prev => new Set([...prev, index]));
                     }}
                   />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for larger view */}
      {showModal && (
        <div className="product-image-modal" onClick={closeModal}>
          <div className="product-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="product-image-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            
            <div className="product-image-modal-gallery">
              <img
                src={currentImage ? currentImage : '/placeholder-printer.jpg'}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                className="product-image-modal-image"
                onError={(e) => {
                  e.target.src = '/placeholder-printer.jpg';
                }}
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    className="product-image-modal-nav product-image-modal-prev"
                    onClick={previousImage}
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="product-image-modal-nav product-image-modal-next"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                  
                  <div className="product-image-modal-counter">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery; 