import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Noticia from "./pages/Noticia";
import NoticiasSalvas from "./pages/NoticiasSalvas";
import Filtros from "./pages/Filtros"; // Certifique-se de que o caminho está correto

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticia/:link" element={<Noticia />} />
          <Route path="/noticias-salvas" element={<NoticiasSalvas />} />
          <Route path="/filtros" element={<Filtros onFilterChange={(sources, classifications) => {
            // Aqui você pode definir a lógica para atualizar o estado global ou passar os filtros para o componente Home
          }} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
