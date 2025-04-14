import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        setNoticias(response.data);
      } catch (error) {
        console.error("Erro ao carregar notícias:", error);
      }
    }

    fetchNoticias();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen py-8 px-4 md:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">📰 Boas Notícias</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {noticias.map((noticia, index) => (
          <Link
            to={`/noticia/${encodeURIComponent(noticia.link)}`}
            key={index}
            className="block group rounded-xl overflow-hidden bg-zinc-900 shadow-lg hover:shadow-2xl transition-all"
          >
            {noticia.image && (
              <img
                src={noticia.image}
                alt={noticia.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            )}

            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold group-hover:text-blue-400 transition">
                {noticia.title}
              </h2>

              <div className="text-sm text-gray-400 flex gap-4 flex-wrap">
                <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
                {noticia.author && <span>Por {noticia.author}</span>}
                {noticia.source && <span>{noticia.source}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
