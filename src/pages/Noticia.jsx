import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.id === id);
        setNoticia(noticiaEncontrada);
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando notícia...
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-xl">
        Notícia não encontrada.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      {/* Imagem da notícia */}
      {noticia.imagem && (
        <div
          className="w-full h-72 bg-cover bg-center"
          style={{ backgroundImage: `url(${noticia.imagem})` }}
        />
      )}

      {/* Conteúdo */}
      <div className="p-6 space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-bold">{noticia.titulo}</h1>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {noticia.autor} ({noticia.veiculo}) •{" "}
          {new Date(noticia.data).toLocaleDateString()}
        </p>

        {/* Tempo de leitura */}
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Tempo estimado de leitura: {noticia.tempoDeLeitura || "2"} min
        </p>

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
        />
      </div>
    </div>
  );
}
