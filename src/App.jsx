import React, { useEffect, useState } from "react";

function App() {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);

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

  return (
    <div style={{
      padding: "2rem",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      color: "#333"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>🌞 Boas Notícias do Dia</h1>

      {carregando ? (
        <p style={{ textAlign: "center" }}>Carregando...</p>
      ) : noticias.length === 0 ? (
        <p style={{ textAlign: "center" }}>Nenhuma notícia encontrada.</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem"
        }}>
          {noticias.map((noticia, index) => (
            <div key={index} style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              {/* Exibição da classificação */}
              {noticia.classification === "good" && (
                <div style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  textAlign: "center",
                }}>
                  Boa notícia! 🌞
                </div>
              )}

              {/* Exibição da imagem, se houver */}
              {noticia.image && (
                <img src={noticia.image} alt={noticia.title} style={{
                  width: "100%", 
                  height: "180px", 
                  objectFit: "cover"
                }} />
              )}

              <div style={{ padding: "1rem" }}>
                <a href={noticia.link} target="_blank" rel="noreferrer" style={{
                  textDecoration: "none", 
                  color: "#333"
                }}>
                  <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                    {noticia.title}
                  </h2>
                </a>
                <small style={{ color: "#666" }}>
                  {new Date(noticia.pubDate).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
