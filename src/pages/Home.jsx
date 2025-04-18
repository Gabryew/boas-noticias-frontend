import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
        console.log("Resposta da API:", response.data);
        const noticiasComTempo = response.data.noticias.map((noticia) => {
          console.log("Notícia recebida:", noticia); // Adicione este log
          console.log("Imagem da notícia:", noticia.image); // debug
          return {
            ...noticia,
            readingTime: calcularTempoLeitura(noticia.content), // Corrigido para noticia.content
          };
        });
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

      {noticias.length === 0 ? (
        <div className="flex items-center justify-center h-screen text-white">
          Nenhuma notícia encontrada.
        </div>
      ) : (
        noticias.map((noticia, index) => {
          const salva = salvas.find((n) => n.link === noticia.link);

          return (
            <motion.div
              key={noticia.link}
              className="w-full h-full snap-start relative cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
              style={{
                backgroundImage: noticia.image ? `url(${noticia.image})` : 'none', // Use 'none' em vez de undefined
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Log para verificar a URL da imagem aplicada */}
              {noticia.image && console.log(`Aplicando imagem de fundo: ${noticia.image}`)}

              {/* Sobrepor a imagem com fundo escuro para visibilidade do texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />

              {/* Ícone de salvar */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSalvarNoticia(noticia);
                  }}
                  aria-label={salva ? "Remover dos favoritos" : "Salvar nos favoritos"}
                  className="text-white text-4xl hover:scale-110 transition-transform drop-shadow-lg"
                >
                  {salva ? (
                    <i className="bi bi-bookmark-heart-fill text-red-500"></i>
                  ) : (
                    <i className="bi bi-bookmark-heart"></i>
                  )}
                </button>
              </div>

              {/* Título e fonte */}
              <div className="absolute bottom-12 left-4 z-20 w-full px-6 py-4 text-left space-y-2 backdrop-blur-sm">
                <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
                  {noticia.title}
                </h1>
                <div className="text-sm flex flex-col gap-1 font-light">
                  {noticia.source && <span>Fonte: {noticia.source}</span>}
                  {noticia.readingTime && <span>⏱️ Tempo de leitura: {noticia.readingTime}</span>}
                </div>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Debug - quantas notícias foram renderizadas */}
      {!loading && noticias.length > 0 && (
        <div className="fixed bottom-4 left-4 text-xs text-green-400 z-50">
          Renderizando {noticias.length} notícias.
        </div>
      )}
    </div>
  );
}
