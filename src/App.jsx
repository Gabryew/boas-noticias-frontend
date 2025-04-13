import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable"; // Importa a biblioteca de swipe

function App() {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [noticiaAtual, setNoticiaAtual] = useState(0); // Controla qual notícia está visível

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const data = await res.json();
        console.log("Dados da API:", data); // Verifique a resposta da API
        setNoticias(data);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setCarregando(false);
      }
    };

    fetchNoticias();
  }, []);

  // Função que vai para a próxima ou para a anterior
  const handleSwipe = (direction) => {
    if (direction === "up") {
      // Vai para a próxima notícia (deslizar para cima)
      setNoticiaAtual((prevIndex) => (prevIndex + 1) % noticias.length);
    } else if (direction === "down") {
      // Vai para a notícia anterior (deslizar para baixo)
      setNoticiaAtual((prevIndex) => (prevIndex - 1 + noticias.length) % noticias.length);
    }
  };

  // Configura o swipeable para detectar swipe para cima e para baixo
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"), // Quando o usuário deslizar para cima
    onSwipedDown: () => handleSwipe("down"), // Quando o usuário deslizar para baixo
    trackMouse: true, // Permite swipe usando o mouse também (para desktop)
  });

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        color: "#333",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>🌞 Boas Notícias do Dia</h1>

      {carregando ? (
        <p style={{ textAlign: "center" }}>Carregando...</p>
      ) : noticias.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nenhuma notícia encontrada.</p>
      ) : (
        <div
          {...swipeHandlers} // Aplica as interações de swipe ao container
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
              width: "90%",
              maxWidth: "500px",
              cursor: "pointer",
              transition: "transform 0.3s ease-in-out",
              padding: "1rem",
            }}
          >
            {/* Exibição da classificação */}
            {noticias[noticiaAtual].classification === "good" && (
              <div
                style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Boa notícia! 🌞
              </div>
            )}

            {/* Exibição da imagem, se houver */}
            {noticias[noticiaAtual].image && (
              <img
                src={noticias[noticiaAtual].image}
                alt={noticias[noticiaAtual].title}
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                }}
              />
            )}

            <div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                {noticias[noticiaAtual].title}
              </h2>
              <p style={{ color: "#666" }}>
                {new Date(noticias[noticiaAtual].pubDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p
                style={{
                  color: "#666",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                }}
              >
                {noticias[noticiaAtual].author} ({noticias[noticiaAtual].source})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
