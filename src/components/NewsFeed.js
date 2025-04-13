import React, { useState, useEffect } from "react";
import axios from "axios";  // Vamos usar o axios para buscar as notícias da API
import NewsCard from "./NewsCard";  // Importando o componente NewsCard

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscando as notícias na API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/news");  // Chame sua API aqui
        setNews(response.data);  // Guardando as notícias que vieram da API
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);  // Mudando o loading para falso quando terminar de buscar
      }
    };

    fetchNews();
  }, []);  // O [] significa que a função vai rodar uma vez quando o componente for montado

  // Exibindo uma mensagem de loading enquanto as notícias estão sendo carregadas
  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      {news.map((item, index) => (
        <NewsCard key={index} news={item} />  // Para cada notícia, exibe o NewsCard
      ))}
    </div>
  );
};

export default NewsFeed;
