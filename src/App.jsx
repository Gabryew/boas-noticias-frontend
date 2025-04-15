import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Noticia from "./pages/Noticia";
import NoticiasSalvas from "./pages/NoticiasSalvas";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticia/:link" element={<Noticia />} />
          <Route path="/noticias-salvas" element={<NoticiasSalvas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
