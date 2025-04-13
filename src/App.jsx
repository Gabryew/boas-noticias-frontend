import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable"; // Importa a biblioteca para detectar swipe

function App() {
  const [noticias, setNoticias] = useState([]); // Armazena as notícias
  const [carregando, setCarregando] = useState(true); // Estado de carregamento
  const [noticiaAtual, setNoticiaAtual] = useState(0); // Controla qual notícia está sendo exibida

  // Carrega as notícias da API quando o componente é montado
  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const data = await res.json();
        console.log("Dados da API:", data); // Verifique os dados que vieram da API
        setNoticias(data); // Armazena as notícias no estado
      } catch (error) {
        console.error("Erro ao buscar notícias:", error); // Se houver erro, exibe no console
      } finally {
        setCarregando(false); // Define que terminou de carregar
      }
    };

    fetchNoticias();
  }, []); // O useEffect roda uma vez quando o componente é montado

  // Função que é chamada quando o usuário faz swipe (arrasta) para cima ou para baixo
  const handleSwipe = (direction) => {
    if (direction === "up") {
      // Se for para cima, vai para a próxima notícia
      setNoticiaAtual((prevIndex) => (prevIndex + 1) % noticias.length);
    } else if (direction === "down") {
      // Se for para baixo, vai para a notícia anterior
      setNoticiaAtual((prevIndex) => (prevIndex - 1 + noticias.length) % noticias.length);
    }
  };

  // Configura o swipeable (detecção de arrastamento)
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => handleSwipe("up"), // Se o usuário arrastar para cima
    onSwipedDown: () => handleSwipe("down"), // Se o usuário arrastar para baixo
    trackMouse: true, // Permite também arrastar com o mouse (para desktop)
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
          {...swipeHandlers} // Aplica a interação de swipe ao container das notícias
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
            {/* Exibe se a notícia for boa */}
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

            {/* Exibe a imagem da notícia, se houver */}
            {noticias[noticiaAtual].image && (
              <>
                {console.log(noticias[noticiaAtual].image)} {/* Verifique a URL da imagem */}
                <img
                  src={noticias[noticiaAtual].image}
                  alt={noticias[noticiaAtual].title}
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "cover",
                  }}
                />
              </>
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
