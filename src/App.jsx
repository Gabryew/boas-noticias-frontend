import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable"; // Importa a biblioteca de swipe
import { FaMoon, FaSun } from "react-icons/fa"; // Para o ícone de modo noturno

function App() {
  const [noticias, setNoticias] = useState([]); // Armazena as notícias
  const [carregando, setCarregando] = useState(true); // Estado de carregamento
  const [noticiaAtual, setNoticiaAtual] = useState(0); // Controla qual notícia está sendo exibida
  const [modoNoturno, setModoNoturno] = useState(false); // Controla o modo noturno

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

  // Função para calcular o tempo de leitura estimado
  const calcularTempoLeitura = (texto) => {
    const palavras = texto.split(" ").length;
    const palavrasPorMinuto = 200; // Média de leitura por minuto
    const tempoEmMinutos = Math.ceil(palavras / palavrasPorMinuto);
    return tempoEmMinutos;
  };

  // Função para alternar o modo noturno
  const alternarModoNoturno = () => {
    setModoNoturno(!modoNoturno);
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: modoNoturno ? "#333" : "#f8f9fa", // Muda o fundo para o modo noturno
        color: modoNoturno ? "#f8f9fa" : "#333", // Muda a cor da fonte para o modo noturno
        minHeight: "100vh",
        transition: "background-color 0.3s, color 0.3s", // Transição suave ao mudar o modo
      }}
    >
      {/* Botão para alternar o modo noturno */}
      <button
        onClick={alternarModoNoturno}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "transparent",
          border: "none",
          color: modoNoturno ? "#f8f9fa" : "#333",
          fontSize: "24px",
        }}
      >
        {modoNoturno ? <FaSun /> : <FaMoon />}
      </button>

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
            transition: "transform 0.3s ease-in-out",
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
              <img
                src={noticias[noticiaAtual].image}
                alt={noticias[noticiaAtual].title}
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  marginBottom: "1rem",
                }}
              />
            )}

            <div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: modoNoturno ? "#f8f9fa" : "#333",
                }}
              >
                {noticias[noticiaAtual].title}
              </h2>
              <p style={{ color: modoNoturno ? "#f8f9fa" : "#666" }}>
                {new Date(noticias[noticiaAtual].pubDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p
                style={{
                  color: modoNoturno ? "#f8f9fa" : "#666",
                  fontSize: "0.9rem",
                  marginTop: "0.5rem",
                }}
              >
                {noticias[noticiaAtual].author} ({noticias[noticiaAtual].source})
              </p>

              {/* Tempo de leitura */}
              <p
                style={{
                  color: modoNoturno ? "#f8f9fa" : "#666",
                  fontSize: "0.9rem",
                  marginTop: "1rem",
                }}
              >
                Tempo de leitura: {calcularTempoLeitura(noticias[noticiaAtual].content)} minutos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
