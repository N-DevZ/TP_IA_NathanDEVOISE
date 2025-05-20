// Dans LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => (
  <div className="loading-spinner-overlay">
    <div className="loading-spinner"></div>
    <p>Refreshing...</p>
  </div>
);

export default LoadingSpinner;