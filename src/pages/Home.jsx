import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        setNoticias(response.data);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando notícias...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory">
      {noticias.map((noticia, index) => (
        <div
          key={index}
          className="w-screen h-screen snap-start flex flex-col justify-end relative text-white"
        >
          <img
            src={noticia.image || "/default-image.jpg"}
            alt={noticia.title}
            className="w-full h-full object-cover"
          />
          <div className="bg-black/60 p-6 backdrop-blur-sm w-full">
            <h1 className="text-2xl font-bold mb-2">{noticia.title}</h1>
            <p className="text-sm">
              {new Date(noticia.pubDate).toLocaleDateString()}
            </p>
            <Link
              to={`/noticia/${encodeURIComponent(noticia.link)}`}
              className="text-blue-400 underline mt-4"
            >
              Ler mais
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
