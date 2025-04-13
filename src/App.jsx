import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Noticia from "./pages/Noticia";

function App() {
  const [modoNoturno, setModoNoturno] = useState(false);

  const alternarModoNoturno = () => {
    setModoNoturno(!modoNoturno);
  };

  return (
    <Router>
      <div
        style={{
          backgroundColor: modoNoturno ? "#333" : "#f8f9fa",
          color: modoNoturno ? "#f8f9fa" : "#333",
          minHeight: "100vh",
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        <button
          onClick={alternarModoNoturno}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            fontSize: 24,
            background: "none",
            border: "none",
            color: modoNoturno ? "#f8f9fa" : "#333",
          }}
        >
          {modoNoturno ? "🌞" : "🌙"}
        </button>
        <Routes>
          <Route path="/" element={<Home modoNoturno={modoNoturno} />} />
          <Route path="/noticia/:id" element={<Noticia modoNoturno={modoNoturno} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
