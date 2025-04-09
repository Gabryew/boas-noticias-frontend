import React, { useEffect, useState } from "react";

function App() {
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);

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

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🌞 Boas Notícias do Dia</h1>
      {carregando ? (
        <p>Carregando...</p>
      ) : noticias.length === 0 ? (
        <p>Nenhuma notícia encontrada.</p>
      ) : (
        <ul>
          {noticias.map((noticia, index) => (
            <li key={index} style={{ marginBottom: "1rem" }}>
              <a href={noticia.link} target="_blank" rel="noreferrer">
                <strong>{noticia.title}</strong>
              </a>
              <br />
              <small>{new Date(noticia.pubDate).toLocaleString()}</small>
              <p>{noticia.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;