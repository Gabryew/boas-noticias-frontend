import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [link]);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.link === link);
        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
          calcularTempoLeitura(noticiaEncontrada.summary);

          const outras = response.data
            .filter((n) => n.link !== link)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
          setOutrasNoticias(outras);

          // Verifica se a notícia já foi salva
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
    const palavras = texto.split(/\s+/).length;
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

      <div
        className="h-64 md:h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${noticia.image || "default-image.jpg"})`,
        }}
      />

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {noticia.title}
          </h1>
          <div className="text-sm text-gray-400 flex gap-4 flex-wrap">
            <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
            {noticia.author && <span>Por {noticia.author}</span>}
            {noticia.source && <span>Fonte: {noticia.source}</span>}
          </div>
        </div>

        {/* Botões de Compartilhar e Salvar */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={compartilharNoticia}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-share"
              viewBox="0 0 16 16"
            >
              <path d="M8 12a.5.5 0 0 1 .5-.5h4.5v-9H8a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h5V3H8a.5.5 0 0 1-.5-.5V2z" />
            </svg>
            Compartilhar
          </button>

          <button
            onClick={noticiaSalva ? removerNoticia : salvarNoticia}
            className={`bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-heart"
              viewBox="0 0 16 16"
            >
              <path d="M8 12s3-3.37 5-5c1.5-1.5 2-2.5 2-3.5C15 2 13 1 11 1c-1 0-2 1-3 3C7 3 6 2 5 1 3 1 1 2 1 3.5c0 1 .5 2 2 3.5C5 8.63 8 12 8 12z" />
            </svg>
            {noticiaSalva ? "Remover" : "Salvar"}
          </button>
        </div>

        <p className="text-sm text-gray-300">⏱️ Tempo de leitura: {tempoLeitura} mins</p>

        <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg">
          {noticia.summary
            .split("\n")
            .map((par, i) => <p key={i}>{par.trim()}</p>)}
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/10 mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto"
          >
            Voltar
          </button>

          <a
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto text-center"
          >
            Ler no site original
          </a>
        </div>
      </div>

      {outrasNoticias.length > 0 && (
        <div className="max-w-6xl mx-auto p-6 mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Outras notícias para você</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {outrasNoticias.map((outra, i) => (
              <div
                key={i}
                onClick={() => navigate(`/noticia/${encodeURIComponent(outra.link)}`)}
                className="cursor-pointer group"
              >
                <div
                  className="h-40 bg-cover bg-center rounded-xl mb-2"
                  style={{ backgroundImage: `url(${outra.image || "default-image.jpg"})` }}
                />
                <p className="group-hover:underline">{outra.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
