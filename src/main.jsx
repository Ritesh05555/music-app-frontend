

// import React from 'react';
// import ReactDOM from 'react-dom/client'; // For React 18+
// import App from './App.jsx'; // Or wherever your main App component is
//  // If you have global CSS


// // For React 18+
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import service worker registration
import { registerSW } from 'virtual:pwa-register';

// For React 18+
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Register service worker silently
registerSW({ immediate: true });

