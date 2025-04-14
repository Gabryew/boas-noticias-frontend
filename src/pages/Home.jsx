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
    <div className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {noticias.map((noticia, index) => (
        <Link
          to={`/noticia/${encodeURIComponent(noticia.link)}`}
          key={index}
          className="w-screen h-screen snap-start relative block"
        >
          <div
            className="w-full h-full bg-cover bg-center flex items-end"
            style={{
              backgroundImage: `url(${noticia.image || "default-image.jpg"})`,
            }}
          >
            <div className="w-full bg-black/60 p-6 backdrop-blur-sm">
              <h1 className="text-2xl font-bold text-white mb-2 leading-snug">
                {noticia.title}
              </h1>
              <div className="flex justify-between text-sm text-gray-300">
                <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
                <span>
                  {noticia.author} ({noticia.source})
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
