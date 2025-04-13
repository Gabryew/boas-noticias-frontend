import React from 'react';
import ReactDOM from 'react-dom/client'; // Certifique-se de que está importando 'react-dom/client'
import App from './App'; // Certifique-se de que o App está sendo importado corretamente

const root = ReactDOM.createRoot(document.getElementById('root')); // Crie o root com o id 'root'
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
