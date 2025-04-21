import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const FILTER_ICONS = {
  boa: {
    filled: "bi bi-emoji-smile-fill text-green-500",
    outline: "bi bi-emoji-smile text-green-500",
  },
  neutra: {
    filled: "bi bi-emoji-neutral-fill text-yellow-400",
    outline: "bi bi-emoji-neutral text-yellow-400",
  },
  ruim: {
    filled: "bi bi-emoji-frown-fill text-red-500",
    outline: "bi bi-emoji-frown text-red-500",
  },
};

const CLASSIFICATION_ICONS = {
  boa: "bi bi-emoji-smile text-green-500",
  neutra: "bi bi-emoji-neutral text-yellow-400",
  ruim: "bi bi-emoji-frown text-red-500",
};

const SOURCE_COLORS = {
  boa: "bg-green-500",
  neutra: "bg-yellow-400",
  ruim: "bg-red-500",
};

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ boa: true, neutra: false, ruim: false });
  const observer = useRef();

  const navigate = useNavigate();
  const location = useLocation();

  const fetchNoticias = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://boas-noticias-frontend.vercel.app/api/boas-noticias?page=${page}`);
      const noticiasComTempo = response.data.noticias.map((noticia) => ({
        ...noticia,
        readingTime: calcularTempoLeitura(noticia.content),
      }));

      setNoticias((prev) => [
        ...prev,
        ...noticiasComTempo.filter(n => !prev.map(p => p.link).includes(n.link))
      ]);

      setHasMore(noticiasComTempo.length > 0);
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias(page);
  }, [page]);

  const lastNoticiaRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      }, {
        rootMargin: "200px" // Adjust the margin to trigger loading earlier
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const toggleSalvarNoticia = (noticia) => {
    const jaSalva = salvas.find((n) => n.link === noticia.link);
    const atualizadas = jaSalva
      ? salvas.filter((n) => n.link !== noticia.link)
      : [...salvas, noticia];

    setSalvas(atualizadas);
    localStorage.setItem("noticiasSalvas", JSON.stringify(atualizadas));
  };

  const toggleFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
    setPage(1); // Reset page to 1 when filters change
    setHasMore(true);
    setNoticias([]); // Clear noticias when filters change
    fetchNoticias(1); // Fetch noticias again with new filters
  };

  const filteredNoticias = noticias.filter(
    (n) => filters[n.category.toLowerCase()]
  );

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-y-scroll">
      {/* Menu superior centralizado */}
      <div className="flex justify-center items-center py-3 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex space-x-8 text-lg">
          {Object.keys(filters).map((key) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className="flex items-center gap-2 hover:underline"
            >
              <i
                className={
                  filters[key]
                    ? FILTER_ICONS[key].filled
                    : FILTER_ICONS[key].outline
                }
              ></i>
              <span className="text-base capitalize">
                {key === "ruim" ? "Ruins" : `${key}s`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de notícias */}
      <div className="flex-1 overflow-y-auto snap-y snap-mandatory">
        {filteredNoticias.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white">
            {loading ? "Carregando..." : "Nenhuma notícia encontrada."}
          </div>
        ) : (
          filteredNoticias.map((noticia, index) => {
            const isLast = index === filteredNoticias.length - 1;
            const salva = salvas.find((n) => n.link === noticia.link);

            return (
              <motion.div
                key={noticia.link}
                ref={isLast ? lastNoticiaRef : null}
                className="w-full h-screen snap-start relative cursor-pointer flex flex-col justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                onClick={() => navigate(`/noticia/${encodeURIComponent(noticia.link)}`)}
                style={{
                  backgroundImage: noticia.image ? `url(${noticia.image})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: noticia.image ? "transparent" : SOURCE_COLORS[noticia.category],
                }}
              >
                {/* Sobreposição escura para leitura do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />

                {/* Botão de salvar */}
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

                {/* Informações da notícia */}
                <div className="absolute bottom-4 left-4 z-20 w-full px-6 py-4 text-left space-y-2 backdrop-blur-sm">
                  <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
                    {noticia.title}
                  </h1>
                  <div className="text-sm flex flex-col gap-1 font-light">
                    <div className="flex items-center gap-2">
                      <i className={CLASSIFICATION_ICONS[noticia.category]}></i>
                      <span>{noticia.category === "boa" ? "Notícia boa" : noticia.category === "neutra" ? "Notícia neutra" : "Notícia ruim"}</span>
                    </div>
                    {noticia.source && <span>Fonte: {noticia.source}</span>}
                    {noticia.readingTime && (
                      <span>
                        <i className="bi bi-stopwatch"></i> Tempo de leitura: {noticia.readingTime}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Menu inferior centralizado */}
      <div className="flex justify-center items-center py-3 bg-black/80 z-50 backdrop-blur">
        <div className="flex space-x-8 text-lg text-white">
          <Link
            to="/"
            className="flex items-center gap-2 hover:underline"
          >
            <i className="bi bi-house text-xl"></i>
            <span className="text-base">Início</span>
          </Link>
          <Link
            to="/noticias-salvas"
            className="flex items-center gap-2 hover:underline"
          >
            <i className="bi bi-bookmarks text-xl"></i>
            <span className="text-base">Salvas</span>
          </Link>
        </div>
      </div>

      {/* Skeleton loader */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl shadow-md"
            >
              <div className="h-48 bg-zinc-300 dark:bg-zinc-700 rounded mb-4"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de fim de conteúdo */}
      {!hasMore && !loading && (
        <div className="flex items-center justify-center h-screen text-white">
          Não há mais notícias para carregar.
        </div>
      )}
    </div>
  );
}
