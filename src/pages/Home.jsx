import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable"; // Para o swipe das notícias
import ClipLoader from "react-spinners/ClipLoader";

function Home({ modoNoturno }) {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [noticiaAtual, setNoticiaAtual] = useState(0); // Controla qual notícia está visível
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch das notícias
    fetch("https://boas-noticias-frontend.vercel.app/api/boas-noticias") // Aqui, pegue o endpoint que você configurou no backend
      .then((res) => res.json())
      .then((data) => {
        // Verifique se os dados não estão vazios antes de setar o estado
        if (data && data.length > 0) {
          setNoticias(data);
        } else {
          setNoticias([]);
        }
        setCarregando(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar notícias:", error);
        setCarregando(false);
      });
  }, []); // O useEffect roda uma vez, no momento em que o componente é montado

  const handleSwipe = (direction) => {
    if (direction === "up" && noticiaAtual < noticias.length - 1) {
      setNoticiaAtual(noticiaAtual + 1);
    } else if (direction === "down" && noticiaAtual > 0) {
      setNoticiaAtual(noticiaAtual - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"),
    onSwipedDown: () => handleSwipe("down"),
    trackMouse: true,
  });

  return (
    <div
      {...swipeHandlers}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: modoNoturno ? "#333" : "#f8f9fa",
        transition: "background-color 0.3s",
        overflow: "hidden", // Impede overflow da tela
      }}
    >
      <button
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

      {carregando ? (
        <ClipLoader color={modoNoturno ? "#f8f9fa" : "#333"} size={50} />
      ) : noticias.length === 0 ? (
        <p>Nenhuma notícia encontrada.</p>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", // Permite centralizar o card
          }}
        >
          <div
            onClick={() => navigate(`/noticia/${noticiaAtual}`)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              width: "100vw", // Preenche a largura da tela
              height: "100vh", // Preenche a altura da tela
              cursor: "pointer",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {noticias[noticiaAtual].classification === "good" && (
              <div
                style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "0.5rem",
                  borderRadius: 4,
                  marginBottom: 8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Boa notícia! 🌞
              </div>
            )}
            {noticias[noticiaAtual].image && (
              <img
                src={noticias[noticiaAtual].image}
                alt={noticias[noticiaAtual].title}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  marginBottom: "1rem",
                }}
              />
            )}
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              {noticias[noticiaAtual].title}
            </h2>
            <p>
              {new Date(noticias[noticiaAtual].pubDate).toLocaleDateString(
                "pt-BR",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                marginTop: 4,
              }}
            >
              {noticias[noticiaAtual].author} ({noticias[noticiaAtual].source})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
