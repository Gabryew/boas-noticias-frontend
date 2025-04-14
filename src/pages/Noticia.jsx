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
      className={`w-full h-full p-6 ${
        modoNoturno ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <header className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="text-lg font-semibold text-blue-500 hover:text-blue-700 transition duration-300"
        >
          Voltar para a Home
        </button>
        <p className="text-sm">{new Date(noticia.pubDate).toLocaleDateString()}</p>
      </header>

      <div className="rounded-lg shadow-lg overflow-hidden mb-8">
        <img
          src={noticia.image || "default-image.jpg"}
          alt={noticia.title}
          className="w-full h-96 object-cover"
        />
      </div>

      <div className="space-y-6">
        <h1 className="text-4xl font-bold">{noticia.title}</h1>
        <p className="text-lg">{noticia.summary}</p>
      </div>

      <div className="mt-8">
        <a
          href={noticia.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 text-white text-lg py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Leia mais no site original
        </a>
      </div>
    </div>
  );
}
