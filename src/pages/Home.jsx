import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Filtros from "../components/Filtros";
import CardNoticia from "../components/CardNoticia";

function calcularTempoLeitura(texto) {
  if (!texto) return null;
  const palavras = texto.trim().split(/\s+/).length;
  const palavrasPorMinuto = 200;
  const minutos = Math.ceil(palavras / palavrasPorMinuto);
  return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
}

export default function Home() {
  const [noticias, setNoticias] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [salvas, setSalvas] = useState(() => {
    const local = localStorage.getItem("noticiasSalvas");
    return local ? JSON.parse(local) : [];
  });
  const [filter, setFilter] = useState({ good: true, neutral: true, bad: true });

  const observerRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNoticias = useCallback(async () => {
    try {
      setCarregando(true);
      const response = await axios.get(`https://boas-noticias-frontend.vercel.app/api/boas-noticias`);
      const novas = response.data
        .map((noticia) => ({
          ...noticia,
          tempoLeitura: calcularTempoLeitura(noticia.summary),
        }))
        .filter((_, i) => i < pagina * 6); // 6 por página
      setNoticias(novas);
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
    } finally {
      setCarregando(false);
    }
  }, [pagina]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const toggleSalvarNoticia = (noticia) => {
    const jaSalva = salvas.find((n) => n.link === noticia.link);
    const atualizadas = jaSalva
      ? salvas.filter((n) => n.link !== noticia.link)
      : [...salvas, noticia];
    setSalvas(atualizadas);
    localStorage.setItem("noticiasSalvas", JSON.stringify(atualizadas));
  };

  const handleFilterChange = (type) => {
    setFilter((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredNoticias = noticias.filter((noticia) => {
    if (noticia.classification === "good" && filter.good) return true;
    if (noticia.classification === "neutral" && filter.neutral) return true;
    if (noticia.classification === "bad" && filter.bad) return true;
    return false;
  });

  const observer = useRef();
  const ultimaNoticiaRef = useCallback((node) => {
    if (carregando) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPagina((prev) => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [carregando]);

  return (
    <div className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">
      <div className="flex justify-between items-center px-4 py-3 bg-black/80 sticky top-0 z-50 backdrop-blur">
        <div className="flex gap-4 text-sm font-semibold">
          <Link
            to="/"
            className={`hover:underline ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}
          >
            Últimas
          </Link>
          <Link
            to="/noticias-salvas"
            className={`hover:underline ${location.pathname === "/noticias-salvas" ? "text-white" : "text-gray-400"}`}
          >
            Salvas
          </Link>
        </div>
        <Filtros filter={filter} onChange={handleFilterChange} />
      </div>

      {filteredNoticias.length === 0 && !carregando ? (
        <div className="flex items-center justify-center h-screen text-white">
          Nenhuma notícia encontrada.
        </div>
      ) : (
        filteredNoticias.map((noticia, index) => {
          const salva = salvas.find((n) => n.link === noticia.link);
          const isLast = index === filteredNoticias.length - 1;

          return (
            <CardNoticia
              key={noticia.link}
              noticia={noticia}
              salva={salva}
              toggleSalvarNoticia={toggleSalvarNoticia}
              isLast={isLast}
              ultimaNoticiaRef={ultimaNoticiaRef}
            />
          );
        })
      )}

      {carregando && (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3/4 h-32 bg-gray-800 animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
