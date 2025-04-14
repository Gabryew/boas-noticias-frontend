import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Função para calcular o tempo de leitura
function calcularTempoLeitura(texto) {
  if (!texto) return null;
  const palavras = texto.trim().split(/\s+/).length;
  const palavrasPorMinuto = 200;
  const minutos = Math.ceil(palavras / palavrasPorMinuto);
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
}

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiasComTempo = response.data.map((noticia) => ({
          ...noticia,
          readingTime: calcularTempoLeitura(noticia.content), // Garantir que o campo 'content' exista
        }));
        setNoticias(noticiasComTempo);
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
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
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
          <div className="relative z-10 w-full px-6 py-12 text-left space-y-4 backdrop-blur-sm">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
              {noticia.title}
            </h1>
            <div className="text-sm text-gray-300 flex flex-wrap gap-4 font-light">
              {noticia.readingTime && <span>{noticia.readingTime}</span>} {/* Exibindo o tempo de leitura */}
              {noticia.author && <span>Por {noticia.author}</span>}
              {noticia.source && <span>{noticia.source}</span>}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
