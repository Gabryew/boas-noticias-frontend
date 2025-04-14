import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Noticia() {
  const { link } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const progressRef = useRef(null);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.link === decodeURIComponent(link));
        setNoticia(noticiaEncontrada);
      } catch (error) {
        console.error("Erro ao buscar notícia:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [link]);

  useEffect(() => {
    if (noticia && noticia.content) {
      const utterance = new SpeechSynthesisUtterance(noticia.content);
      utterance.lang = "pt-BR";
      utterance.onend = () => setIsPlaying(false);
      setAudio(utterance);
    }
  }, [noticia]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      if (progressRef.current) {
        progressRef.current.style.width = `${scrollPercent}%`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const togglePlay = () => {
    if (!audio) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.speak(audio);
      setIsPlaying(true);
    }
  };

  const getTempoDeLeitura = (texto) => {
    const palavras = texto.trim().split(/\s+/).length;
    const minutos = Math.ceil(palavras / 200);
    return minutos;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="text-white p-8">
        <p>Notícia não encontrada.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-white text-black px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen px-6 py-8 space-y-6">
      <div ref={progressRef} className="h-1 bg-white fixed top-0 left-0 z-50" />

      <h1 className="text-3xl md:text-4xl font-bold">{noticia.title}</h1>

      <div className="text-sm text-gray-300 flex gap-4">
        <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
        {noticia.author && <span>Por {noticia.author}</span>}
        {noticia.source && <span>{noticia.source}</span>}
      </div>

      {noticia.image && (
        <img
          src={noticia.image}
          alt={noticia.title}
          className="w-full h-auto rounded-xl"
        />
      )}

      {/* Tempo de leitura */}
      <p className="text-sm text-gray-400">
        ⏱️ Tempo de leitura: {getTempoDeLeitura(noticia.content)} mins
      </p>

      {/* Player de áudio */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          {isPlaying ? "⏸️ Pausar" : "▶️ Ouvir a notícia"}
        </button>
      </div>

      {/* Conteúdo */}
      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: noticia.content }} />

      {/* Ações */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate("/")}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Voltar
        </button>
        <a
          href={noticia.link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-300 transition text-center"
        >
          Ler no site original
        </a>
      </div>
    </div>
  );
}
