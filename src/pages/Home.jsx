import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <div className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">
      {noticias.map((noticia, index) => (
        <div
          key={index}
          className="w-screen h-screen snap-start flex flex-col justify-end relative cursor-pointer"
          onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
          style={{
            backgroundImage: `url(${noticia.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="bg-black/70 p-6 backdrop-blur-sm w-full space-y-2">
            <h1 className="text-2xl font-bold">{noticia.title}</h1>
            <div className="text-sm text-gray-300 flex flex-wrap gap-4">
              <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
              {noticia.author && <span>Por {noticia.author}</span>}
              {noticia.source && <span>{noticia.source}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
