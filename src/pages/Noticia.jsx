import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Noticia({ modoNoturno }) {
  const { id } = useParams(); // Pegamos o id da URL
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        setNoticias(response.data); // Armazenar todas as notícias
      } catch (error) {
        console.error("Erro ao buscar as notícias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  // Verifica se o id existe e tenta acessar a notícia correspondente
  useEffect(() => {
    if (noticias.length > 0) {
      const noticiaId = parseInt(id, 10); // Garante que o id seja tratado como número
      const noticiaEncontrada = noticias[noticiaId]; // Tentando acessar pelo índice
      setNoticia(noticiaEncontrada); // Atualiza o estado da notícia
    }
  }, [id, noticias]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando a notícia...
      </div>
    );
  }

  // Verifica se a notícia foi encontrada
  if (!noticia) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Notícia não encontrada!
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen bg-cover bg-center bg-no-repeat`} style={{ backgroundImage: `url(${noticia.image || "default-image.jpg"})` }}>
      <div className="h-full bg-black/60">
        <div className="flex flex-col h-full justify-between">
          <header className="p-6">
            <Link to="/" className="text-white font-bold text-3xl hover:text-blue-400 transition duration-300">Voltar</Link>
          </header>

          <div className="flex-1 p-6 text-white flex flex-col justify-between">
            <h1 className="text-4xl font-bold mb-4">{noticia.title}</h1>
            <p className="text-lg mb-4">{new Date(noticia.pubDate).toLocaleDateString()}</p>
            <div className="prose lg:prose-xl max-w-none">
              <p>{noticia.summary}</p>
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: noticia.contentSnippet }} />
            </div>
            <div className="mt-4">
              <a href={noticia.link} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
                Leia a matéria completa
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
