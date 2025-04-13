import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Noticia() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const navigate = useNavigate();
  const [progresso, setProgresso] = useState(0);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        const res = await fetch("/api/boas-noticias");
        const data = await res.json();
        setNoticia(data[id]);
        setAudio(new SpeechSynthesisUtterance(data[id].content));
      } catch (error) {
        console.error("Erro ao buscar notícia:", error);
      }
    };
    fetchNoticia();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const atual = window.scrollY;
      setProgresso((atual / total) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePlay = () => {
    if (audio) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(audio);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
        ← Voltar
      </button>
      {noticia ? (
        <>
          <div style={{ height: "8px", width: "100%", backgroundColor: "#ddd", marginBottom: "1rem" }}>
            <div style={{ height: "100%", width: `${progresso}%`, backgroundColor: "#007bff" }}></div>
          </div>
          <h1>{noticia.title}</h1>
          <p>{new Date(noticia.pubDate).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <p style={{ fontStyle: "italic" }}>{noticia.author} ({noticia.source})</p>
          {noticia.image && <img src={noticia.image} alt={noticia.title} style={{ width: "100%", marginTop: "1rem", marginBottom: "1rem" }} />}
          <p style={{ marginBottom: "1rem" }}>{noticia.content}</p>
          <button onClick={handlePlay} style={{ padding: "0.5rem 1rem", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}>
            ▶️ Ouvir notícia
          </button>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}

export default Noticia;
