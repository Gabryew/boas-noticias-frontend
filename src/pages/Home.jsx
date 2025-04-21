import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const ICONS = {
  boa: { filled: "bi bi-emoji-smile-fill text-green-500", outline: "bi bi-emoji-smile text-green-500" },
  neutra: { filled: "bi bi-emoji-neutral-fill text-yellow-400", outline: "bi bi-emoji-neutral text-yellow-400" },
  ruim: { filled: "bi bi-emoji-frown-fill text-red-500", outline: "bi bi-emoji-frown text-red-500" },
};

const COLORS = {
  boa: "bg-green-500",
  neutra: "bg-yellow-400",
  ruim: "bg-red-500",
};

const calcularTempoLeitura = (texto) => {
  if (!texto) return null;
  const palavras = texto.trim().split(/\s+/).length;
  const minutos = Math.ceil(palavras / 200);
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
};

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salvas, setSalvas] = useState(() => JSON.parse(localStorage.getItem("noticiasSalvas")) || []);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ boa: true, neutra: false, ruim: false });
  const observer = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNoticias = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://boas-noticias-frontend.vercel.app/api/boas-noticias?cursor=${cursor}`);
      const novasNoticias = response.data.noticias.map((noticia) => ({
        ...noticia,
        readingTime: calcularTempoLeitura(noticia.content),
      }));

      // Log para verificar o que estamos recebendo
      console.log("Notícias recebidas:", novasNoticias);

      setNoticias((prev) => [
        ...prev,
        ...novasNoticias.filter((n) => !prev.map((p) => p.id).includes(n.id)),
      ]);
      setHasMore(novasNoticias.length > 0);
      setCursor(response.data.nextCursor || 0); // Se o próximo cursor for nulo, manter como 0
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
    } finally {
      setLoading(false);
    }
  };

  const lastNoticiaRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchNoticias();
          }
        },
        { rootMargin: "200px" }
      );
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  const toggleSalvarNoticia = (noticia) => {
    const jaSalva = salvas.find((n) => n.id === noticia.id);
    const atualizadas = jaSalva ? salvas.filter((n) => n.id !== noticia.id) : [...salvas, noticia];
    setSalvas(atualizadas);
    localStorage.setItem("noticiasSalvas", JSON.stringify(atualizadas));
  };

  const toggleFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
    setCursor(0); // Reset cursor para o início
    setHasMore(true);
    setNoticias([]);
  };

  const filteredNoticias = noticias.filter((n) => filters[n.category.toLowerCase()]);

  useEffect(() => {
    fetchNoticias();
  }, [cursor]); // Depende apenas do cursor

  useEffect(() => {
    if (!hasMore && !loading) {
      console.log("Não há mais notícias para carregar.");
    }
  }, [hasMore, loading]);

  if (loading && cursor === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-y-scroll">
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex space-x-6">
          <Link
            to="/"
            className={`flex items-center gap-2 hover:underline ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}
          >
            <i className="bi bi-house-fill"></i>
            <span>Início</span>
          </Link>
          <Link
            to="/noticias-salvas"
            className={`flex items-center gap-2 hover:underline ${location.pathname === "/noticias-salvas" ? "text-white" : "text-gray-400"}`}
          >
            <i className="bi bi-bookmarks-fill"></i>
            <span>Salvas</span>
          </Link>
        </div>
        <div className="flex space-x-8 text-lg">
          {Object.keys(filters).map((key) => (
            <button key={key} onClick={() => toggleFilter(key)} className="hover:underline">
              <i className={filters[key] ? ICONS[key].filled : ICONS[key].outline}></i>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto snap-y snap-mandatory">
        {filteredNoticias.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white">
            {loading ? "Carregando..." : "Nenhuma notícia encontrada."}
          </div>
        ) : (
          filteredNoticias.map((noticia, index) => {
            const isLast = index === filteredNoticias.length - 1;
            const salva = salvas.find((n) => n.id === noticia.id);

            return (
              <motion.div
                key={noticia.id}
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
                  backgroundColor: noticia.image ? "transparent" : COLORS[noticia.category],
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSalvarNoticia(noticia);
                    }}
                    aria-label={salva ? "Remover dos favoritos" : "Salvar nos favoritos"}
                    className="text-white text-4xl hover:scale-110 transition-transform drop-shadow-lg"
                  >
                    {salva ? <i className="bi bi-bookmark-heart-fill text-red-500"></i> : <i className="bi bi-bookmark-heart"></i>}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 z-20 w-full px-6 py-4 text-left space-y-2 backdrop-blur-sm">
                  <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg">{noticia.title}</h1>
                  <div className="text-sm flex flex-col gap-1 font-light">
                    <div className="flex items-center gap-2">
                      <i className={ICONS[noticia.category].outline}></i>
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

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl shadow-md">
              <div className="h-48 bg-zinc-300 dark:bg-zinc-700 rounded mb-4"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {!hasMore && !loading && (
        <div className="flex items-center justify-center h-screen text-white">
          Não há mais notícias para carregar.
        </div>
      )}
    </div>
  );
}
