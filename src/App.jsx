import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { FaMoon, FaSun } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

function App() {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [noticiaAtual, setNoticiaAtual] = useState(0);
  const [modoNoturno, setModoNoturno] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch("/api/boas-noticias");
        const data = await res.json();
        setNoticias(data);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setCarregando(false);
      }
    };
    fetchNoticias();
  }, []);

  const handleSwipe = (direction) => {
    if (direction === "up") {
      setNoticiaAtual((prev) => (prev + 1) % noticias.length);
    } else if (direction === "down") {
      setNoticiaAtual((prev) => (prev - 1 + noticias.length) % noticias.length);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"),
    onSwipedDown: () => handleSwipe("down"),
    trackMouse: true,
  });

  const alternarModoNoturno = () => setModoNoturno(!modoNoturno);

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "sans-serif",
        backgroundColor: modoNoturno ? "#333" : "#f8f9fa",
        color: modoNoturno ? "#f8f9fa" : "#333",
        minHeight: "100vh",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <button
        onClick={alternarModoNoturno}
        style={{ position: "absolute", top: 20, right: 20, fontSize: 24, background: "none", border: "none", color: modoNoturno ? "#f8f9fa" : "#333" }}
      >
        {modoNoturno ? <FaSun /> : <FaMoon />}
      </button>

      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>🌞 Boas Notícias do Dia</h1>

      {carregando ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <ClipLoader color={modoNoturno ? "#f8f9fa" : "#333"} size={50} />
        </div>
      ) : noticias.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nenhuma notícia encontrada.</p>
      ) : (
        <div {...swipeHandlers} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            onClick={() => navigate(`/noticia/${noticiaAtual}`)}
            style={{ backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "90%", maxWidth: 500, cursor: "pointer", padding: "1rem" }}
          >
            {noticias[noticiaAtual].classification === "good" && (
              <div style={{ backgroundColor: "#d4edda", color: "#155724", padding: "0.5rem", borderRadius: 4, marginBottom: 8, fontWeight: "bold", textAlign: "center" }}>
                Boa notícia! 🌞
              </div>
            )}
            {noticias[noticiaAtual].image && (
              <img src={noticias[noticiaAtual].image} alt={noticias[noticiaAtual].title} style={{ width: "100%", height: 250, objectFit: "cover", marginBottom: "1rem" }} />
            )}
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: 8 }}>{noticias[noticiaAtual].title}</h2>
            <p>{new Date(noticias[noticiaAtual].pubDate).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p style={{ fontSize: "0.9rem", marginTop: 4 }}>{noticias[noticiaAtual].author} ({noticias[noticiaAtual].source})</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
