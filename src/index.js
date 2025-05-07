import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SingleSoftphone from './DualSoftphone';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SingleSoftphone />
  </React.StrictMode>
);

reportWebVitals();