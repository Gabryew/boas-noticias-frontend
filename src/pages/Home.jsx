import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        <motion.div
          key={index}
          className="w-screen h-screen snap-start relative flex items-end justify-center cursor-pointer"
          onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
          style={{
            backgroundImage: `url(${noticia.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Gradiente de fundo para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-0" />

          {/* Conteúdo */}
          <div className="relative z-10 w-full px-6 py-10 text-left space-y-4 backdrop-blur-sm">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
              {noticia.title}
            </h1>
            <div className="text-sm text-gray-300 flex flex-wrap gap-4 font-light">
              <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
              {noticia.author && <span>Por {noticia.author}</span>}
              {noticia.source && <span>{noticia.source}</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
