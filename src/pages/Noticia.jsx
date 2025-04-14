import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function Noticia() {
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [relatedNews, setRelatedNews] = useState([]);
  const { link } = useParams();
  const navigate = useNavigate();

  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    async function fetchNoticia() {
      try {
        const response = await axios.get("https://boas-noticias-frontend.vercel.app/api/boas-noticias");
        const noticiaEncontrada = response.data.find((n) => n.link === link);

        if (noticiaEncontrada) {
          setNoticia(noticiaEncontrada);
          const outras = response.data.filter((n) => n.link !== link).slice(0, 3);
          setRelatedNews(outras);
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (noticia) {
      const utterance = new SpeechSynthesisUtterance(noticia.summary);
      utterance.lang = "pt-BR";
      const newAudio = new Audio();
      window.speechSynthesis.cancel();
      setAudio(utterance);
    }
  }, [noticia]);

  const playAudio = () => {
    const synth = window.speechSynthesis;
    synth.speak(audio);
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const calcularTempoLeitura = (texto) => {
    const palavras = texto.split(" ").length;
    const minutos = Math.ceil(palavras / 200);
    return minutos;
  };

  const compartilharNoticia = () => {
    if (navigator.share) {
      navigator
        .share({
          title: noticia.title,
          text: noticia.summary,
          url: noticia.link,
        })
        .then(() => console.log("Notícia compartilhada com sucesso!"))
        .catch((error) => console.error("Erro ao compartilhar a notícia:", error));
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando notícia...
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
      <div
        className="fixed top-0 left-0 h-1 bg-blue-500 z-50"
        style={{ width: `${progress}%` }}
      />

      <div
        className="h-64 md:h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${noticia.image || "default-image.jpg"})` }}
      />

      <motion.div
        className="max-w-3xl mx-auto p-6 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {noticia.title}
          </h1>
          <div className="text-sm text-gray-400 flex gap-4 flex-wrap">
            <span>{new Date(noticia.pubDate).toLocaleDateString()}</span>
            {noticia.author && <span>Por {noticia.author}</span>}
            {noticia.source && <span>Fonte: {noticia.source}</span>}
          </div>
          <div className="text-sm text-gray-300 mt-2">⏱️ Tempo de leitura: {calcularTempoLeitura(noticia.summary)} mins</div>

          {/* Player de Áudio */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="bg-white text-black px-4 py-2 rounded-xl"
            >
              {isPlaying ? "⏸️ Pausar" : "▶️ Ouvir a Notícia"}
            </button>
            <span className="text-sm text-gray-300">{formatTime(currentTime)}</span>
          </div>
        </div>

        <motion.div
          className="prose prose-invert prose-p:leading-relaxed prose-p:mb-4 max-w-none text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {noticia.summary.split("\n").map((par, i) => (
            <p key={i}>{par.trim()}</p>
          ))}
        </motion.div>

        {/* Ações */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <a
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto text-center"
          >
            Ler no site original
          </a>
          <button
            onClick={compartilharNoticia}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto"
          >
            Compartilhar
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition w-full md:w-auto"
          >
            Voltar para a Home
          </button>
        </div>

        {/* Outras Notícias */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Outras Notícias</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedNews.map((n, idx) => (
              <div
                key={idx}
                className="cursor-pointer bg-gray-900 p-4 rounded-xl hover:bg-gray-800 transition"
                onClick={() => navigate(`/noticia/${n.link}`)}
              >
                {n.image && (
                  <img src={n.image} alt="thumb" className="w-full h-40 object-cover rounded mb-3" />
                )}
                <h3 className="text-lg font-semibold leading-snug">{n.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
