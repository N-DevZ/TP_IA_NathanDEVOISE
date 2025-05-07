import React from 'react';
import App from './App';

function SingleSoftphone() {
  return (
    <div>
      <h2>SIP Client (1000)</h2>
      <App username="1000" password="1234" callTo="1001" />
    </div>
  );
}

export default SingleSoftphone;