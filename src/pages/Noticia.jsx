import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const { link } = useParams(); // Captura o parâmetro da URL
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        // Aqui você pode buscar os dados da notícia com base no 'link'
        // Isso pode ser feito utilizando a API que você já tem para obter as notícias
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticia = response.data.find(n => encodeURIComponent(n.link) === link);
        setNoticia(noticia);
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!noticia) {
    return <div>Notícia não encontrada</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{noticia.title}</h1>
      <p>{new Date(noticia.pubDate).toLocaleDateString()}</p>
      <div className="mt-4">
        <img
          src={noticia.image || "/default-image.jpg"}
          alt={noticia.title}
          className="w-full h-auto object-cover"
        />
        <p className="mt-4">{noticia.summary}</p>
        <a href={noticia.link} target="_blank" className="text-blue-400 underline mt-4">
          Leia mais no site
        </a>
      </div>
    </div>
  );
}
