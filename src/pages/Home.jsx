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
  const [sourceFilters, setSourceFilters] = useState({});
  const [showSourceMenu, setShowSourceMenu] = useState(false);
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

      // Verifica se a notícia já existe antes de adicionar
      setNoticias((prev) => {
        const existingLinks = new Set(prev.map(n => n.link));
        const newNoticias = noticiasComTempo.filter(n => !existingLinks.has(n.link));
        return [...prev, ...newNoticias];
      });

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

  useEffect(() => {
    // Initialize source filters with all sources checked
    const allSources = ["G1", "BBC"]; // Add all your sources here
    setSourceFilters(allSources.reduce((acc, source) => {
      acc[source] = true;
      return acc;
    }, {}));
  }, []);

  const lastNoticiaRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
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

  const toggleSourceFilter = (source) => {
    setSourceFilters((prev) => ({ ...prev, [source]: !prev[source] }));
    setPage(1); // Reset page to 1 when source filters change
    setHasMore(true);
    setNoticias([]); // Clear noticias when source filters change
    fetchNoticias(1); // Fetch noticias again with new source filters
  };

  const filteredNoticias = noticias.filter(
    (n) => filters[n.category] && sourceFilters[n.source]
  );

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">
      {/* Menu superior */}
      <div className="flex justify-between items-center px-4 py-6 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex gap-6 text-lg font-semibold">
          <Link
            to="/"
            className={`flex items-center gap-2 hover:underline ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}
          >
            <i className="bi bi-house-fill"></i> Início
          </Link>
          <Link
            to="/noticias-salvas"
            className={`flex items-center gap-2 hover:underline ${location.pathname === "/noticias-salvas" ? "text-white" : "text-gray-400"}`}
          >
            <i className="bi bi-bookmarks"></i> Salvas
          </Link>
        </div>
        <div className="flex space-x-3 items-center">
          {Object.keys(filters).map((key) => (
            <div key={key} className="flex flex-col items-center">
              <button onClick={() => toggleFilter(key)}>
                <i
                  className={
                    filters[key]
                      ? FILTER_ICONS[key].filled
                      : FILTER_ICONS[key].outline
                  }
                ></i>
              </button>
              <span className="text-xs mt-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </div>
          ))}
          <div className="relative">
            <button onClick={() => setShowSourceMenu(!showSourceMenu)} className="flex flex-col items-center">
              <i className="bi bi-list-check text-white"></i>
              <span className="text-xs mt-1">Fontes</span>
            </button>
            {showSourceMenu && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-50">
                {Object.keys(sourceFilters).map((source) => (
                  <div key={source} className="flex items-center px-4 py-2 hover:bg-gray-200">
                    <button onClick={() => toggleSourceFilter(source)}>
                      <i className={sourceFilters[source] ? "bi bi-check-circle-fill text-green-500" : "bi bi-check-circle text-gray-500"}></i>
                    </button>
                    <span className="ml-2">{source}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de notícias */}
      {filteredNoticias.length === 0 ? (
        <div className="flex items-center justify-center h-screen text-white">
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
              className="w-full h-full snap-start relative cursor-pointer"
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
              <div className="absolute top-16 right-4 z-20">
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
              <div className="absolute bottom-12 left-4 z-20 w-full px-6 py-4 text-left space-y-2 backdrop-blur-sm">
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
