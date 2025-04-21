import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importação correta do componente App
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Se estiver usando registro manual
// import { registerServiceWorker } from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// registerServiceWorker(); // <- Descomente se quiser registrar manualmente
