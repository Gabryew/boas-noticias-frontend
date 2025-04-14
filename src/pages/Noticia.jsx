import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get(`https://boas-noticias-frontend.vercel.app/api/boas-noticias/${id}`);
        setNoticia(response.data);
      } catch (error) {
        console.error("Erro ao buscar notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [id]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!noticia) {
    return <div>Notícia não encontrada.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">{noticia.title}</h1>
      <p className="text-sm">{noticia.summary}</p>
      <div className="mt-4">
        <img src={noticia.imagem} alt={noticia.title} className="w-full h-auto" />
      </div>
      <div className="mt-4">
        <p>{noticia.content}</p>
      </div>
    </div>
  );
}
