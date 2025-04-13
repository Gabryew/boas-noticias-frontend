import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./pages/App"; // Ou o nome correto que você escolher para o componente principal
import Noticia from "./pages/Noticia";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/noticia/:id" element={<Noticia />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
