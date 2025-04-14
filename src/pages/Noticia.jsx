import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia({ modoNoturno }) {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const { link } = useParams();  // Recupera o parâmetro da URL
  const navigate = useNavigate();  // Função para navegação

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find(
          (n) => n.link === link // Comparando o link da URL com o link da notícia
        );

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
        } else {
          navigate("/"); // Caso não encontre, redireciona para a home
        }
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link, navigate]); // Recarrega a notícia se o link mudar

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando notícia...
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Notícia não encontrada.
      </div>
    );
  }

  return (
    <div
      className="w-full h-full p-4"
      style={{
        backgroundColor: modoNoturno ? "#333" : "#f8f9fa",
        color: modoNoturno ? "#f8f9fa" : "#333",
      }}
    >
      <h1 className="text-3xl font-bold mb-4">{noticia.title}</h1>
      <p className="text-sm">{new Date(noticia.pubDate).toLocaleDateString()}</p>
      <img
        src={noticia.image || "default-image.jpg"}
        alt={noticia.title}
        className="mt-4 mb-6 w-full h-auto object-cover"
      />
      <p>{noticia.summary}</p>
      <a
        href={noticia.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline mt-4"
      >
        Leia mais no site original
      </a>
    </div>
  );
}
