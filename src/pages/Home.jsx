import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart } from "react-icons/fa";

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
  const [salvas, setSalvas] = useState(() => {
    const local = localStorage.getItem("noticiasSalvas");
    return local ? JSON.parse(local) : [];
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchNoticias() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiasComTempo = response.data.map((noticia) => ({
          ...noticia,
          readingTime: calcularTempoLeitura(noticia.content),
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

  const toggleSalvarNoticia = (noticia) => {
    const jaSalva = salvas.find((n) => n.link === noticia.link);
    let atualizadas;
    if (jaSalva) {
      atualizadas = salvas.filter((n) => n.link !== noticia.link);
    } else {
      atualizadas = [...salvas, noticia];
    }
    setSalvas(atualizadas);
    localStorage.setItem("noticiasSalvas", JSON.stringify(atualizadas));
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
      {/* Menu superior */}
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex gap-4 text-sm font-semibold">
          <Link
            to="/"
            className={`hover:underline ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}
          >
            Últimas Notícias
          </Link>
          <Link
            to="/noticias-salvas"
            className={`hover:underline ${location.pathname === "/noticias-salvas" ? "text-white" : "text-gray-400"}`}
          >
            Notícias Salvas
          </Link>
        </div>
      </div>

      {noticias.map((noticia, index) => {
        const salva = salvas.find((n) => n.link === noticia.link);

        return (
          <motion.div
            key={index}
            className="w-screen h-screen snap-start relative flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            style={{
              backgroundImage: noticia.image ? `url(${noticia.image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: noticia.image ? "transparent" : "#111",
            }}
          >
            {/* Gradiente de fundo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-0" />

            {/* Ícone de salvar */}
            <div className="absolute top-20 right-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSalvarNoticia(noticia);
                }}
                aria-label={salva ? "Remover dos favoritos" : "Salvar nos favoritos"}
                className="text-white text-3xl animate-pulse hover:scale-110 transition-transform drop-shadow-lg"
              >
                {salva ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </button>
            </div>

            {/* Conteúdo da notícia */}
            <div
              className="relative z-10 w-full px-6 py-12 text-left space-y-4 backdrop-blur-sm cursor-pointer"
              onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
                {noticia.title}
              </h1>
              <div className="text-sm text-gray-300 flex flex-col gap-1 font-light">
                {noticia.source && <span>{noticia.source}</span>}
                {noticia.readingTime && <span>Tempo de leitura: {noticia.readingTime}</span>}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
