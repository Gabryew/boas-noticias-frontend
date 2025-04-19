import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function Noticia() {
  const [noticia, setNoticia] = useState(null);
  const [outrasNoticias, setOutrasNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempoLeitura, setTempoLeitura] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [noticiaSalva, setNoticiaSalva] = useState(false);
  const { link } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [link]);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.noticias.find((n) => n.link === link);

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
          calcularTempoLeitura(noticiaEncontrada.summary || "");

          const outras = response.data.noticias
            .filter((n) => n.link !== link)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setOutrasNoticias(outras);

          const noticiasSalvas = JSON.parse(localStorage.getItem("noticiasSalvas")) || [];
          if (noticiasSalvas.some((n) => n.link === noticiaEncontrada.link)) {
            setNoticiaSalva(true);
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Erro ao buscar a notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link, navigate]);

  const calcularTempoLeitura = (texto) => {
    const palavras = texto?.trim().split(/\s+/).length || 0;
    const minutos = Math.ceil(palavras / 200);
    setTempoLeitura(minutos);
  };

  const compartilharNoticia = () => {
    if (navigator.share) {
      navigator.share({
        title: noticia.title,
        text: noticia.summary,
        url: noticia.link,
      });
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  };

  const salvarNoticia = () => {
    const noticiasSalvas = JSON.parse(localStorage.getItem("noticiasSalvas")) || [];
    if (!noticiasSalvas.some((n) => n.link === noticia.link)) {
      noticiasSalvas.push(noticia);
      localStorage.setItem("noticiasSalvas", JSON.stringify(noticiasSalvas));
      setNoticiaSalva(true);
    }
  };

  const removerNoticia = () => {
    const noticiasSalvas = JSON.parse(localStorage.getItem("noticiasSalvas")) || [];
    const novasNoticias = noticiasSalvas.filter((n) => n.link !== noticia.link);
    localStorage.setItem("noticiasSalvas", JSON.stringify(novasNoticias));
    setNoticiaSalva(false);
  };

  const formatarTempo = (segundos) => {
    const min = String(Math.floor(segundos / 60)).padStart(2, "0");
    const sec = String(Math.floor(segundos % 60)).padStart(2, "0");
    return `${min}:${sec}`;
  };

  useEffect(() => {
    const atualizarBarra = () => {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        setProgresso(scrollPercent);
      });
    };

    window.addEventListener("scroll", atualizarBarra);
    return () => window.removeEventListener("scroll", atualizarBarra);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Notícia não encontrada.
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
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

      <div
        className="h-64 md:h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${noticia.image || "default-image.jpg"})`,
        }}
      />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow-lg">{noticia.title}</h1>
          <div className="text-sm text-gray-400 flex gap-4 flex-wrap">
            <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
            {noticia.author && <span>Por {noticia.author}</span>}
            {noticia.source && <span>Fonte: {noticia.source}</span>}
          </div>
        </div>

        <p className="text-sm text-gray-300">
          <i className="bi bi-stopwatch"></i> Tempo de leitura: {tempoLeitura} min
        </p>

        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/10 mt-6">
          <button
            onClick={compartilharNoticia}
            className="bg-transparent hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto flex items-center justify-center gap-2"
          >
            <i className="bi bi-share text-lg"></i> Compartilhar
          </button>

          <button
            onClick={noticiaSalva ? removerNoticia : salvarNoticia}
            className="bg-transparent hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto flex items-center justify-center gap-2"
          >
            <i className={`bi ${noticiaSalva ? "bi-bookmark-heart-fill" : "bi-bookmark-heart"} text-lg`}></i>
            {noticiaSalva ? "Salvo" : "Salvar"}
          </button>
        </div>

        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg">
          {noticia.summary
            ? noticia.summary.split("\n").map((par, i) => <p key={i}>{par.trim()}</p>)
            : <p>Resumo não disponível.</p>}
        </div>

        {outrasNoticias.length > 0 && (
          <div className="pt-10 border-t border-white/10 mt-10">
            <h2 className="text-2xl font-bold mb-4">Outras Notícias</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {outrasNoticias.map((outra, i) => (
                <Link
                  key={i}
                  to={`/noticia/${encodeURIComponent(outra.link)}`}
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-xl transition block"
                >
                  {outra.image && (
                    <div
                      className="h-32 bg-cover bg-center mb-2 rounded-lg"
                      style={{ backgroundImage: `url(${outra.image})` }}
                    />
                  )}
                  <p className="text-sm text-gray-300 line-clamp-3">{outra.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-0 left-0 w-full h-1 bg-green-400 z-50" style={{ width: `${progresso}%` }} />
    </div>
  );
}
