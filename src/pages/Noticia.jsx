import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get(
          "https://boas-noticias-frontend.vercel.app/api/boas-noticias"
        );
        const noticiaSelecionada = response.data[id];
        setNoticia(noticiaSelecionada);
      } catch (error) {
        console.error("Erro ao buscar notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
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
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Notícia não encontrada.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white p-4">
      <div className="max-w-3xl mx-auto">
        {noticia.imagem && (
          <img
            src={noticia.imagem}
            alt={noticia.titulo}
            className="w-full h-auto rounded-xl mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{noticia.titulo}</h1>
        <p className="text-sm mb-4">
          {noticia.autor} ({noticia.veiculo}) •{" "}
          {new Date(noticia.data).toLocaleDateString()}
        </p>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
        />
      </div>
    </div>
  );
}
