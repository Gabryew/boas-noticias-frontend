import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Noticia from "./pages/Noticia";
import NoticiasSalvas from "./pages/NoticiasSalvas";
import Filtros from "./pages/Filtros"; // Importe o componente de filtros

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticia/:link" element={<Noticia />} />
          <Route path="/noticias-salvas" element={<NoticiasSalvas />} />
          <Route path="/filtros" element={<Filtros onFilterChange={(sources, classification) => {
            // Aqui você pode definir a lógica para atualizar o estado global ou passar os filtros para o componente Home
            // Por exemplo, usando um estado global ou contexto para compartilhar os filtros
          }} />} /> {/* Nova rota para filtros */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
