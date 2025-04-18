import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ boa: true, neutra: false, ruim: false });
  const observer = useRef();

  const fetchNoticias = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`https://boas-noticias-frontend.vercel.app/api/boas-noticias?page=${page}`);
      const data = await response.json();
      const noticias = data.noticias; // Acessa a propriedade correta
      if (Array.isArray(noticias)) {
        if (noticias.length === 0) {
          setHasMore(false);
        } else {
          setNoticias((prev) => [...prev, ...noticias]);
        }
      } else {
        console.warn("Formato inesperado:", data);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erro ao carregar notícias:", err);
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
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const toggleFilter = (type) => {
    setNoticias([]);
    setPage(1);
    setHasMore(true);
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredNoticias = noticias.filter(
    (n) => filters[n.classification] === true
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pt-20 px-4">
      {/* Menu superior com filtros */}
      <div className="fixed top-0 left-0 w-full z-10 bg-white dark:bg-zinc-900 shadow px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Boas Notícias</h1>
        <div className="flex space-x-3">
          {Object.keys(filters).map((key) => (
            <button key={key} onClick={() => toggleFilter(key)}>
              <i
                className={
                  filters[key]
                    ? FILTER_ICONS[key].filled
                    : FILTER_ICONS[key].outline
                }
              ></i>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de notícias */}
      <div className="space-y-6 mt-6">
        {filteredNoticias.map((noticia, index) => {
          const isLast = index === filteredNoticias.length - 1;
          return (
            <motion.div
              key={noticia.link}
              ref={isLast ? lastNoticiaRef : null}
              className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {noticia.image && (
                <img
                  src={noticia.image}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <Link
                  to={`/noticia/${encodeURIComponent(noticia.link)}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {noticia.title}
                </Link>

                {/* Classificação */}
                <div className="mt-1 text-sm">
                  {noticia.classification === "boa" && (
                    <i className="bi bi-emoji-smile text-green-500">
                      {" "}
                      Notícia boa
                    </i>
                  )}
                  {noticia.classification === "neutra" && (
                    <i className="bi bi-emoji-neutral text-yellow-400">
                      {" "}
                      Notícia neutra
                    </i>
                  )}
                  {noticia.classification === "ruim" && (
                    <i className="bi bi-emoji-frown text-red-500">
                      {" "}
                      Notícia ruim
                    </i>
                  )}
                </div>

                {/* Tempo de leitura */}
                <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                  <i className="bi bi-stopwatch mr-1"></i>
                  Tempo de leitura: {noticia.tempoDeLeitura}
                </div>

                {/* Autor e veículo */}
                <div className="text-xs text-zinc-500 mt-2">
                  {noticia.autor} ({noticia.fonte})
                </div>
              </div>
            </motion.div>
          );
        })}

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
      </div>
    </div>
  );
}
