import { useEffect, useState } from "react";
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
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ boa: true, neutra: false, ruim: false });

  const navigate = useNavigate();
  const location = useLocation();

  const fetchNoticias = async (cursorValue) => {
    if (loading || !hasMore || cursorValue === undefined) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://boas-noticias-frontend.vercel.app/api/boas-noticias?cursor=${cursorValue}`);
      const novasNoticias = response.data.noticias.map((noticia) => ({
        ...noticia,
        readingTime: calcularTempoLeitura(noticia.content),
      }));

      setNoticias((prev) => [
        ...prev,
        ...novasNoticias.filter((n) => !prev.map((p) => p.id).includes(n.id)),
      ]);
      setHasMore(novasNoticias.length > 0);
      setCursor(response.data.nextCursor || null);
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSalvarNoticia = (noticia) => {
    const jaSalva = salvas.find((n) => n.id === noticia.id);
    const atualizadas = jaSalva ? salvas.filter((n) => n.id !== noticia.id) : [...salvas, noticia];
    setSalvas(atualizadas);
    localStorage.setItem("noticiasSalvas", JSON.stringify(atualizadas));
  };

  const toggleFilter = (type) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
    setCursor(null);
    setHasMore(true);
    setNoticias([]);
  };

  const filteredNoticias = noticias.filter((n) => filters[n.category.toLowerCase()]);

  useEffect(() => {
    if (cursor === null) {
      fetchNoticias('');
    }
  }, [cursor]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    const buffer = 500; // Carrega mais 300px antes do fim
    if (scrollTop + clientHeight >= scrollHeight - buffer && hasMore && !loading) {
      fetchNoticias(cursor);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 sticky top-0 z-50 backdrop-blur" style={{ height: '60px' }}>
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

      <div
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{ height: 'calc(100vh - 60px)' }}
        onScroll={handleScroll}
      >
        {filteredNoticias.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white">
            {loading ? "Carregando..." : "Nenhuma notícia encontrada."}
          </div>
        ) : (
          filteredNoticias.map((noticia, index) => {
            const salva = salvas.find((n) => n.id === noticia.id);

            return (
              <motion.div
                key={noticia.id}
                className="w-full h-[calc(100vh-60px)] snap-start relative cursor-pointer flex flex-col justify-end"
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
    </div>
  );
}
