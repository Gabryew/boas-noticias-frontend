import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia({ modoNoturno }) {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const { link } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.link === link);

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link, navigate]);

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

  // Função opcional para tentar quebrar o summary em parágrafos
  const paragrafos = noticia.summary.split(/\n\s*\n|\. +/).filter(p => p.trim().length > 0);

  return (
    <div
      className={`min-h-screen p-6 ${
        modoNoturno ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-lg font-semibold text-blue-500 hover:text-blue-700 transition duration-300"
          >
            ← Voltar para a Home
          </button>
          <p className="text-sm opacity-70">
            {new Date(noticia.pubDate).toLocaleDateString()}
          </p>
        </header>

        <div className="rounded-xl overflow-hidden shadow-lg mb-6">
          <img
            src={noticia.image || "default-image.jpg"}
            alt={noticia.title}
            className="w-full h-80 object-cover"
          />
        </div>

        <h1 className="text-4xl font-bold mb-6 leading-tight">{noticia.title}</h1>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          {paragrafos.map((par, i) => (
            <p key={i}>{par}</p>
          ))}
        </article>

        <div className="mt-10">
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
    </div>
  );
}
