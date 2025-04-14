import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  const [salvas, setSalvas] = useState([]); // Estado para notícias salvas
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiasComTempo = response.data.map((noticia) => ({
          ...noticia,
          readingTime: calcularTempoLeitura(noticia.content),
        }));
        setNoticias(noticiasComTempo);

        // Carregar notícias salvas do localStorage
        const noticiasSalvas = JSON.parse(localStorage.getItem("noticiasSalvas")) || [];
        setSalvas(noticiasSalvas);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  const salvarNoticia = (noticia) => {
    const novasSalvas = [...salvas];
    const index = novasSalvas.findIndex((n) => n.link === noticia.link);
    if (index === -1) {
      novasSalvas.push(noticia);
    } else {
      novasSalvas.splice(index, 1); // Se já estiver salva, remove
    }

    // Atualizar o localStorage
    localStorage.setItem("noticiasSalvas", JSON.stringify(novasSalvas));
    setSalvas(novasSalvas);
  };

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-0" />

          <div className="relative z-10 w-full px-6 py-12 text-left space-y-4 backdrop-blur-sm">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
              {noticia.title}
            </h1>
            <div className="text-sm text-gray-300 flex flex-wrap gap-4 font-light">
              <span>{noticia.source}</span>
              {noticia.readingTime && <span>Tempo de leitura: {noticia.readingTime}</span>}
            </div>

            {/* Ícone de salvar */}
            <button
              onClick={() => salvarNoticia(noticia)}
              className="absolute top-4 right-4 text-white text-3xl"
            >
              {salvas.some((n) => n.link === noticia.link) ? (
                <span>❤️</span> // Coração preenchido se já estiver salva
              ) : (
                <span>🤍</span> // Coração vazio
              )}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
